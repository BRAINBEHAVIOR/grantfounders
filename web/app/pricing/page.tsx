const tiers = [
  {
    name: "Starter",
    price: "$0",
    description: "Sandbox access to GF-777ACE endpoints",
    features: ["1k requests/mo", "Basic analytics", "Community support"],
  },
  {
    name: "Pro",
    price: "$99",
    description: "Production-grade DIOS with metering",
    features: ["50k requests/mo", "Stripe billing", "SLA support"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Private kernel lanes and compliance",
    features: ["Dedicated tenant", "Custom SLAs", "Onboarding and training"],
  },
]

export default function PricingPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose a lane for GF-777ACE that matches your deployment stage.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div key={tier.name} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{tier.name}</h2>
            <p className="mt-1 text-2xl font-bold">{tier.price}</p>
            <p className="mt-2 text-sm text-slate-600">{tier.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {tier.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  )
}
