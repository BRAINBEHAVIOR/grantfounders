import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      {/* Background glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">GF-777ACE Kernel v3.0 Online</span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl text-balance">
            Win Federal Grants
            <span className="block text-primary">with AI Precision</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl text-pretty">
            GrantFounders analyzes your proposal against federal scoring criteria in seconds. 
            Know your approval odds before you apply. Trusted by 500+ startups to secure $47M+ in SBIR/STTR funding.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/onboarding"
              className="flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
            >
              Analyze My Proposal Free
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-4 text-base font-medium transition-colors hover:bg-muted"
            >
              View Demo Dashboard
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-col items-center gap-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Trusted by teams applying to</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
              <span className="text-lg font-semibold tracking-tight">NSF</span>
              <span className="text-lg font-semibold tracking-tight">NIH</span>
              <span className="text-lg font-semibold tracking-tight">DoD</span>
              <span className="text-lg font-semibold tracking-tight">DOE</span>
              <span className="text-lg font-semibold tracking-tight">NASA</span>
              <span className="text-lg font-semibold tracking-tight">USDA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
