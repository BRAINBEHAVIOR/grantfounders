export function Stats() {
  const stats = [
    { value: "$47M+", label: "Funding Secured", description: "by our users" },
    { value: "89%", label: "Prediction Accuracy", description: "on grant outcomes" },
    { value: "500+", label: "Startups", description: "trust GrantFounders" },
    { value: "3 min", label: "Average Analysis", description: "per proposal" },
  ]

  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
