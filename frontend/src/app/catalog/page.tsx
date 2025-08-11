import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductGrid } from "@/components/catalog/product-grid";
import { SearchFilters } from "@/components/catalog/search-filters";
import { Suspense } from "react";

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Items</h1>
          <p className="text-muted-foreground">
            Discover premium items available for rent in your area
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Suspense
              fallback={
                <div className="h-96 bg-muted animate-pulse rounded-lg" />
              }
            >
              <SearchFilters />
            </Suspense>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-80 bg-muted animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              }
            >
              <ProductGrid />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
