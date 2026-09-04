"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, ArrowLeft, Sparkles, Building2, Rocket, Users, Zap, Shield, BarChart3 } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: 0,
    period: "forever",
    description: "Perfect for exploring grant opportunities",
    icon: Rocket,
    features: [
      "1 ACE analysis per month",
      "Basic score breakdown",
      "Top 3 risk factors",
      "P0 action items only",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "/onboarding",
    popular: false,
  },
  {
    name: "Pro",
    price: 99,
    period: "month",
    description: "For startups actively pursuing grants",
    icon: Sparkles,
    features: [
      "Unlimited ACE analyses",
      "Full risk breakdown",
      "All action items unlocked",
      "Agency DNA matching",
      "Proposal comparison tool",
      "Historical tracking",
      "Priority email support",
    ],
    cta: "Start 14-Day Trial",
    href: "/signup?plan=pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: null,
    period: null,
    description: "For grant consultants & accelerators",
    icon: Building2,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "White-label reports",
      "API access",
      "Custom AI training",
      "Dedicated success manager",
      "SSO & compliance (SOC2)",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
  },
]

const features = [
  {
    icon: Zap,
    title: "GF-777ACE Kernel",
    description: "Proprietary AI trained on 50,000+ successful grant proposals",
  },
  {
    icon: BarChart3,
    title: "89% Accuracy",
    description: "Our predictions outperform human reviewers in blind tests",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "SOC2 compliant, encrypted at rest and in transit",
  },
  {
    icon: Users,
    title: "Trusted by 500+",
    description: "Startups have secured $47M+ using GrantFounders",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">GF</span>
            </div>
            <span className="text-lg font-semibold text-foreground">GrantFounders</span>
          </Link>
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>
      
      <main className="mx-auto max-w-6xl px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include our core ACE analysis technology.
          </p>
        </div>
        
        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-3 mb-20">
          {plans.map((plan) => {
            const Icon = plan.icon
            
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.popular 
                    ? "border-primary bg-primary/5 scale-105" 
                    : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                    Most Popular
                  </span>
                )}
                
                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    plan.popular ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <Icon className={`h-6 w-6 ${plan.popular ? "text-primary" : "text-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>
                
                {/* Price */}
                <div className="mb-6">
                  {plan.price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">Custom pricing</span>
                    </div>
                  )}
                </div>
                
                {/* Features */}
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA */}
                <Link href={plan.href}>
                  <Button
                    className={`w-full py-6 text-base ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            )
          })}
        </div>
        
        {/* Trust Features */}
        <div className="border-t border-border pt-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-12">
            Why teams trust GrantFounders
          </h2>
          
          <div className="grid gap-8 md:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              
              return (
                <div key={feature.title} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* FAQ Teaser */}
        <div className="mt-20 text-center">
          <p className="text-muted-foreground">
            Have questions?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact our team
            </Link>{" "}
            or check our{" "}
            <Link href="/faq" className="text-primary hover:underline">
              FAQ
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
