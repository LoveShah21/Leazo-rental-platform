"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { fetchProducts } from "@/lib/api";

export function ProductGrid() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("created");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", { sortBy }],
  queryFn: () => fetchProducts({ sort: sortBy }),
  });

  const products = useMemo(() => data?.products ?? [], [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-muted-foreground">
            {isLoading
              ? "Loading items..."
              : isError
              ? "Failed to load items"
              : `Showing ${products.length} items`}
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
                <SelectItem value="created">Newest</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="name">Name</SelectItem>
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
        {isLoading &&
          Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))}

        {!isLoading && products.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground">
            No items found.
          </div>
        )}

        {!isLoading &&
          products.map((product, index) => (
          <motion.div
            key={(product as any)._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <ProductCard
              product={{
                id: (product as any)._id,
                name: product.name,
                category: product.category || "",
                location: "",
                rating: product.rating?.average || 0,
                reviewCount: product.rating?.count || 0,
                greenScore: product.greenScore?.score || 0,
                pricing: {
                  day: product.pricing?.basePrice?.daily || 0,
                  week: product.pricing?.basePrice?.weekly || 0,
                },
                deposit: product.pricing?.deposit?.amount || 0,
                images: product.images?.map((i) => i.url) || [],
                availability: "available",
              }}
              viewMode={viewMode}
            />
          </motion.div>
          ))}
      </motion.div>

      {/* Load More */}
      <div className="text-center pt-8">
        <Button variant="outline" size="lg" disabled>
          Load More Items
        </Button>
      </div>
    </div>
  );
}
