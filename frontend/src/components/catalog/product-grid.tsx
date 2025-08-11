"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/catalog/product-card";
import { Grid, List, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

// Mock data - replace with actual API call
const mockProducts = [
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
    images: ["/api/placeholder/300/200"],
    availability: "available",
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
    images: ["/api/placeholder/300/200"],
    availability: "available",
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
    images: ["/api/placeholder/300/200"],
    availability: "low-stock",
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
    images: ["/api/placeholder/300/200"],
    availability: "available",
  },
  {
    id: "5",
    name: "Drone with 4K Camera",
    category: "Photography",
    location: "Los Angeles, CA",
    rating: 4.9,
    reviewCount: 67,
    greenScore: 82,
    pricing: { day: 65, week: 390 },
    deposit: 300,
    images: ["/api/placeholder/300/200"],
    availability: "available",
  },
  {
    id: "6",
    name: "Electric Scooter",
    category: "Transportation",
    location: "Miami, FL",
    rating: 4.5,
    reviewCount: 145,
    greenScore: 95,
    pricing: { day: 20, week: 120 },
    deposit: 100,
    images: ["/api/placeholder/300/200"],
    availability: "available",
  },
];

export function ProductGrid() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [products] = useState(mockProducts);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-muted-foreground">
            Showing {products.length} items
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products */}
      <motion.div
        layout
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <ProductCard product={product} viewMode={viewMode} />
          </motion.div>
        ))}
      </motion.div>

      {/* Load More */}
      <div className="text-center pt-8">
        <Button variant="outline" size="lg">
          Load More Items
        </Button>
      </div>
    </div>
  );
}
