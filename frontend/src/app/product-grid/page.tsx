"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProductGridPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard/customer">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Browse Products</h1>
              <p className="text-muted-foreground">
                Discover amazing items available for rent from our verified providers
              </p>
            </div>
          </div>

          {/* Product Grid */}
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
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
