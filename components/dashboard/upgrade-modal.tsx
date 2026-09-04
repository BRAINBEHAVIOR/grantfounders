"use client"

import { Button } from "@/components/ui/button"
import { X, Check, Sparkles, Building2, Zap } from "lucide-react"

interface UpgradeModalProps {
  onClose: () => void
}

const plans = [
  {
    name: "Pro",
    price: 99,
    period: "month",
    description: "For startups actively pursuing grants",
    icon: Sparkles,
    popular: true,
    features: [
      "Unlimited ACE analyses",
      "Full risk breakdown",
      "All action items unlocked",
      "Agency DNA matching",
      "Proposal comparison",
      "Email support",
    ],
  },
  {
    name: "Enterprise",
    price: null,
    period: null,
    description: "For grant consultants & accelerators",
    icon: Building2,
    popular: false,
    features: [
      "Everything in Pro",
      "Team accounts (unlimited)",
      "White-label reports",
      "API access",
      "Custom AI training",
      "Dedicated success manager",
      "SSO & compliance",
    ],
  },
]

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Header */}
        <div className="border-b border-border p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Unlock Full Power</h2>
          <p className="mt-2 text-muted-foreground">
            Get complete access to all features and maximize your grant success
          </p>
        </div>
        
        {/* Plans */}
        <div className="grid gap-4 p-6 md:grid-cols-2">
          {plans.map((plan) => {
            const Icon = plan.icon
            
            return (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 ${
                  plan.popular 
                    ? "border-primary bg-primary/5" 
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    plan.popular ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <Icon className={`h-5 w-5 ${plan.popular ? "text-primary" : "text-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>
                
                {/* Price */}
                <div className="mb-4">
                  {plan.price ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-foreground">Custom pricing</span>
                    </div>
                  )}
                </div>
                
                {/* Features */}
                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA */}
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {plan.price ? "Start 14-Day Trial" : "Contact Sales"}
                </Button>
              </div>
            )
          })}
        </div>
        
        {/* Footer */}
        <div className="border-t border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">
            14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
