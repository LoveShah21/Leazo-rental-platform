"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Leaf, Heart, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  greenScore: number;
  pricing: { day: number; week: number };
  deposit: number;
  images: string[];
  availability: "available" | "low-stock" | "unavailable";
}

interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
}

export function ProductCard({ product, viewMode }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Add to cart with default 1-day rental
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    addItem({
      productId: product.id,
      startDate: tomorrow.toISOString(),
      endDate: dayAfter.toISOString(),
      duration: 1,
      durationUnit: "day",
      price: product.pricing.day,
      deposit: product.deposit,
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const getGreenBadge = (score: number) => {
    if (score >= 90) return { label: "Gold", color: "bg-yellow-500" };
    if (score >= 80) return { label: "Silver", color: "bg-gray-400" };
    if (score >= 60) return { label: "Bronze", color: "bg-yellow-600" };
    return null;
  };

  const greenBadge = getGreenBadge(product.greenScore);

  if (viewMode === "list") {
    return (
      <Link href={`/products/${product.id}`}>
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-background rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
        >
          <div className="flex gap-4 p-4">
            {/* Image */}
            <div className="w-32 h-24 bg-muted rounded-lg flex-shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20" />

              {/* Green Score Badge */}
              {greenBadge && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-success-500 text-white text-xs font-medium rounded-full">
                  <Leaf className="h-3 w-3" />
                  {product.greenScore}
                </div>
              )}

              {/* Availability Badge */}
              {product.availability === "low-stock" && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="text-xs">
                    Low Stock
                  </Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {product.category}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLike}
                  className="flex-shrink-0"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isLiked ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning-400 text-warning-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {product.location}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">
                      {formatCurrency(product.pricing.day)}
                    </span>
                    <span className="text-sm text-muted-foreground">/day</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(product.pricing.week)}/week •{" "}
                    {formatCurrency(product.deposit)} deposit
                  </div>
                </div>

                <Button onClick={handleAddToCart} className="flex-shrink-0">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group bg-background rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        {/* Image */}
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {greenBadge && (
              <div className="flex items-center gap-1 px-2 py-1 bg-success-500 text-white text-xs font-medium rounded-full">
                <Leaf className="h-3 w-3" />
                {product.greenScore}
              </div>
            )}

            {product.availability === "low-stock" && (
              <Badge variant="destructive" className="text-xs">
                Low Stock
              </Badge>
            )}
          </div>

          {/* Like Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <Heart
              className={`h-4 w-4 ${
                isLiked ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </Button>

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
              <span className="text-sm font-medium">{product.rating}</span>
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
              <span className="text-sm text-muted-foreground">/day</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(product.pricing.week)}/week •{" "}
              {formatCurrency(product.deposit)} deposit
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full"
            disabled={product.availability === "unavailable"}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.availability === "unavailable"
              ? "Unavailable"
              : "Add to Cart"}
          </Button>
        </div>
      </motion.div>
    </Link>
  );
}
