export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-10 bg-background text-foreground">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">GrantFounders Decision API</h1>
        <div className="space-y-2">
          <p className="text-lg">
            Status: <span className="font-semibold text-green-600">ONLINE</span>
          </p>
          <p className="text-muted-foreground">Kernel: GF-777ACE v3.0</p>
        </div>
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm font-mono">POST /api/ace/score</p>
        </div>
      </div>
    </main>
  )
}
