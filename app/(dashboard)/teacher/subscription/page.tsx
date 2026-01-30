"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Check,
  X,
  Sparkles,
  Building2,
  Zap,
  Crown,
  MessageSquare,
  BookOpen,
  Brain,
  Users,
  Shield,
  Headphones,
  ArrowRight,
  CheckCircle2,
  Star,
  Infinity,
} from "lucide-react"

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started and exploring the platform",
    price: 0,
    period: "forever",
    icon: Zap,
    color: "slate",
    gradient: "from-slate-500 to-slate-600",
    popular: false,
    features: [
      { text: "5 Courses", included: true },
      { text: "10 Sessions per month", included: true },
      { text: "10 AI Analytics per month", included: true },
      { text: "Basic CLO Mapping", included: true },
      { text: "Unlimited Students", included: false },
      { text: "Priority Support", included: false },
    ],
    cta: "Current Plan",
    ctaVariant: "outline" as const,
    disabled: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "For educators who need more power and flexibility",
    price: 15,
    period: "month",
    icon: Crown,
    color: "indigo",
    gradient: "from-indigo-500 to-violet-600",
    popular: true,
    features: [
      { text: "Unlimited Courses", included: true, highlight: true },
      { text: "Unlimited Sessions", included: true, highlight: true },
      { text: "100 AI Analytics per month", included: true, highlight: true },
      { text: "Advanced CLO Mapping", included: true },
      { text: "Priority Email Support", included: true },
      { text: "150 Students per session", included: true },
      { text: "Export Reports (PDF/CSV)", included: true },
    ],
    cta: "Upgrade to Premium",
    ctaVariant: "default" as const,
    disabled: false,
  },
  {
    id: "custom",
    name: "Custom",
    description: "Tailored solutions for organizations and institutions",
    price: null,
    period: "custom",
    icon: Building2,
    color: "violet",
    gradient: "from-violet-500 to-purple-600",
    popular: false,
    features: [
      { text: "Unlimited Courses", included: true, highlight: true },
      { text: "Unlimited Sessions", included: true, highlight: true },
      { text: "Unlimited AI Analytics", included: true, highlight: true },
      { text: "Unlimited Students", included: true, highlight: true },
      { text: "Dedicated Account ", included: true },
      { text: "SSO / SAML Authentication", included: true },
      { text: "On-premise Deployment", included: true },
      { text: "SLA Guarantee", included: true },
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    disabled: false,
  },
]

const faqs = [
  {
    question: "Can I switch plans at any time?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise plans.",
  },
  {
    question: "Is there a free trial for Premium?",
    answer: "Yes! You can try Premium features free for 14 days. No credit card required.",
  },
  {
    question: "What happens when I reach my AI Analytics limit?",
    answer: "You'll receive a notification when approaching your limit. You can upgrade your plan or wait for the next month's refresh.",
  },
  {
    question: "Do you offer discounts for educational institutions?",
    answer: "Yes, we offer special pricing for schools and universities. Contact our sales team for more information.",
  },
]

const stats = [
  { label: "Courses Used", value: "3", max: "5", percentage: 60 },
  { label: "Sessions This Month", value: "7", max: "10", percentage: 70 },
  { label: "AI Analytics Used", value: "4", max: "10", percentage: 40 },
]

export default function SubscriptionPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; light: string }> = {
      slate: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", light: "bg-slate-50" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-600", border: "border-indigo-200", light: "bg-indigo-50" },
      violet: { bg: "bg-violet-100", text: "text-violet-600", border: "border-violet-200", light: "bg-violet-50" },
    }
    return colors[color] || colors.slate
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="meteor meteor-1" />
        <div className="meteor meteor-2" />
        <div className="meteor meteor-3" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed-2" />
      </div>

      <Sidebar
        role="teacher"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="relative flex-1 flex flex-col overflow-hidden lg:pl-64 z-10">
        <Header
          userName="Dr. Sarah Johnson"
          userEmail="sarah.j@university.edu"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="text-center max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                Choose Your Plan
              </h1>
              <p className="text-lg text-slate-500">
                Unlock the full potential of your teaching with our flexible pricing options
              </p>
            </div>

            {/* Current Usage Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100">
                    <Zap className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Current Plan: Free</h3>
                    <p className="text-sm text-slate-500">Your usage this month</p>
                  </div>
                </div>
                <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">
                  Free Tier
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">{stat.label}</span>
                      <span className="text-sm font-medium text-slate-900">
                        {stat.value}/{stat.max}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${stat.percentage >= 80
                          ? "bg-gradient-to-r from-amber-400 to-orange-500"
                          : "bg-gradient-to-r from-indigo-400 to-violet-500"
                          }`}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                    {stat.percentage >= 80 && (
                      <p className="text-xs text-amber-600 mt-1">Approaching limit</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3">
              <span className={`text-sm font-medium ${billingPeriod === "monthly" ? "text-slate-900" : "text-slate-500"}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
                className={`relative w-14 h-7 rounded-full transition-colors ${billingPeriod === "yearly" ? "bg-indigo-600" : "bg-slate-300"
                  }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${billingPeriod === "yearly" ? "translate-x-8" : "translate-x-1"
                    }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingPeriod === "yearly" ? "text-slate-900" : "text-slate-500"}`}>
                Yearly
              </span>
              {billingPeriod === "yearly" && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  Save 20%
                </Badge>
              )}
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const colors = getColorClasses(plan.color)
                const Icon = plan.icon
                const displayPrice = plan.price !== null
                  ? billingPeriod === "yearly"
                    ? Math.round(plan.price * 12 * 0.8)
                    : plan.price
                  : null

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-3xl border-2 transition-all ${plan.popular
                      ? "border-indigo-300 shadow-xl shadow-indigo-100 scale-[1.02]"
                      : "border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300"
                      }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-600 px-4 py-1 shadow-lg">
                          <Star className="w-3.5 h-3.5 mr-1 fill-current" />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <div className="p-6 sm:p-8">
                      {/* Plan Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${plan.gradient} mb-4`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                          <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="mb-6">
                        {displayPrice !== null ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-slate-900">${displayPrice}</span>
                            <span className="text-slate-500">
                              /{billingPeriod === "yearly" ? "year" : "month"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-900">Custom</span>
                            <span className="text-slate-500">pricing</span>
                          </div>
                        )}
                        {plan.price === 0 && (
                          <p className="text-sm text-emerald-600 mt-1">Free forever</p>
                        )}
                        {billingPeriod === "yearly" && plan.price !== null && plan.price > 0 && (
                          <p className="text-sm text-emerald-600 mt-1">
                            Save ${Math.round(plan.price * 12 * 0.2)}/year
                          </p>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Button
                        className={`w-full gap-2 ${plan.popular
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-200"
                          : plan.id === "custom"
                            ? "border-violet-300 text-violet-700 hover:bg-violet-50"
                            : ""
                          }`}
                        variant={plan.ctaVariant}
                        disabled={plan.disabled}
                      >
                        {plan.cta}
                        {!plan.disabled && <ArrowRight className="w-4 h-4" />}
                      </Button>

                      {/* Features */}
                      <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 mb-4">What's included:</p>
                        <ul className="space-y-3">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              {feature.included ? (
                                <CheckCircle2 className={`w-5 h-5 shrink-0 ${feature.highlight ? "text-indigo-600" : "text-emerald-500"
                                  }`} />
                              ) : (
                                <X className="w-5 h-5 text-slate-300 shrink-0" />
                              )}
                              <span className={`text-sm ${feature.included
                                ? feature.highlight
                                  ? "text-slate-900 font-medium"
                                  : "text-slate-700"
                                : "text-slate-400"
                                }`}>
                                {feature.text}
                                {feature.highlight && feature.text.includes("Unlimited") && (
                                  <Infinity className="w-4 h-4 inline ml-1 text-indigo-500" />
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Feature Comparison */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Compare All Features</h2>
                <p className="text-sm text-slate-500 mt-1">See what's included in each plan</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left p-4 text-sm font-semibold text-slate-900">Feature</th>
                      <th className="text-center p-4 text-sm font-semibold text-slate-900">Free</th>
                      <th className="text-center p-4 text-sm font-semibold text-indigo-600 bg-indigo-50/50">Premium</th>
                      <th className="text-center p-4 text-sm font-semibold text-slate-900">Custom</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-4 text-sm text-slate-700 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        Courses
                      </td>
                      <td className="p-4 text-center text-sm text-slate-600">5</td>
                      <td className="p-4 text-center text-sm font-medium text-indigo-600 bg-indigo-50/50">Unlimited</td>
                      <td className="p-4 text-center text-sm text-slate-600">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm text-slate-700 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        Sessions/month
                      </td>
                      <td className="p-4 text-center text-sm text-slate-600">10</td>
                      <td className="p-4 text-center text-sm font-medium text-indigo-600 bg-indigo-50/50">Unlimited</td>
                      <td className="p-4 text-center text-sm text-slate-600">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm text-slate-700 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-slate-400" />
                        AI Analytics/month
                      </td>
                      <td className="p-4 text-center text-sm text-slate-600">10</td>
                      <td className="p-4 text-center text-sm font-medium text-indigo-600 bg-indigo-50/50">100</td>
                      <td className="p-4 text-center text-sm text-slate-600">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm text-slate-700 flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        Students
                      </td>
                      <td className="p-4 text-center text-sm text-slate-600">50</td>
                      <td className="p-4 text-center text-sm font-medium text-indigo-600 bg-indigo-50/50">Unlimited</td>
                      <td className="p-4 text-center text-sm text-slate-600">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm text-slate-700 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-slate-400" />
                        CLO Mapping
                      </td>
                      <td className="p-4 text-center text-sm text-slate-600">Basic</td>
                      <td className="p-4 text-center text-sm font-medium text-indigo-600 bg-indigo-50/50">Advanced</td>
                      <td className="p-4 text-center text-sm text-slate-600">Advanced + Custom</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm text-slate-700 flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-slate-400" />
                        Support
                      </td>
                      <td className="p-4 text-center text-sm text-slate-600">Email</td>
                      <td className="p-4 text-center text-sm font-medium text-indigo-600 bg-indigo-50/50">Priority Email</td>
                      <td className="p-4 text-center text-sm text-slate-600">Dedicated Manager</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm text-slate-700 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-slate-400" />
                        SSO / SAML
                      </td>
                      <td className="p-4 text-center">
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      </td>
                      <td className="p-4 text-center bg-indigo-50/50">
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Frequently Asked Questions</h2>
                <p className="text-slate-500">Everything you need to know about our plans</p>
              </div>

              <div className="max-w-3xl mx-auto space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-medium text-slate-900">{faq.question}</span>
                      <div className={`p-1 rounded-lg transition-transform ${expandedFaq === index ? "rotate-180" : ""}`}>
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    {expandedFaq === index && (
                      <div className="px-5 pb-4">
                        <p className="text-sm text-slate-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl p-8 sm:p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Ready to Transform Your Teaching?
                </h2>
                <p className="text-indigo-100 mb-8">
                  Join thousands of educators who are already using our platform to enhance student engagement and track learning outcomes effectively.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button className="bg-white text-indigo-600 hover:bg-indigo-50 gap-2 px-8">
                    <Crown className="w-4 h-4" />
                    Start Free Trial
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
