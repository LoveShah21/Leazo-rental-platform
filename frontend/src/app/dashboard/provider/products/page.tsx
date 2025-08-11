"use client";
import { useEffect, useMemo, useState } from "react";
import { Protected } from "@/components/auth-provider";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, DollarSign, Camera, Edit, Trash2, Eye } from "lucide-react";
import { createProviderProduct, deleteProviderProduct, fetchProviderProducts, type ProviderProductItem } from "@/lib/provider";

export default function ProviderProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProviderProductItem[]>([]);
  const [pagination, setPagination] = useState<{ page: number; total: number; limit: number; pages: number } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    category: "electronics" as any,
    pricePerDay: "",
    deposit: "",
    images: [] as File[],
    quantity: "",
    locationId: "",
  });

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchProviderProducts({ page: 1, limit: 20 });
      setProducts(res.products);
      setPagination(res.pagination);
    } catch (e: any) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await createProviderProduct({
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription || undefined,
        category: formData.category,
        pricing: {
          daily: Number(formData.pricePerDay),
          deposit: formData.deposit ? { amount: Number(formData.deposit), required: true } : undefined,
        },
        inventory: { quantity: Number(formData.quantity || 1), locationId: formData.locationId },
        images: formData.images,
      });
      setShowForm(false);
      setFormData({ name: "", description: "", shortDescription: "", category: "electronics" as any, pricePerDay: "", deposit: "", images: [], quantity: "", locationId: "" });
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      setLoading(true);
      await deleteProviderProduct(id);
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected roles={["provider", "staff", "manager"]}>
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="Products"
          subtitle="Manage your catalog, pricing, and stock."
          actions={
            <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          }
        />

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4 text-red-700 dark:text-red-300">{error}</CardContent>
          </Card>
        )}

        {showForm && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Add New Product
              </CardTitle>
              <CardDescription>Fill in the details to list your item for rent.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Professional DSLR Camera"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      required
                    >
                      {[
                        "electronics","furniture","appliances","tools","sports","automotive","clothing","books","toys","other"
                      ].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief summary for cards"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your product's features, condition, and what's included..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pricePerDay">Price per Day (currency based on backend)</Label>
                    <Input
                      id="pricePerDay"
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.pricePerDay}
                      onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                      placeholder="25.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deposit">Security Deposit</Label>
                    <Input
                      id="deposit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.deposit}
                      onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                      placeholder="100.00"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location ID</Label>
                    <Input
                      id="location"
                      value={formData.locationId}
                      onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                      placeholder="Enter valid Location ID"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Product Images</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Camera className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">Upload one or more images</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setFormData({ ...formData, images: Array.from(e.target.files || []) })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
                    Create Product
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Products ({products.length})</h3>
            <div className="flex gap-2">
              <Badge variant="secondary">{products.filter((p) => p.status === "active").length} Active</Badge>
              <Badge variant="outline">{products.filter((p) => p.status !== "active").length} Other</Badge>
            </div>
          </div>

          {loading && <div className="text-sm text-muted-foreground">Loading products...</div>}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product._id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted rounded-md mb-3 flex items-center justify-center overflow-hidden">
                    {product.images?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0].url} alt={product.name} className="object-cover w-full h-full" />
                    ) : (
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {product.pricing?.basePrice?.daily ? `${product.pricing.basePrice.daily}/day` : "—"}
                    </span>
                    <span className="text-muted-foreground capitalize">{product.status}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" disabled>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(product._id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Protected>
  );
}