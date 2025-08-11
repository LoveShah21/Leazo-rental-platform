"use client";

import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-blue-50 py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Sustainable Rental Platform
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Rent Premium Items
                <span className="text-blue-600"> Sustainably</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                Access high-quality items when you need them. Reduce waste, save
                money, and live more sustainably with our curated rental
                marketplace.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group" asChild>
                <Link href="/catalog">
                  <Search className="h-5 w-5 mr-2" />
                  Browse Items
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/how-it-works">How it Works</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div>
                <div className="text-2xl font-bold text-blue-600">10K+</div>
                <div className="text-sm text-gray-600">Items Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">50+</div>
                <div className="text-sm text-gray-600">Cities Served</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">95%</div>
                <div className="text-sm text-gray-600">
                  Customer Satisfaction
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 p-8">
              {/* Placeholder for hero image */}
              <div className="w-full h-full rounded-xl bg-white shadow-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-600 flex items-center justify-center">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">Premium Items</div>
                    <div className="text-sm text-gray-600">Ready to Rent</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -right-4 top-8 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Eco-Friendly</div>
                  <div className="text-xs text-gray-600">95% less waste</div>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 bottom-8 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Fast Delivery</div>
                  <div className="text-xs text-gray-600">
                    Same day available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
