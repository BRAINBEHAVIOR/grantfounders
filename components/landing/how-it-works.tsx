export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Upload Your Proposal",
      description: "Drop in your draft proposal, pitch deck, or just describe your project. Our AI extracts the key signals.",
    },
    {
      step: "02", 
      title: "Get Your ACE Score",
      description: "In under 3 minutes, receive your Approval Confidence Estimate with a breakdown across all 47 scoring dimensions.",
    },
    {
      step: "03",
      title: "Fix the Gaps",
      description: "Our fix list shows exactly what to improve. Compliance issues, weak sections, missing keywords - all prioritized by impact.",
    },
    {
      step: "04",
      title: "Submit with Confidence",
      description: "Apply knowing your score. Users with GREEN band scores have an 89% success rate with federal grants.",
    },
  ]

  return (
    <section id="how-it-works" className="border-y border-border bg-card py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">How It Works</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl text-balance">
            From draft to decision-ready in minutes
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute top-8 left-full hidden w-full border-t border-dashed border-border lg:block" />
              )}
              <div className="flex flex-col">
                <span className="text-5xl font-bold text-primary/20">{item.step}</span>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Demo card */}
        <div className="mt-16 rounded-xl border border-border bg-muted p-6 md:p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-12">
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">Live Demo</p>
              <h3 className="mt-2 text-2xl font-bold">See the ACE Score in action</h3>
              <p className="mt-2 text-muted-foreground">
                Watch how GrantFounders analyzed a real NSF SBIR Phase I proposal and identified 
                the exact improvements that led to a successful $275K award.
              </p>
              <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch 2-min Demo
              </button>
            </div>
            <div className="w-full md:w-96">
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">ACE Score</span>
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">GREEN</span>
                </div>
                <p className="mt-2 text-4xl font-bold">87<span className="text-lg text-muted-foreground">/100</span></p>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[87%] rounded-full bg-primary" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded bg-muted p-2">
                    <p className="font-medium">Technical</p>
                    <p className="text-primary">92%</p>
                  </div>
                  <div className="rounded bg-muted p-2">
                    <p className="font-medium">Commercial</p>
                    <p className="text-primary">84%</p>
                  </div>
                  <div className="rounded bg-muted p-2">
                    <p className="font-medium">Team</p>
                    <p className="text-primary">85%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
