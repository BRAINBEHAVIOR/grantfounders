export default function DashboardPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">GF-777ACE Control Deck</h1>
        <p className="mt-2 text-sm text-slate-600">
          Monitor evaluations, API usage, and billing for the DIOS stack.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Kernel</p>
          <p className="text-lg font-semibold">GF-777ACE Quantum v3</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">API Calls (24h)</p>
          <p className="text-lg font-semibold">—</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Org Members</p>
          <p className="text-lg font-semibold">—</p>
        </div>
      </section>
    </main>
  )
}
