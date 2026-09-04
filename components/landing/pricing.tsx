import Link from "next/link"

export function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "Try the ACE Score engine with no commitment",
      features: [
        "3 proposal analyses per month",
        "Basic ACE Score breakdown",
        "Compliance checklist",
        "Email support",
      ],
      cta: "Start Free",
      href: "/signup",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$99",
      period: "per month",
      description: "For serious grant applicants and small teams",
      features: [
        "Unlimited proposal analyses",
        "Full 47-dimension breakdown",
        "Agency DNA matching",
        "Fix list with priority ranking",
        "ROI forecasting",
        "Autopilot draft generation",
        "Priority support",
      ],
      cta: "Start Pro Trial",
      href: "/signup?plan=pro",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For research institutions and grant consulting firms",
      features: [
        "Everything in Pro",
        "Dedicated kernel lanes",
        "Custom compliance rules",
        "Team collaboration",
        "API access",
        "SSO integration",
        "Dedicated success manager",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      href: "/contact",
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="border-t border-border bg-card py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl text-balance">
            Invest in your grant success
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            One successful SBIR Phase I pays for decades of GrantFounders. Start free, upgrade when you're ready to get serious.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-xl border p-8 ${
                tier.highlighted
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">/{tier.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                className={`mt-8 block rounded-lg px-4 py-3 text-center text-sm font-medium transition-colors ${
                  tier.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border bg-background hover:bg-muted"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          All plans include our money-back guarantee. If you don't improve your grant success rate, we'll refund you.
        </p>
      </div>
    </section>
  )
}
