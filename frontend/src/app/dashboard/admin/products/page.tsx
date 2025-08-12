"use client";

import { useEffect, useMemo, useState } from "react";
import { Protected } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Package,
  Star,
  MapPin,
  DollarSign,
  Calendar,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
import {
  fetchAdminProducts,
  fetchAllAdminProducts,
  updateAdminProduct,
  type AdminProduct,
} from "@/lib/admin";
import { toast } from "@/components/ui/toaster";

type StatusFilter = "all" | "active" | "inactive" | "draft" | "archived";

type CategoryFilter =
  | "all"
  | "electronics"
  | "furniture"
  | "appliances"
  | "tools"
  | "sports"
  | "automotive"
  | "clothing"
  | "books"
  | "toys"
  | "other";

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [pages, setPages] = useState(1);
  const [loadAll, setLoadAll] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      if (loadAll) {
        const all = await fetchAllAdminProducts({
          page: 1,
          limit: 200,
          search: searchTerm || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          sort: "created",
        });
        setItems(all);
        setPages(1);
      } else {
        const res = await fetchAdminProducts({
          page,
          limit: 20,
          search: searchTerm || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          sort: "created",
        });
        setItems(res.products);
        setPages(res.pagination.pages);
      }
      setError(null);
    } catch (e: any) {
      const message = e?.message || "Failed to load products";
      console.error("Admin products load error:", e);
      setError(message);
      setItems([]);
      toast({
        title: "Could not load products",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, loadAll]);

  useEffect(() => {
    if (loadAll) {
      setPage(1);
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, categoryFilter, loadAll]);

  const stats = useMemo(
    () => ({
      totalProducts: items.length,
      activeProducts: items.filter((p) => p.status === "active").length,
      pendingProducts: items.filter((p) => p.status === "draft").length,
      flaggedProducts: 0,
      suspendedProducts: items.filter((p) => p.status === "inactive").length,
    }),
    [items]
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/40",
      draft:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800/40",
      inactive:
        "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/40",
      archived:
        "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800/40",
    };
    return variants[status] || variants.draft;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return (
          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
        );
      case "draft":
        return (
          <Clock className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
        );
      case "inactive":
        return <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />;
      case "archived":
        return (
          <AlertTriangle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        );
      default:
        return <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const filteredProducts = items.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${product.owner?.firstName ?? ""} ${product.owner?.lastName ?? ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAction = async (productId: string, action: string) => {
    try {
      if (action === "approve")
        await updateAdminProduct(productId, { status: "active" });
      if (action === "reject")
        await updateAdminProduct(productId, { status: "inactive" });
      if (action === "suspend")
        await updateAdminProduct(productId, { status: "inactive" });
      if (action === "reactivate")
        await updateAdminProduct(productId, { status: "active" });
      await load();
      const copy: Record<string, string> = {
        approve: "Product approved",
        reject: "Product rejected",
        suspend: "Product suspended",
        reactivate: "Product reactivated",
      };
      toast({ title: copy[action] || "Updated", variant: "success" });
    } catch (e: unknown) {
      const message = e?.message || "Failed to update product";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Protected roles={["admin", "super_admin", "manager", "staff"]}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-8">
          <PageHeader
            title="Product Moderation"
            subtitle="Review, approve, and moderate product listings to maintain platform quality"
          />

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.totalProducts}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Active
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {stats.activeProducts}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    Draft
                  </p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    {stats.pendingProducts}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    Inactive
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {stats.suspendedProducts}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="dark:text-gray-200">
                  Search Products
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by name or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="dark:text-gray-200">
                  Status
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="dark:text-gray-200">
                  Category
                </Label>
                <Select
                  value={categoryFilter}
                  onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="appliances">Appliances</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="toys">Toys</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setPage(1);
                    load();
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
              <div className="space-y-2 flex items-end">
                <div className="flex gap-2 w-full">
                  <Button
                    variant={loadAll ? "default" : "outline"}
                    className="w-1/2"
                    onClick={() => {
                      setLoadAll(true);
                      setPage(1);
                    }}
                  >
                    Load all
                  </Button>
                  <Button
                    variant={!loadAll ? "default" : "outline"}
                    className="w-1/2"
                    onClick={() => {
                      setLoadAll(false);
                      setPage(1);
                    }}
                  >
                    Paginated
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Error/Loading */}
          {error && (
            <Card className="p-4 border-0 shadow-lg bg-red-50 text-red-700">
              {error}
            </Card>
          )}

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm"
                >
                  <div className="p-6">
                    <div className="aspect-square w-full bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((product) => (
              <Card
                key={product._id}
                className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  {/* Product Image */}
                  <div className="relative mb-4">
                    <div className="aspect-square w-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusBadge(product.status)}>
                        {getStatusIcon(product.status)}
                        <span className="ml-1">
                          {product.status.replace("_", " ")}
                        </span>
                      </Badge>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {product.owner
                        ? `${product.owner.firstName ?? ""} ${
                            product.owner.lastName ?? ""
                          }`.trim()
                        : "Unknown Owner"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {product.category}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    &nbsp;
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500 dark:text-green-400" />
                        <span className="text-sm font-medium dark:text-gray-200">
                          ${product.pricing?.basePrice?.daily ?? 0}/day
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          &nbsp;
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                        <span className="text-sm font-medium dark:text-gray-200">
                          {product.rating?.average ?? 0}/5.0 (
                          {product.rating?.count ?? 0} reviews)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          &nbsp;
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(product._id, "view")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(product._id, "message")}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message Provider
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {product.status === "draft" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction(product._id, "approve")}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(product._id, "reject")}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {product.status === "active" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(product._id, "suspend")}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        </>
                      )}

                      {product.status === "inactive" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleAction(product._id, "reactivate")
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Reactivate
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(product._id, "more")}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {items.length === 0 && (
            <Card className="p-8 border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-center">
              <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search criteria or filters.
              </p>
            </Card>
          )}

          {!loadAll && (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </Protected>
  );
}
