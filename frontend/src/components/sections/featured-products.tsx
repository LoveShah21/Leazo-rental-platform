"use client";

import { Button } from "@/components/ui/button";
import { Star, MapPin, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

// Mock data - replace with actual API call
const featuredProducts = [
  {
    id: "1",
    name: "Professional DSLR Camera",
    category: "Photography",
    location: "San Francisco, CA",
    rating: 4.8,
    reviewCount: 124,
    greenScore: 85,
    pricing: { day: 45, week: 280 },
    deposit: 200,
    image: "/api/placeholder/300/200",
  },
  {
    id: "2",
    name: "Mountain Bike - Trek",
    category: "Sports & Recreation",
    location: "Austin, TX",
    rating: 4.9,
    reviewCount: 89,
    greenScore: 92,
    pricing: { day: 35, week: 210 },
    deposit: 150,
    image: "/api/placeholder/300/200",
  },
  {
    id: "3",
    name: "Power Drill Set",
    category: "Tools & Equipment",
    location: "Denver, CO",
    rating: 4.7,
    reviewCount: 156,
    greenScore: 78,
    pricing: { day: 25, week: 140 },
    deposit: 75,
    image: "/api/placeholder/300/200",
  },
  {
    id: "4",
    name: "Camping Tent - 4 Person",
    category: "Outdoor Gear",
    location: "Seattle, WA",
    rating: 4.6,
    reviewCount: 203,
    greenScore: 88,
    pricing: { day: 30, week: 180 },
    deposit: 100,
    image: "/api/placeholder/300/200",
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-gray-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900/10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              Featured Collection
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Featured Items
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover our most popular and highly-rated rental items, carefully
              curated for quality, sustainability, and exceptional user experience.
            </p>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/products/${product.id}`}>
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105">
                  {/* Image */}
                  <div className="aspect-[4/3] bg-muted dark:bg-slate-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20" />

                    {/* Green Score Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 bg-emerald-500 dark:bg-emerald-600 text-white text-xs font-medium rounded-full shadow-lg">
                      <Leaf className="h-3 w-3" />
                      {product.greenScore}
                    </div>

                    {/* Placeholder for actual image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-white/20 dark:bg-slate-600/20 backdrop-blur-sm flex items-center justify-center mb-3 shadow-lg">
                          <span className="text-2xl">📷</span>
                        </div>
                        <div className="text-sm font-medium text-primary-700 dark:text-primary-300 bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-full backdrop-blur-sm">
                          {product.category}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground dark:text-slate-400 mt-1">
                        <MapPin className="h-3 w-3" />
                        {product.location}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.rating}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground dark:text-slate-400">
                        ({product.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(product.pricing.day)}
                        </span>
                        <span className="text-sm text-muted-foreground dark:text-slate-400">
                          /day
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground dark:text-slate-400">
                        {formatCurrency(product.pricing.week)}/week •{" "}
                        {formatCurrency(product.deposit)} deposit
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Button size="lg" className="shadow-lg" asChild>
            <Link href="/catalog">
              View All Items
              <Star className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
