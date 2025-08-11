"use client";

import { Search, Calendar, Truck, RotateCcw, Star, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    icon: Search,
    title: "Browse & Select",
    description:
      "Find the perfect item from our curated catalog of premium products.",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    details: "Thousands of verified items from trusted providers"
  },
  {
    icon: Calendar,
    title: "Choose Dates",
    description: "Select your rental period and check real-time availability.",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    details: "Flexible dates with instant confirmation"
  },
  {
    icon: Truck,
    title: "Get Delivered",
    description:
      "Receive your item via delivery or pickup at your convenience.",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    details: "Same-day delivery available in most cities"
  },
  {
    icon: RotateCcw,
    title: "Return & Repeat",
    description:
      "Return the item and get your deposit back. Rent again anytime!",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    details: "Hassle-free returns with full deposit refund"
  },
];

const features = [
  {
    icon: Shield,
    title: "Secure & Insured",
    description: "All items are insured and verified for your peace of mind.",
    color: "text-emerald-600 dark:text-emerald-400"
  },
  {
    icon: Star,
    title: "Premium Quality",
    description: "Access high-end items that are regularly maintained and updated.",
    color: "text-yellow-600 dark:text-yellow-400"
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our customer support team is available round the clock to help you.",
    color: "text-indigo-600 dark:text-indigo-400"
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              Simple Process
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Renting premium items has never been easier. Follow these simple
              steps to get started and join thousands of satisfied customers.
            </p>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-2xl p-6 h-full hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                {/* Icon */}
                <div className="relative mb-6">
                  <div
                    className={`w-16 h-16 mx-auto rounded-2xl ${step.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </div>

                  {/* Step Number */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                    {index + 1}
                  </div>

                  {/* Connector Line (hidden on last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 -translate-x-8">
                      <motion.div 
                        className="w-0 h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-1000"
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: (index * 0.3) + 0.5 }}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{step.details}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">
                Ready to Start Renting?
              </h3>
              <p className="text-blue-100 mb-8 text-lg">
                Join thousands of satisfied customers and start your sustainable journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                  <Link href="/catalog">
                    <Search className="h-5 w-5 mr-2" />
                    Browse Items
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/signup">Get Started Free</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
