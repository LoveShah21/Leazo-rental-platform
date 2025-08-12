"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/catalog/product-card";
import { Grid, List, SlidersHorizontal, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { fetchProducts } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ProductGrid() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("created");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", { sortBy }],
    queryFn: () => fetchProducts({ sort: sortBy }),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const products = useMemo(() => {
    if (!data?.products) return [];
    return data.products;
  }, [data]);

  if (isError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load products. {error?.message || 'Please try again later.'}
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Button onClick={() => window.location.reload()}>
            Retry Loading Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b">
        <div>
          <p className="text-muted-foreground flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading products...
              </>
            ) : (
              `Showing ${products.length} of ${data?.pagination?.total || 0} products`
            )}
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
                <SelectItem value="created">Newest First</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
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
            <div key={index} className="space-y-3">
              <div className="h-48 bg-muted animate-pulse rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-6 bg-muted animate-pulse rounded w-1/4" />
              </div>
            </div>
          ))}

        {!isLoading && products.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="space-y-4">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                <Grid className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or check back later for new products.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/customer">Return to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}

        {!isLoading &&
          products.map((product, index) => (
          <motion.div
            key={product._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <Link href={`/products/${product._id}`} className="block">
              <ProductCard
                product={{
                  id: product._id,
                  name: product.name,
                  category: product.category || 'Uncategorized',
                  location: product.inventory?.[0]?.locationId || 'Location not specified',
                  rating: product.rating?.average || 0,
                  reviewCount: product.rating?.count || 0,
                  greenScore: product.greenScore?.score || 0,
                  pricing: {
                    day: product.pricing?.basePrice?.daily || product.pricing?.daily || 0,
                    week: product.pricing?.basePrice?.weekly || product.pricing?.weekly || 0,
                    month: product.pricing?.basePrice?.monthly || product.pricing?.monthly || 0,
                  },
                  deposit: product.pricing?.deposit?.amount || 0,
                  images: product.images?.map((i) => i.url).filter(Boolean) || [],
                  availability: (product.inventory?.[0]?.quantity ?? 0) > 0 ? "available" : "unavailable",
                  shortDescription: product.shortDescription,
                  specifications: product.specifications,
                  inventory: product.inventory?.map(inv => ({ quantity: inv.quantity ?? 0 })) || [],
                  rentalTerms: product.rentalTerms,
                }}
                viewMode={viewMode}
              />
            </Link>
          </motion.div>
          ))}
      </motion.div>

      {/* Pagination - Future implementation */}
      {!isLoading && products.length > 0 && (
        <div className="flex justify-between items-center pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Page {data?.pagination?.page || 1} of {data?.pagination?.pages || 1}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
