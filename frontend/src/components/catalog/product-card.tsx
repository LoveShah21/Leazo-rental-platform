"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Leaf, Calendar, Shield, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    location: string;
    rating: number;
    reviewCount: number;
    greenScore: number;
    pricing: {
      day: number;
      week?: number;
      month?: number;
    };
    deposit: number;
    images: string[];
    availability: string;
    shortDescription?: string;
    specifications?: {
      brand?: string;
      model?: string;
      condition?: string;
    };
    inventory?: {
      quantity: number;
    }[];
    rentalTerms?: {
      minRentalDays?: number;
      requiresApproval?: boolean;
    };
  };
  viewMode: "grid" | "list";
}

export function ProductCard({ product, viewMode }: ProductCardProps) {
  const primaryImage = product.images?.[0];
  const inventory = product.inventory?.[0];

  if (viewMode === "list") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="md:w-1/3 relative">
              <div className="aspect-[4/3] md:aspect-square bg-muted relative overflow-hidden">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.greenScore > 0 && (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      <Leaf className="h-3 w-3 mr-1" />
                      {product.greenScore}
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className="bg-white/90 text-gray-800"
                  >
                    {product.category}
                  </Badge>
                </div>

                {/* Availability */}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={
                      product.availability === "available"
                        ? "default"
                        : "destructive"
                    }
                    className={
                      product.availability === "available"
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }
                  >
                    {inventory?.quantity || 0} available
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <CardContent className="md:w-2/3 p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {product.name}
                  </h3>
                  {product.shortDescription && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {product.shortDescription}
                    </p>
                  )}
                </div>

                {/* Specifications */}
                {product.specifications && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {product.specifications.brand && (
                      <Badge variant="outline">
                        {product.specifications.brand}
                      </Badge>
                    )}
                    {product.specifications.model && (
                      <Badge variant="outline">
                        {product.specifications.model}
                      </Badge>
                    )}
                    {product.specifications.condition && (
                      <Badge variant="outline">
                        {product.specifications.condition}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Rating and Location */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                          {product.rating.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">
                          ({product.reviewCount})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{product.location}</span>
                    </div>
                  </div>

                  {product.rentalTerms?.requiresApproval && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      Approval Required
                    </Badge>
                  )}
                </div>
              </div>

              {/* Pricing Section */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(product.pricing.day)}
                      </span>
                      <span className="text-sm text-muted-foreground">/day</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {product.pricing.week && (
                        <span>{formatCurrency(product.pricing.week)}/week</span>
                      )}
                      {product.deposit > 0 && (
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {formatCurrency(product.deposit)} deposit
                        </div>
                      )}
                    </div>
                  </div>

                  {product.rentalTerms?.minRentalDays && (
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        Min rental
                      </div>
                      <div className="text-sm font-medium">
                        {product.rentalTerms.minRentalDays} day
                        {product.rentalTerms.minRentalDays !== 1 ? "s" : ""}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm group">
        {/* Image */}
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.greenScore > 0 && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg">
                <Leaf className="h-3 w-3 mr-1" />
                {product.greenScore}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="bg-white/90 text-gray-800 shadow-lg"
            >
              {product.category}
            </Badge>
          </div>

          {/* Availability */}
          <div className="absolute top-3 right-3">
            <Badge
              variant={
                product.availability === "available"
                  ? "default"
                  : "destructive"
              }
              className={`shadow-lg ${
                product.availability === "available"
                  ? "bg-green-500 hover:bg-green-600"
                  : ""
              }`}
            >
              {inventory?.quantity || 0} available
            </Badge>
          </div>

          {/* Approval Required Badge */}
          {product.rentalTerms?.requiresApproval && (
            <div className="absolute bottom-3 left-3">
              <Badge
                variant="outline"
                className="bg-white/90 text-orange-600 border-orange-200"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Approval Required
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
            {product.shortDescription && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {product.shortDescription}
              </p>
            )}
          </div>

          {/* Specifications */}
          {product.specifications && (
            <div className="flex flex-wrap gap-1">
              {product.specifications.brand && (
                <Badge variant="outline" className="text-xs">
                  {product.specifications.brand}
                </Badge>
              )}
              {product.specifications.model && (
                <Badge variant="outline" className="text-xs">
                  {product.specifications.model}
                </Badge>
              )}
              {product.specifications.condition && (
                <Badge variant="outline" className="text-xs">
                  {product.specifications.condition}
                </Badge>
              )}
            </div>
          )}

          {/* Rating and Location */}
          <div className="space-y-2">
            {product.rating > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No reviews yet</div>
            )}

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {product.location}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(product.pricing.day)}
              </span>
              <span className="text-sm text-muted-foreground">/day</span>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              {product.pricing.week && (
                <div>{formatCurrency(product.pricing.week)}/week</div>
              )}
              {product.pricing.month && (
                <div>{formatCurrency(product.pricing.month)}/month</div>
              )}

              <div className="flex items-center justify-between">
                {product.deposit > 0 && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <Shield className="h-3 w-3" />
                    {formatCurrency(product.deposit)} deposit
                  </div>
                )}
                {product.rentalTerms?.minRentalDays && (
                  <div>
                    Min {product.rentalTerms.minRentalDays} day
                    {product.rentalTerms.minRentalDays !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
