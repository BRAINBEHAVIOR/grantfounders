import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Database, 
  Brain, 
  FileText, 
  Zap, 
  Upload, 
  BarChart3, 
  Download,
  Shield,
  CheckCircle,
  Star,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'
import './App.css'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-[var(--quantum-bg-primary)] text-[var(--quantum-text-primary)]">
      {/* Navigation */}
      <nav className="border-b border-[var(--quantum-border)] bg-[var(--quantum-bg-primary)]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-[var(--quantum-accent)]">GrantFounders</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="hover:text-[var(--quantum-accent)] transition-colors">Features</a>
                <a href="#pricing" className="hover:text-[var(--quantum-accent)] transition-colors">Pricing</a>
                <a href="#api" className="hover:text-[var(--quantum-accent)] transition-colors">API</a>
                <a href="#about" className="hover:text-[var(--quantum-accent)] transition-colors">About</a>
                <a href="#contact" className="hover:text-[var(--quantum-accent)] transition-colors">Contact</a>
              </div>
            </div>

            <div className="hidden md:block">
              <Button className="quantum-btn-primary">Get Started</Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[var(--quantum-text-primary)] hover:text-[var(--quantum-accent)]"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[var(--quantum-bg-secondary)] border-t border-[var(--quantum-border)]">
              <a href="#features" className="block px-3 py-2 hover:text-[var(--quantum-accent)]">Features</a>
              <a href="#pricing" className="block px-3 py-2 hover:text-[var(--quantum-accent)]">Pricing</a>
              <a href="#api" className="block px-3 py-2 hover:text-[var(--quantum-accent)]">API</a>
              <a href="#about" className="block px-3 py-2 hover:text-[var(--quantum-accent)]">About</a>
              <a href="#contact" className="block px-3 py-2 hover:text-[var(--quantum-accent)]">Contact</a>
              <div className="px-3 py-2">
                <Button className="quantum-btn-primary w-full">Get Started</Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--quantum-bg-primary)] via-[var(--quantum-bg-secondary)] to-[var(--quantum-bg-primary)] opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-[var(--quantum-accent)]/10 text-[var(--quantum-accent)] border-[var(--quantum-accent)]/20">
              Powered by Abasensor™
            </Badge>
            <h1 className="quantum-h1 mb-6 text-[var(--quantum-text-primary)]">
              Unlock Funding.<br />
              Accelerate Innovation.™
            </h1>
            <p className="quantum-body text-xl mb-8 max-w-3xl mx-auto text-[var(--quantum-text-secondary)]">
              The world's first AI-powered Funding Intelligence Cloud for founders, VCs, and public agencies. 
              Harness advanced signal processing and data intelligence to discover and secure grants with precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="quantum-btn-primary text-lg px-8 py-3">
                Get Started for Free
              </Button>
              <Button className="quantum-btn-secondary text-lg px-8 py-3">
                Request a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section id="features" className="py-20 bg-[var(--quantum-bg-secondary)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="quantum-h2 mb-4">Why GrantFounders</h2>
            <p className="quantum-body-secondary text-xl max-w-3xl mx-auto">
              Transform your funding strategy with enterprise-grade intelligence and pattern recognition
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="quantum-card">
              <CardHeader>
                <Database className="w-12 h-12 text-[var(--quantum-accent)] mb-4" />
                <CardTitle className="quantum-h3">Global Funding Database</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="quantum-body-secondary">
                  Access comprehensive funding opportunities with real-time updates and intelligent matching
                </p>
              </CardContent>
            </Card>

            <Card className="quantum-card">
              <CardHeader>
                <Brain className="w-12 h-12 text-[var(--quantum-accent)] mb-4" />
                <CardTitle className="quantum-h3">AI-Powered Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="quantum-body-secondary">
                  Advanced algorithms analyze your project's funding probability with unprecedented accuracy
                </p>
              </CardContent>
            </Card>

            <Card className="quantum-card">
              <CardHeader>
                <FileText className="w-12 h-12 text-[var(--quantum-accent)] mb-4" />
                <CardTitle className="quantum-h3">Due Diligence Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="quantum-body-secondary">
                  Instant comprehensive reports with actionable insights and strategic recommendations
                </p>
              </CardContent>
            </Card>

            <Card className="quantum-card">
              <CardHeader>
                <Zap className="w-12 h-12 text-[var(--quantum-accent)] mb-4" />
                <CardTitle className="quantum-h3">Plug & Play API</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="quantum-body-secondary">
                  Seamless integration with your existing workflow and enterprise systems
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="quantum-h2 mb-4">How It Works</h2>
            <p className="quantum-body-secondary text-xl max-w-3xl mx-auto">
              Three simple steps to unlock your funding potential
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--quantum-accent)] rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-[var(--quantum-bg-primary)]" />
              </div>
              <h3 className="quantum-h3 mb-4">1. Submit Your Project</h3>
              <p className="quantum-body-secondary">
                Upload your project documents and provide key details through our intuitive interface
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--quantum-accent)] rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-[var(--quantum-bg-primary)]" />
              </div>
              <h3 className="quantum-h3 mb-4">2. AI Analysis</h3>
              <p className="quantum-body-secondary">
                Our Abasensor™ technology analyzes your project against thousands of funding criteria
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--quantum-accent)] rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-8 h-8 text-[var(--quantum-bg-primary)]" />
              </div>
              <h3 className="quantum-h3 mb-4">3. Get Results</h3>
              <p className="quantum-body-secondary">
                Receive detailed reports with funding probability scores and strategic recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-[var(--quantum-bg-secondary)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="quantum-h2 mb-4">Plans built for every stage of your funding journey</h2>
            <p className="quantum-body-secondary text-xl max-w-3xl mx-auto">
              Enterprise-grade intelligence powered by Abasensor™ technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="quantum-h3">Starter</CardTitle>
                <div className="text-3xl font-bold text-[var(--quantum-accent)]">$497</div>
                <CardDescription className="quantum-body-secondary">per report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="quantum-body-secondary">Perfect for founders & researchers needing on-demand analysis</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--quantum-success)]" />
                    <span className="quantum-micro">AI Score Analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--quantum-success)]" />
                    <span className="quantum-micro">1 Comprehensive Report</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--quantum-success)]" />
                    <span className="quantum-micro">PDF Export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--quantum-success)]" />
                    <span className="quantum-micro">Basic Support</span>
                  </li>
                </ul>
                <Button className="quantum-btn-secondary w-full">Order Report</Button>
              </CardContent>
            </Card>

            {/* Executive Analysis Plan */}
            <Card className="quantum-card quantum-glow border-[var(--quantum-accent)]">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-[var(--quantum-accent)] text-[var(--quantum-bg-primary)]">Most Popular</Badge>
                <CardTitle className="quantum-h3">Executive Analysis</CardTitle>
                <div className="text-3xl font-bold text-[var(--quantum-accent)]">$1,997</div>
                <CardDescription className="quantum-body-secondary">/month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="quantum-body-secondary">For teams, accelerators, and VCs managing pipelines</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--quantum-success)]" />
                    <span className="quantum-micro">Unlimited Reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--quantum-success)]" />
                    <span className="quantum-micro">Dashboard Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--quantum-success)]" />
                    <span className="quantum-micro">API Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--quantum-success)]" />
                    <span className="quantum-micro">Priority Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--quantum-success)]" />
                    <span className="quantum-micro">Advanced Analytics</span>
                  </li>
                </ul>
                <Button className="quantum-btn-primary w-full">Start Free Trial</Button>
              </CardContent>
            </Card>

            {/* Strategic Partnership Plan */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="quantum-h3">Strategic Partnership</CardTitle>
                <div className="text-3xl font-bold text-[var(--quantum-accent)]">$4,997</div>
                <CardDescription className="quantum-body-secondary">/month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="quantum-body-secondary">Custom solution for agencies, banks, and large funds</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--quantum-success)]" />
                    <span className="quantum-micro">Dedicated Onboarding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--quantum-success)]" />
                    <span className="quantum-micro">SLA Guarantees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--quantum-success)]" />
                    <span className="quantum-micro">Custom Integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--quantum-success)]" />
                    <span className="quantum-micro">White-label Options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--quantum-success)]" />
                    <span className="quantum-micro">24/7 Support</span>
                  </li>
                </ul>
                <Button className="quantum-btn-secondary w-full">Request Custom Quote</Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="quantum-body-secondary">
              No hidden fees. All federal-grade security included.
            </p>
            <div className="flex justify-center items-center gap-6 mt-6">
              <Badge variant="outline" className="border-[var(--quantum-border)] text-[var(--quantum-text-secondary)]">
                <Shield className="w-4 h-4 mr-2" />
                PCI Compliant
              </Badge>
              <Badge variant="outline" className="border-[var(--quantum-border)] text-[var(--quantum-text-secondary)]">
                <Shield className="w-4 h-4 mr-2" />
                SOC2 Type II
              </Badge>
              <Badge variant="outline" className="border-[var(--quantum-border)] text-[var(--quantum-text-secondary)]">
                <Shield className="w-4 h-4 mr-2" />
                FedRAMP Ready
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="quantum-h2 mb-4">Trusted by Leaders</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="quantum-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[var(--quantum-accent)] text-[var(--quantum-accent)]" />
                  ))}
                </div>
                <p className="quantum-body mb-4">
                  "GrantFounders transformed our funding strategy. The AI analysis identified opportunities we never would have found manually."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--quantum-accent)] rounded-full flex items-center justify-center">
                    <span className="text-[var(--quantum-bg-primary)] font-semibold">JS</span>
                  </div>
                  <div>
                    <p className="quantum-micro font-semibold">Dr. Jennifer Smith</p>
                    <p className="quantum-micro text-[var(--quantum-text-secondary)]">Director, Innovation Fund</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="quantum-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[var(--quantum-accent)] text-[var(--quantum-accent)]" />
                  ))}
                </div>
                <p className="quantum-body mb-4">
                  "The precision and speed of Abasensor™ technology is remarkable. It's become essential to our due diligence process."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--quantum-accent)] rounded-full flex items-center justify-center">
                    <span className="text-[var(--quantum-bg-primary)] font-semibold">MR</span>
                  </div>
                  <div>
                    <p className="quantum-micro font-semibold">Michael Rodriguez</p>
                    <p className="quantum-micro text-[var(--quantum-text-secondary)]">Senior Program Officer, Federal Agency</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[var(--quantum-bg-secondary)]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="quantum-h2 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How secure is my data?",
                answer: "We maintain federal-grade security with PCI, SOC2, and FedRAMP Ready compliance. All data is encrypted in transit and at rest."
              },
              {
                question: "What makes Abasensor™ technology unique?",
                answer: "Abasensor™ uses advanced signal processing and pattern recognition to analyze funding opportunities with unprecedented accuracy and speed."
              },
              {
                question: "Can I integrate with existing systems?",
                answer: "Yes, our API provides seamless integration with your existing workflow and enterprise systems."
              },
              {
                question: "What support is available?",
                answer: "We offer comprehensive support ranging from basic assistance to dedicated 24/7 support for enterprise clients."
              }
            ].map((faq, index) => (
              <Card key={index} className="quantum-card">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex justify-between items-center">
                    <CardTitle className="quantum-h3">{faq.question}</CardTitle>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform ${
                        openFaq === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </div>
                </CardHeader>
                {openFaq === index && (
                  <CardContent>
                    <p className="quantum-body-secondary">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--quantum-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="quantum-h3 mb-4 text-[var(--quantum-accent)]">GrantFounders</h3>
              <p className="quantum-body-secondary">
                AI-powered Funding Intelligence Cloud for the next generation of innovation.
              </p>
              <Badge className="mt-4 bg-[var(--quantum-accent)]/10 text-[var(--quantum-accent)] border-[var(--quantum-accent)]/20">
                Powered by Abasensor™
              </Badge>
            </div>
            
            <div>
              <h4 className="quantum-h3 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="quantum-body-secondary hover:text-[var(--quantum-accent)]">Features</a></li>
                <li><a href="#pricing" className="quantum-body-secondary hover:text-[var(--quantum-accent)]">Pricing</a></li>
                <li><a href="#api" className="quantum-body-secondary hover:text-[var(--quantum-accent)]">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="quantum-h3 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="quantum-body-secondary hover:text-[var(--quantum-accent)]">About</a></li>
                <li><a href="#contact" className="quantum-body-secondary hover:text-[var(--quantum-accent)]">Contact</a></li>
                <li><a href="#careers" className="quantum-body-secondary hover:text-[var(--quantum-accent)]">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="quantum-h3 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#docs" className="quantum-body-secondary hover:text-[var(--quantum-accent)]">Documentation</a></li>
                <li><a href="#help" className="quantum-body-secondary hover:text-[var(--quantum-accent)]">Help Center</a></li>
                <li><a href="#status" className="quantum-body-secondary hover:text-[var(--quantum-accent)]">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[var(--quantum-border)] mt-8 pt-8 text-center">
            <p className="quantum-body-secondary">
              © 2024 GrantFounders. All rights reserved. Abasensor™ is a registered trademark.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

