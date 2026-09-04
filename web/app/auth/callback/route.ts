import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getLogger } from "@/src/lib/logger"

export const runtime = "nodejs"

const logger = getLogger("auth-callback")

// Session cookie duration (7 days)
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Check for OAuth errors from Supabase
  if (error) {
    logger.error("OAuth callback error", { error, errorDescription })
    const redirectUrl = new URL("/login", requestUrl.origin)
    redirectUrl.searchParams.set("error", error)
    if (errorDescription) {
      redirectUrl.searchParams.set("error_description", errorDescription)
    }
    return NextResponse.redirect(redirectUrl)
  }

  // Validate authorization code is present
  if (!code) {
    logger.error("OAuth callback missing code parameter")
    const redirectUrl = new URL("/login", requestUrl.origin)
    redirectUrl.searchParams.set("error", "missing_code")
    redirectUrl.searchParams.set("error_description", "Authorization code not provided")
    return NextResponse.redirect(redirectUrl)
  }

  // Defensive check for environment variables
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error("Missing Supabase environment variables", {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
    })
    const redirectUrl = new URL("/login", requestUrl.origin)
    redirectUrl.searchParams.set("error", "server_error")
    redirectUrl.searchParams.set("error_description", "Server configuration error")
    return NextResponse.redirect(redirectUrl)
  }

  try {
    // Create Supabase client for auth operations
    // Note: We use ANON_KEY here (not SERVICE_ROLE_KEY from supabaseServer()) because:
    // 1. OAuth code exchange requires the same key that initiated the OAuth flow (ANON_KEY)
    // 2. SERVICE_ROLE_KEY has admin privileges and should not be used for user auth flows
    // 3. This follows Supabase's recommended pattern for OAuth callbacks
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })

    // Exchange authorization code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      logger.error("Failed to exchange code for session", {
        error: exchangeError.message,
        code: exchangeError.code,
      })
      const redirectUrl = new URL("/login", requestUrl.origin)
      redirectUrl.searchParams.set("error", "exchange_failed")
      redirectUrl.searchParams.set("error_description", exchangeError.message)
      return NextResponse.redirect(redirectUrl)
    }

    if (!data?.session) {
      logger.error("No session returned from code exchange")
      const redirectUrl = new URL("/login", requestUrl.origin)
      redirectUrl.searchParams.set("error", "no_session")
      redirectUrl.searchParams.set("error_description", "Failed to create session")
      return NextResponse.redirect(redirectUrl)
    }

    logger.info("OAuth callback successful", {
      userId: data.user?.id,
      email: data.user?.email,
    })

    // Create response with redirect to dashboard
    const redirectUrl = new URL("/dashboard", requestUrl.origin)
    const response = NextResponse.redirect(redirectUrl)

    // Set session tokens in httpOnly cookies for security
    // These cookies will be available server-side and protected from XSS
    response.cookies.set("sb-access-token", data.session.access_token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
    })
    response.cookies.set("sb-refresh-token", data.session.refresh_token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
    })

    return response
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    logger.error("Unexpected error in OAuth callback", { error: message })
    const redirectUrl = new URL("/login", requestUrl.origin)
    redirectUrl.searchParams.set("error", "unexpected_error")
    redirectUrl.searchParams.set("error_description", message)
    return NextResponse.redirect(redirectUrl)
  }
}
