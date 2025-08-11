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
    <section className="py-24 bg-muted/30">
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
              Featured Items
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our most popular and highly-rated rental items, carefully
              curated for quality and sustainability.
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
                <div className="bg-background rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  {/* Image */}
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20" />

                    {/* Green Score Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-success-500 text-white text-xs font-medium rounded-full">
                      <Leaf className="h-3 w-3" />
                      {product.greenScore}
                    </div>

                    {/* Placeholder for actual image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                          <span className="text-lg">📷</span>
                        </div>
                        <div className="text-sm font-medium text-primary-700 dark:text-primary-300">
                          {product.category}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {product.location}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning-400 text-warning-400" />
                        <span className="text-sm font-medium">
                          {product.rating}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold">
                          {formatCurrency(product.pricing.day)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /day
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
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
          <Button size="lg" asChild>
            <Link href="/catalog">View All Items</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
