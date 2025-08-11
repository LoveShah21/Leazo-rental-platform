"use client";

import { Leaf, Recycle, Users, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  {
    icon: TrendingDown,
    value: "85%",
    label: "Less Carbon Footprint",
    description: "Compared to buying new items",
  },
  {
    icon: Recycle,
    value: "2.3M",
    label: "Items Kept in Circulation",
    description: "Preventing waste and extending product life",
  },
  {
    icon: Users,
    value: "50K+",
    label: "Community Members",
    description: "Building a sustainable sharing economy",
  },
  {
    icon: Leaf,
    value: "95%",
    label: "Waste Reduction",
    description: "Through our circular economy model",
  },
];

export function Sustainability() {
  return (
    <section className="py-24 bg-gradient-to-br from-success-50 via-background to-success-50/30 dark:from-success-950/10 dark:via-background dark:to-success-950/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 text-sm font-medium mb-6">
              <Leaf className="h-4 w-4" />
              Sustainability Impact
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Building a Greener Future
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every rental makes a difference. Join our community in creating a
              more sustainable world through the sharing economy.
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="bg-background rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-6 w-6 text-success-600 dark:text-success-400" />
                </div>

                <div className="text-3xl font-bold text-success-600 dark:text-success-400 mb-2">
                  {stat.value}
                </div>

                <div className="font-semibold mb-2">{stat.label}</div>

                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Green Score Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-background rounded-2xl border p-8 lg:p-12"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Understanding Green Scores
              </h3>
              <p className="text-muted-foreground mb-6">
                Every item on our platform has a Green Score that measures its
                environmental impact and sustainability benefits. Higher scores
                indicate greater positive impact.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div>
                    <div className="font-medium">Bronze (60-79)</div>
                    <div className="text-sm text-muted-foreground">
                      Good environmental impact
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <div>
                    <div className="font-medium">Silver (80-89)</div>
                    <div className="text-sm text-muted-foreground">
                      Great environmental impact
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-600" />
                  <div>
                    <div className="font-medium">Gold (90-100)</div>
                    <div className="text-sm text-muted-foreground">
                      Exceptional environmental impact
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-success-100 to-success-200 dark:from-success-900/20 dark:to-success-800/20 p-8">
                <div className="w-full h-full rounded-xl bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-success-600 flex items-center justify-center">
                      <Leaf className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                        92
                      </div>
                      <div className="text-sm font-medium">Green Score</div>
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-full">
                        <Leaf className="h-3 w-3" />
                        Gold Badge
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
