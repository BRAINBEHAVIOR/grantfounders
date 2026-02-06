"use client"

import Link from "next/link"
import { useState } from "react"

/* ─── Inline SVG Icons ─── */
function IconZap({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}
function IconShield({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}
function IconTarget({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <circle cx="12" cy="12" r="6" strokeWidth={2} />
      <circle cx="12" cy="12" r="2" strokeWidth={2} />
    </svg>
  )
}
function IconChart({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
function IconCheck({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}
function IconArrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}
function IconMenu({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
function IconX({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

/* ─── Header ─── */
function Header() {
  const [open, setOpen] = useState(false)
  const links = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ]
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">GF</span>
          </div>
          <span className="text-lg font-bold tracking-tight">GrantFounders</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l.label}</a>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/dashboard" className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">Demo</Link>
          <Link href="/onboarding" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Get Started Free</Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden" aria-label="Toggle menu">
          {open ? <IconX /> : <IconMenu />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-sm text-muted-foreground">{l.label}</a>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/dashboard" className="rounded-lg border border-border px-4 py-2 text-center text-sm">Demo</Link>
            <Link href="/onboarding" className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground">Get Started Free</Link>
          </div>
        </div>
      )}
    </header>
  )
}

/* ─── Hero ─── */
function Hero() {
  const agencies = ["NSF", "NIH", "DoD", "DOE", "NASA", "USDA"]
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
      </div>
      <div className="mx-auto max-w-7xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary">GF-777ACE Kernel Active</span>
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-balance md:text-6xl lg:text-7xl">
          Know Your Grant Odds{" "}
          <span className="text-primary">Before You Apply</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">
          GrantFounders analyzes your SBIR/STTR proposal against federal scoring criteria in seconds.
          Stop guessing. Start winning.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/onboarding" className="flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105">
            Analyze My Proposal Free
            <IconArrow />
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-4 text-base font-medium text-card-foreground transition-colors hover:bg-muted">
            View Demo Dashboard
          </Link>
        </div>
        <div className="mt-16">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">Trusted by teams applying to</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {agencies.map((a) => (
              <span key={a} className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold tracking-wide text-muted-foreground">{a}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Stats ─── */
function Stats() {
  const stats = [
    { value: "$47M+", label: "Funding Secured" },
    { value: "89%", label: "Prediction Accuracy" },
    { value: "500+", label: "Startups Served" },
    { value: "< 60s", label: "Analysis Time" },
  ]
  return (
    <section className="border-y border-border bg-card/50 py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl font-bold text-primary md:text-4xl">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Features ─── */
function Features() {
  const features = [
    { icon: <IconTarget className="h-6 w-6" />, title: "ACE Score Engine", desc: "Multi-dimensional scoring against real federal review criteria. Know exactly where your proposal stands." },
    { icon: <IconChart className="h-6 w-6" />, title: "Agency DNA Matching", desc: "Our AI maps your proposal to each agency's unique priorities, funding patterns, and reviewer preferences." },
    { icon: <IconShield className="h-6 w-6" />, title: "Compliance Firewall", desc: "Catch disqualifying errors before submission. Page limits, budget caps, eligibility checks in seconds." },
    { icon: <IconZap className="h-6 w-6" />, title: "Quick Win Actions", desc: "Prioritized action items ranked by impact. Know exactly what to fix first for maximum score improvement." },
    { icon: <IconChart className="h-6 w-6" />, title: "Risk Matrix", desc: "Visual risk mapping across all scoring categories. See your weaknesses before reviewers do." },
    { icon: <IconTarget className="h-6 w-6" />, title: "Competitive Intel", desc: "Benchmark against successful proposals. Understand what winners do differently in your topic area." },
  ]
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Capabilities</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">Everything You Need to Win</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Built on 10,000+ analyzed proposals and real federal reviewer scoring patterns.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:bg-card/80">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    { n: "01", title: "Input Your Proposal", desc: "Paste your abstract, select agency and topic. Takes under 2 minutes." },
    { n: "02", title: "AI Analysis Runs", desc: "GF-777ACE evaluates against 47 scoring dimensions across technical merit, broader impact, and feasibility." },
    { n: "03", title: "Get Your ACE Score", desc: "See your overall score, category breakdowns, risk matrix, and competitive positioning." },
    { n: "04", title: "Execute Quick Wins", desc: "Follow prioritized action items to systematically improve your score before submission." },
  ]
  return (
    <section id="how-it-works" className="border-y border-border bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Process</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">From Upload to Funded in 4 Steps</h2>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <span className="text-5xl font-black text-primary/15">{s.n}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        {/* Demo Score Card */}
        <div className="mx-auto mt-20 max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Sample ACE Score</p>
            <div className="relative mx-auto mt-6 h-48 w-48">
              <svg className="h-48 w-48 -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
                <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="565" strokeDashoffset="130" strokeLinecap="round" className="text-primary animate-score-fill" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-primary">77</span>
                <span className="text-xs text-muted-foreground">out of 100</span>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-primary">Strong Candidate</p>
            <p className="mt-1 text-xs text-muted-foreground">Top 23% of SBIR Phase I proposals</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonials ─── */
function Testimonials() {
  const items = [
    { name: "Dr. Sarah Chen", role: "CEO, BioNova Therapeutics", quote: "We scored a 91 on our first try and won a $1.2M NIH Phase II. GrantFounders completely changed our approach.", result: "$1.2M NIH Phase II" },
    { name: "Marcus Rodriguez", role: "CTO, AeroSense AI", quote: "The risk matrix caught 3 critical gaps our team missed. We fixed them and secured DoD SBIR funding on the first submission.", result: "$750K DoD SBIR" },
    { name: "Dr. Emily Watson", role: "Founder, CleanGrid Energy", quote: "Used to spend $15K on grant consultants. Now I get better analysis in 60 seconds for a fraction of the cost.", result: "$2.1M DOE Award" },
  ]
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Success Stories</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">Founders Who Shipped & Funded</h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <div key={t.name} className="flex flex-col rounded-xl border border-border bg-card p-6">
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{`"${t.quote}"`}</p>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{t.result}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ─── */
function Pricing() {
  const plans = [
    {
      name: "Starter", price: "$0", period: "forever", desc: "Try the ACE engine on one proposal.", cta: "Start Free", href: "/onboarding", popular: false,
      features: ["1 proposal analysis", "Overall ACE Score", "Basic risk overview", "Top 3 quick wins"],
    },
    {
      name: "Pro", price: "$99", period: "/month", desc: "For serious founders applying to multiple grants.", cta: "Go Pro", href: "/onboarding", popular: true,
      features: ["Unlimited analyses", "Full category breakdown", "Risk matrix & heatmap", "Unlimited quick wins", "Agency DNA matching", "Competitive benchmarking", "Priority support"],
    },
    {
      name: "Enterprise", price: "Custom", period: "", desc: "For grant consultancies and accelerators.", cta: "Contact Sales", href: "#", popular: false,
      features: ["Everything in Pro", "Team workspaces", "White-label reports", "API access", "Dedicated account manager", "Custom AI training", "SLA guarantee"],
    },
  ]
  return (
    <section id="pricing" className="border-t border-border bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">Start Free. Scale When You Win.</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">No credit card required. Upgrade only when you see results.</p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`relative flex flex-col rounded-2xl border p-8 ${p.popular ? "border-primary bg-card shadow-lg shadow-primary/5" : "border-border bg-card"}`}>
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">Most Popular</span>
              )}
              <h3 className="text-lg font-bold text-card-foreground">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">{p.price}</span>
                {p.period && <span className="text-sm text-muted-foreground">{p.period}</span>}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-8 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold transition-colors ${p.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border bg-secondary text-secondary-foreground hover:bg-muted"}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-12 text-center md:p-20">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Stop Guessing. Start Winning Federal Grants.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join 500+ founders using AI to secure government funding. Your first analysis is completely free.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/onboarding" className="flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105">
              Get My Free ACE Score
              <IconArrow />
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card required. Results in under 60 seconds.</p>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">GF</span>
              </div>
              <span className="text-lg font-bold">GrantFounders</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">AI-powered grant intelligence for founders who refuse to leave money on the table.</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Product</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Demo</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Agencies</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>NSF SBIR/STTR</li>
              <li>NIH SBIR/STTR</li>
              <li>DoD SBIR/STTR</li>
              <li>DOE SBIR/STTR</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Company</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Blog</a></li>
              <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} GrantFounders, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

/* ─── Main Page ─── */
export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
