import Link from "next/link"

export function CTA() {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-16">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl text-balance">
              Stop guessing. Start winning.
            </h2>
            <p className="mt-4 max-w-xl text-primary-foreground/80">
              Join 500+ founders who use GrantFounders to secure federal funding. 
              Your first 3 analyses are free - no credit card required.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-lg bg-background px-6 py-3 text-base font-semibold text-foreground transition-all hover:bg-background/90"
              >
                Get Your Free ACE Score
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-primary-foreground/80 underline underline-offset-4 hover:text-primary-foreground"
              >
                Talk to our team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
