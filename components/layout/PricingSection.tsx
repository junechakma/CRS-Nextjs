"use client"

import Link from 'next/link'
import { Zap, Crown, Building2, Check, X } from 'lucide-react'

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
            { text: "Dedicated Account Manager", included: true },
            { text: "SSO / SAML Authentication", included: true },
            { text: "On-premise Deployment", included: true },
            { text: "SLA Guarantee", included: true },
        ],
        cta: "Contact Sales",
        ctaVariant: "outline" as const,
        disabled: false,
    },
]

export default function PricingSection() {
    return (
        <section id="pricing" className="relative py-32 px-6 bg-white overflow-hidden">
            <style jsx>{`
        /* Bento Card Spotlight */
        .pricing-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y),
            rgba(70, 140, 254, 0.15), transparent 40%);
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
        }

        .pricing-card:hover::before {
          opacity: 1;
        }

        /* Reveal Animation */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
        }

        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-white to-white"></div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-20 reveal">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700 mb-6 shadow-sm">
                        <Crown className="w-3 h-3" />
                        Simple, transparent pricing
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                        Choose Your Plan
                    </h2>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Start free and upgrade as you grow. All plans include core features.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => {
                        const Icon = plan.icon

                        return (
                            <div
                                key={plan.id}
                                className={`pricing-card relative overflow-hidden rounded-3xl bg-white border transition-all duration-500 reveal ${plan.popular
                                    ? 'border-[#468cfe] shadow-2xl shadow-blue-100 scale-105 md:scale-110'
                                    : 'border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-100/50'
                                    }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                {/* Popular Badge */}
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-[#468cfe] to-[#3b82f6] text-white text-xs font-semibold px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl">
                                        Most Popular
                                    </div>
                                )}

                                <div className="p-8">
                                    {/* Icon & Name */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-slate-600 text-sm mb-6">
                                        {plan.description}
                                    </p>

                                    {/* Price */}
                                    <div className="mb-8">
                                        {plan.price !== null ? (
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-5xl font-bold text-slate-900">
                                                    ${plan.price}
                                                </span>
                                                <span className="text-slate-500">/{plan.period}</span>
                                            </div>
                                        ) : (
                                            <div className="text-3xl font-bold text-slate-900">
                                                Custom Pricing
                                            </div>
                                        )}
                                    </div>

                                    {/* CTA Button */}
                                    {plan.ctaVariant === 'default' ? (
                                        <button
                                            disabled={plan.disabled}
                                            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all mb-8 ${plan.disabled
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                : 'bg-[#468cfe] hover:bg-[#3a7be0] text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-105'
                                                }`}
                                        >
                                            {plan.cta}
                                        </button>
                                    ) : (
                                        <button
                                            disabled={plan.disabled}
                                            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all mb-8 ${plan.disabled
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                                : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                                                }`}
                                        >
                                            {plan.cta}
                                        </button>
                                    )}

                                    {/* Features List */}
                                    <div className="space-y-3">
                                        {plan.features.map((feature, featureIndex) => (
                                            <div
                                                key={featureIndex}
                                                className={`flex items-start gap-3 ${!feature.included ? 'opacity-50' : ''
                                                    }`}
                                            >
                                                {feature.included ? (
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${'highlight' in feature && feature.highlight
                                                        ? 'bg-[#468cfe]'
                                                        : 'bg-green-100'
                                                        }`}>
                                                        <Check className={`w-3 h-3 ${'highlight' in feature && feature.highlight ? 'text-white' : 'text-green-600'
                                                            }`} />
                                                    </div>
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <X className="w-3 h-3 text-slate-400" />
                                                    </div>
                                                )}
                                                <span className={`text-sm ${feature.included
                                                    ? 'highlight' in feature && feature.highlight
                                                        ? 'text-slate-900 font-semibold'
                                                        : 'text-slate-700'
                                                    : 'text-slate-500 line-through'
                                                    }`}>
                                                    {feature.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        )
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16 reveal">
                    <p className="text-slate-600 mb-4">
                        Need help choosing the right plan?
                    </p>
                    <a
                        href="mailto:classresponsesystem@gmail.com"
                        className="inline-flex items-center gap-2 text-[#468cfe] hover:text-[#3a7be0] font-medium transition-colors"
                    >
                        Contact us for guidance
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>

                {/* FAQ Teaser */}
                <div className="mt-20 max-w-3xl mx-auto">
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl border border-blue-100 p-8 reveal">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">
                            Frequently Asked Questions
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-[#468cfe]">?</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-1">Can I upgrade or downgrade anytime?</h4>
                                    <p className="text-sm text-slate-600">Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades at the end of your billing cycle.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-[#468cfe]">?</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-1">What payment methods do you accept?</h4>
                                    <p className="text-sm text-slate-600">We accept all major credit cards, debit cards, and bank transfers for institutional plans.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-[#468cfe]">?</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-1">Is there a discount for annual billing?</h4>
                                    <p className="text-sm text-slate-600">Yes! Save 20% when you choose annual billing. Contact us to set up annual payments.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}