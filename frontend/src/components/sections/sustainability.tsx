"use client";

import { Leaf, Recycle, Users, TrendingDown, Globe, Heart, TreePine, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const stats = [
  {
    icon: TrendingDown,
    value: "85%",
    label: "Less Carbon Footprint",
    description: "Compared to buying new items",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30"
  },
  {
    icon: Recycle,
    value: "2.3M",
    label: "Items Kept in Circulation",
    description: "Preventing waste and extending product life",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30"
  },
  {
    icon: Users,
    value: "50K+",
    label: "Community Members",
    description: "Building a sustainable sharing economy",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30"
  },
  {
    icon: Leaf,
    value: "95%",
    label: "Waste Reduction",
    description: "Through our circular economy model",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30"
  },
];

const impactAreas = [
  {
    icon: Globe,
    title: "Environmental Impact",
    description: "Reducing manufacturing demand and carbon emissions globally",
    benefits: ["Lower CO2 emissions", "Reduced resource consumption", "Less manufacturing waste"]
  },
  {
    icon: Heart,
    title: "Community Building",
    description: "Creating connections and sharing resources within communities",
    benefits: ["Local partnerships", "Shared prosperity", "Community trust"]
  },
  {
    icon: TreePine,
    title: "Conservation",
    description: "Preserving natural resources for future generations",
    benefits: ["Forest protection", "Water conservation", "Biodiversity support"]
  }
];

export function Sustainability() {
  return (
    <section className="py-24 bg-gradient-to-br from-emerald-50 via-white to-green-50/30 dark:from-emerald-950/10 dark:via-slate-900 dark:to-green-950/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-emerald-400 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-green-400 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
              <Leaf className="h-4 w-4" />
              Sustainability Impact
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400 bg-clip-text text-transparent">
              Building a Greener Future
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Every rental makes a difference. Join our community in creating a
              more sustainable world through the sharing economy and see your positive impact grow.
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 h-full">
                <div className={`w-14 h-14 mx-auto mb-6 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>

                <motion.div 
                  className={`text-4xl font-bold ${stat.color} mb-3 text-center`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                >
                  {stat.value}
                </motion.div>

                <div className="text-center">
                  <div className="font-semibold mb-3 text-gray-900 dark:text-white">{stat.label}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Impact Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Our Impact Areas</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how our platform creates positive change across multiple dimensions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {impactAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 flex items-center justify-center">
                  <area.icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">{area.title}</h4>
                <p className="text-muted-foreground text-center mb-6">{area.description}</p>
                <div className="space-y-2">
                  {area.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-emerald-500" />
                      <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Green Score Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-slate-700/50 p-8 lg:p-12 shadow-xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                  Understanding Green Scores
                </h3>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  Every item on our platform has a Green Score that measures its
                  environmental impact and sustainability benefits. Higher scores
                  indicate greater positive impact.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Bronze (60-79)</div>
                      <div className="text-sm text-muted-foreground">
                        Good environmental impact
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-xl">
                    <div className="w-4 h-4 rounded-full bg-gray-400 shadow-lg" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Silver (80-89)</div>
                      <div className="text-sm text-muted-foreground">
                        Great environmental impact
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <div className="w-4 h-4 rounded-full bg-yellow-600 shadow-lg" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Gold (90-100)</div>
                      <div className="text-sm text-muted-foreground">
                        Exceptional environmental impact
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/20 dark:to-green-800/20 p-8 shadow-xl">
                  <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center border dark:border-slate-700">
                    <div className="text-center space-y-6">
                      <motion.div 
                        className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Leaf className="h-10 w-10 text-white" />
                      </motion.div>
                      <div className="space-y-3">
                        <motion.div 
                          className="text-4xl font-bold text-emerald-600 dark:text-emerald-400"
                          initial={{ opacity: 0, scale: 0.5 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                        >
                          92
                        </motion.div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">Green Score</div>
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm font-medium rounded-full shadow-md">
                          <Leaf className="h-4 w-4" />
                          Gold Badge
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Heart className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                Make a Difference Today
              </h3>
              <p className="text-emerald-100 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
                Start your sustainable journey and see the positive impact you can make on our planet.
                Every rental counts towards a greener future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100 shadow-lg" asChild>
                  <Link href="/catalog">
                    <Leaf className="h-5 w-5 mr-2" />
                    Start Renting Green
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600 shadow-lg" asChild>
                  <Link href="/sustainability">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
