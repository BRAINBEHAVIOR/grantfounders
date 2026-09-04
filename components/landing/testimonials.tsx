export function Testimonials() {
  const testimonials = [
    {
      quote: "GrantFounders showed us exactly why our first NSF submission failed. We fixed the gaps, resubmitted, and won $275K. The ROI is insane.",
      author: "Dr. Sarah Chen",
      role: "CEO, NeuraTech Labs",
      result: "NSF SBIR Phase I - $275K",
    },
    {
      quote: "We went from 3 failed DoD applications to 2 wins in one year. The compliance firewall alone saved us from fatal eligibility mistakes.",
      author: "Marcus Williams",
      role: "Founder, DefenseAI Systems",
      result: "DoD SBIR Phase II - $1.2M",
    },
    {
      quote: "The agency DNA matching is magic. GrantFounders pointed us to NIH instead of NSF - turns out our health AI fit their priorities perfectly.",
      author: "Dr. Emily Rodriguez",
      role: "CTO, MedInsight Health",
      result: "NIH STTR Phase I - $400K",
    },
  ]

  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Success Stories</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl text-balance">
            Founders winning real funding
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="flex flex-col rounded-xl border border-border bg-card p-6"
            >
              <blockquote className="flex-1 text-muted-foreground leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              <div className="mt-6 border-t border-border pt-6">
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                <p className="mt-2 inline-block rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {testimonial.result}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
