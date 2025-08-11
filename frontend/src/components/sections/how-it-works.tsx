"use client";

import { Search, Calendar, Truck, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Search,
    title: "Browse & Select",
    description:
      "Find the perfect item from our curated catalog of premium products.",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: Calendar,
    title: "Choose Dates",
    description: "Select your rental period and check real-time availability.",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    icon: Truck,
    title: "Get Delivered",
    description:
      "Receive your item via delivery or pickup at your convenience.",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: RotateCcw,
    title: "Return & Repeat",
    description:
      "Return the item and get your deposit back. Rent again anytime!",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Renting premium items has never been easier. Follow these simple
              steps to get started.
            </p>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center group"
            >
              {/* Icon */}
              <div className="relative mb-6">
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl ${step.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>

                {/* Step Number */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                  {index + 1}
                </div>

                {/* Connector Line (hidden on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-border -translate-x-8">
                    <div className="w-0 h-full bg-primary-600 group-hover:w-full transition-all duration-1000 delay-300" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-muted/50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">
              Why Choose Our Platform?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="font-medium mb-2">🛡️ Secure & Insured</div>
                <p className="text-muted-foreground">
                  All items are insured and verified for your peace of mind.
                </p>
              </div>
              <div>
                <div className="font-medium mb-2">🌱 Eco-Friendly</div>
                <p className="text-muted-foreground">
                  Reduce waste and carbon footprint by sharing resources.
                </p>
              </div>
              <div>
                <div className="font-medium mb-2">💰 Cost-Effective</div>
                <p className="text-muted-foreground">
                  Access premium items at a fraction of the purchase cost.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
