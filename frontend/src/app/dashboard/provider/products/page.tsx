"use client";
import { useState } from "react";
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

export default function ProviderProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    pricePerDay: "",
    deposit: "",
    images: [] as string[]
  });

  const mockProducts = [
    {
      id: "1",
      name: "Professional DSLR Camera",
      category: "Photography",
      pricePerDay: 45,
      deposit: 200,
      status: "active",
      images: ["camera1.jpg"],
      totalBookings: 12
    },
    {
      id: "2", 
      name: "Mountain Bike",
      category: "Sports",
      pricePerDay: 35,
      deposit: 150,
      status: "active",
      images: ["bike1.jpg"],
      totalBookings: 8
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating product:", formData);
    setShowForm(false);
    setFormData({ name: "", description: "", category: "", pricePerDay: "", deposit: "", images: [] });
  };

  return (
    <Protected roles={["provider", "staff", "manager"]}>
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader 
          title="Products" 
          subtitle="Manage your catalog, pricing, and stock."
          actions={
            <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          }
        />

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
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Professional DSLR Camera"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input 
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="e.g., Photography, Sports, Tools"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your product's features, condition, and what's included..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pricePerDay">Price per Day ($)</Label>
                    <Input 
                      id="pricePerDay"
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.pricePerDay}
                      onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
                      placeholder="25.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deposit">Security Deposit ($)</Label>
                    <Input 
                      id="deposit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.deposit}
                      onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                      placeholder="100.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Product Images</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Camera className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">Drag & drop images or click to browse</p>
                    <Button type="button" variant="outline" size="sm">
                      Upload Images
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
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
            <h3 className="text-lg font-semibold">Your Products ({mockProducts.length})</h3>
            <div className="flex gap-2">
              <Badge variant="secondary">2 Active</Badge>
              <Badge variant="outline">0 Draft</Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted rounded-md mb-3 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
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
                      ${product.pricePerDay}/day
                    </span>
                    <span className="text-muted-foreground">{product.totalBookings} bookings</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
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

