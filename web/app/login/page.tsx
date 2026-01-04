"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Sign In</h1>
        <p className="mt-2 text-sm text-slate-600">
          Welcome to GrantFounders. Sign in to continue.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Authentication Error</p>
            <p className="mt-1 text-sm text-red-700">
              {errorDescription || error}
            </p>
          </div>
        )}

        <div className="mt-6">
          <p className="text-sm text-slate-500">
            Configure your OAuth providers in Supabase to enable social login.
          </p>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  )
}
