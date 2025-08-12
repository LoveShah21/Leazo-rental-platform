"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, Zap, Shield, Users, Package, Clock, ArrowRight, Sparkles, Leaf, Award, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  badge?: string;
  cta: string;
  ctaVariant: "default" | "outline" | "secondary";
}

const pricingTiers: PricingTier[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for individual renters getting started",
    price: {
      monthly: 0,
      yearly: 0
    },
    features: [
      "Up to 5 rentals per month",
      "Basic customer support",
      "Standard insurance coverage",
      "Email notifications",
      "Mobile app access",
      "Basic analytics"
    ],
    icon: <Package className="h-6 w-6" />,
    color: "text-blue-600",
    gradient: "from-blue-500 to-cyan-500",
    cta: "Get Started Free",
    ctaVariant: "outline"
  },
  {
    id: "pro",
    name: "Professional",
    description: "Ideal for active renters and small businesses",
    price: {
      monthly: 29,
      yearly: 290
    },
    features: [
      "Up to 50 rentals per month",
      "Priority customer support",
      "Enhanced insurance coverage",
      "Real-time notifications",
      "Advanced analytics dashboard",
      "Custom branding options",
      "API access",
      "Dedicated account manager"
    ],
    popular: true,
    icon: <Zap className="h-6 w-6" />,
    color: "text-purple-600",
    gradient: "from-purple-500 to-pink-500",
    badge: "Most Popular",
    cta: "Start Pro Trial",
    ctaVariant: "default"
  },
  {
    id: "business",
    name: "Business",
    description: "For growing businesses and rental companies",
    price: {
      monthly: 99,
      yearly: 990
    },
    features: [
      "Unlimited rentals",
      "24/7 premium support",
      "Comprehensive insurance",
      "Multi-location management",
      "Advanced reporting & insights",
      "White-label solutions",
      "Custom integrations",
      "Team collaboration tools",
      "Revenue optimization",
      "Dedicated success manager"
    ],
    icon: <Shield className="h-6 w-6" />,
    color: "text-emerald-600",
    gradient: "from-emerald-500 to-teal-500",
    cta: "Contact Sales",
    ctaVariant: "secondary"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for large organizations",
    price: {
      monthly: 299,
      yearly: 2990
    },
    features: [
      "Everything in Business",
      "Custom development",
      "On-premise deployment",
      "Advanced security features",
      "Compliance & audit tools",
      "Custom training programs",
      "SLA guarantees",
      "Dedicated support team",
      "Custom integrations",
      "Strategic consulting"
    ],
    icon: <Award className="h-6 w-6" />,
    color: "text-orange-600",
    gradient: "from-orange-500 to-red-500",
    badge: "Enterprise",
    cta: "Contact Sales",
    ctaVariant: "secondary"
  }
];

const features = [
  {
    title: "Sustainable Impact",
    description: "Reduce waste and carbon footprint through sharing economy",
    icon: <Leaf className="h-8 w-8" />,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30"
  },
  {
    title: "Global Reach",
    description: "Access to millions of items across the world",
    icon: <Globe className="h-8 w-8" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30"
  },
  {
    title: "Trust & Security",
    description: "Verified users and comprehensive insurance coverage",
    icon: <Shield className="h-8 w-8" />,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30"
  },
  {
    title: "Instant Access",
    description: "Quick booking and same-day delivery options",
    icon: <Clock className="h-8 w-8" />,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30"
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  const getSavings = (monthly: number, yearly: number) => {
    const monthlyTotal = monthly * 12;
    const savings = monthlyTotal - yearly;
    return Math.round((savings / monthlyTotal) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
          <div className="relative container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Pricing Plans
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Choose Your
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Perfect Plan</span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                Flexible pricing options designed to grow with your rental needs. 
                Start free and scale up as your business grows.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-12">
                <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 bg-purple-600"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  Yearly
                  {billingCycle === 'yearly' && (
                    <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Save up to 20%
                    </Badge>
                  )}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onHoverStart={() => setHoveredTier(tier.id)}
                  onHoverEnd={() => setHoveredTier(null)}
                  className="relative"
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-1">
                        {tier.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`relative h-full transition-all duration-300 ${
                    tier.popular 
                      ? 'border-2 border-purple-500 shadow-xl scale-105' 
                      : 'border border-gray-200 dark:border-gray-700 hover:shadow-lg'
                  } ${hoveredTier === tier.id ? 'transform scale-105' : ''}`}>
                    <CardHeader className="text-center pb-6">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${tier.gradient} text-white mb-4`}>
                        {tier.icon}
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                        {tier.name}
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {tier.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Pricing */}
                      <div className="text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-gray-900 dark:text-white">
                            ${billingCycle === 'monthly' ? tier.price.monthly : tier.price.yearly}
                          </span>
                          {tier.price.monthly > 0 && (
                            <span className="text-gray-500 dark:text-gray-400">
                              /{billingCycle === 'monthly' ? 'mo' : 'year'}
                            </span>
                          )}
                        </div>
                        {billingCycle === 'yearly' && tier.price.monthly > 0 && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Save {getSavings(tier.price.monthly, tier.price.yearly)}% annually
                          </p>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-3">
                        {tier.features.map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 + featureIndex * 0.05 }}
                            className="flex items-start gap-3"
                          >
                            <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <Button
                        className={`w-full bg-gradient-to-r ${tier.gradient} hover:shadow-lg transition-all duration-300 ${
                          tier.ctaVariant === 'outline' 
                            ? 'bg-transparent border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white' 
                            : ''
                        }`}
                        variant={tier.ctaVariant}
                      >
                        {tier.cta}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white/50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Leazo?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Join thousands of users who trust Leazo for their rental needs
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${feature.bgColor} ${feature.color} mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Everything you need to know about our pricing
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  question: "Can I change my plan anytime?",
                  answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans. All payments are secure and encrypted."
                },
                {
                  question: "Is there a setup fee?",
                  answer: "No setup fees! All plans include free setup and onboarding. Our team will help you get started at no additional cost."
                },
                {
                  question: "Do you offer refunds?",
                  answer: "We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your payment, no questions asked."
                },
                {
                  question: "What happens if I exceed my plan limits?",
                  answer: "You'll receive a notification when you're close to your limits. You can upgrade your plan or purchase additional credits."
                },
                {
                  question: "Is customer support included?",
                  answer: "Yes! All plans include customer support. Pro and Business plans include priority support with faster response times."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-6 backdrop-blur-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Join thousands of users who trust Leazo for their rental needs. 
                Start your journey today with our free plan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  Contact Sales
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

