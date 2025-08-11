import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Browse Products</h1>
            <p className="text-muted-foreground">
              Discover amazing items available for rent in your area
            </p>
          </div>

          {/* Product Grid */}
          <Card>
            <CardContent className="p-6">
              <ProductGrid />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
