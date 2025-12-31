import { NextResponse } from "next/server"

export const runtime = "nodejs"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET() {
  const health = {
    ok: true,
    data: {
      status: "healthy",
      version: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT || "unknown",
      kernel: "GF-777ACE",
      timestamp: new Date().toISOString(),
    },
  }

  return NextResponse.json(health, { headers: corsHeaders })
}
