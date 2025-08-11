"use client";
import { useState } from "react";
import { Protected } from "@/components/auth-provider";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Flag,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Edit
} from "lucide-react";

const mockProducts = [
  {
    id: 1,
    name: "Professional Camera Kit",
    provider: "Tech Rentals LLC",
    category: "Electronics",
    price: 150,
    status: "active",
    flagged: false,
    rating: 4.9,
    reviews: 23,
    location: "San Francisco, CA",
    dateAdded: "2024-01-10",
    lastRented: "2024-01-14",
    image: "/placeholder.jpg",
    description: "Complete professional photography kit with DSLR camera, multiple lenses, and accessories."
  },
  {
    id: 2,
    name: "Gaming Setup Complete",
    provider: "GameHub Rentals",
    category: "Electronics",
    price: 200,
    status: "pending",
    flagged: true,
    rating: 4.2,
    reviews: 8,
    location: "Los Angeles, CA",
    dateAdded: "2024-01-12",
    lastRented: "2024-01-13",
    image: "/placeholder.jpg",
    description: "High-end gaming PC with VR headset and premium peripherals for the ultimate gaming experience."
  },
  {
    id: 3,
    name: "Power Tools Collection",
    provider: "ToolMaster Pro",
    category: "Tools & Equipment",
    price: 75,
    status: "active",
    flagged: false,
    rating: 4.7,
    reviews: 15,
    location: "Chicago, IL",
    dateAdded: "2024-01-08",
    lastRented: "2024-01-15",
    image: "/placeholder.jpg",
    description: "Professional grade power tools including drill, saw, grinder, and comprehensive accessories."
  },
  {
    id: 4,
    name: "Party Sound System",
    provider: "Event Essentials",
    category: "Party & Events",
    price: 120,
    status: "suspended",
    flagged: true,
    rating: 3.8,
    reviews: 12,
    location: "Miami, FL",
    dateAdded: "2024-01-05",
    lastRented: "2024-01-11",
    image: "/placeholder.jpg",
    description: "Professional sound system with speakers, microphones, and mixing equipment for events."
  },
  {
    id: 5,
    name: "Mountain Bike Pro",
    provider: "Adventure Gear Co",
    category: "Sports & Recreation",
    price: 45,
    status: "active",
    flagged: false,
    rating: 4.6,
    reviews: 19,
    location: "Denver, CO",
    dateAdded: "2024-01-09",
    lastRented: "2024-01-16",
    image: "/placeholder.jpg",
    description: "High-performance mountain bike suitable for trails and off-road adventures."
  },
  {
    id: 6,
    name: "Drone with 4K Camera",
    provider: "SkyView Rentals",
    category: "Electronics",
    price: 180,
    status: "under_review",
    flagged: true,
    rating: 4.4,
    reviews: 7,
    location: "Seattle, WA",
    dateAdded: "2024-01-11",
    lastRented: "2024-01-14",
    image: "/placeholder.jpg",
    description: "Professional drone with 4K camera capabilities and extended flight time."
  }
];

const stats = {
  totalProducts: 1247,
  activeProducts: 1089,
  pendingProducts: 45,
  flaggedProducts: 28,
  suspendedProducts: 85
};

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [flaggedFilter, setFlaggedFilter] = useState("all");

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/40",
      pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800/40",
      suspended: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/40",
      under_review: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/40"
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
      case "suspended": return <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />;
      case "under_review": return <AlertTriangle className="h-4 w-4 text-orange-500 dark:text-orange-400" />;
      default: return <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesFlagged = flaggedFilter === "all" || 
                          (flaggedFilter === "flagged" && product.flagged) ||
                          (flaggedFilter === "not_flagged" && !product.flagged);
    
    return matchesSearch && matchesStatus && matchesCategory && matchesFlagged;
  });

  const handleAction = (productId: number, action: string) => {
    console.log(`${action} product ${productId}`);
    // In a real app, this would trigger the appropriate backend action
  };

  return (
    <Protected roles={["admin", "super_admin"]}>
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
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Products</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalProducts}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Active</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeProducts}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pendingProducts}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <Flag className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Flagged</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.flaggedProducts}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Suspended</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.suspendedProducts}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="dark:text-gray-200">Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by name or provider..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="dark:text-gray-200">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="dark:text-gray-200">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Tools & Equipment">Tools & Equipment</SelectItem>
                    <SelectItem value="Party & Events">Party & Events</SelectItem>
                    <SelectItem value="Sports & Recreation">Sports & Recreation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flagged" className="dark:text-gray-200">Flagged Status</Label>
                <Select value={flaggedFilter} onValueChange={setFlaggedFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="flagged">Flagged Only</SelectItem>
                    <SelectItem value="not_flagged">Not Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex items-end">
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
            </div>
          </Card>

          {/* Products Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{product.name}</h3>
                          {product.flagged && (
                            <Flag className="h-4 w-4 text-red-500 dark:text-red-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{product.provider}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusBadge(product.status)}>
                        {getStatusIcon(product.status)}
                        <span className="ml-1">{product.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{product.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500 dark:text-green-400" />
                        <span className="text-sm font-medium dark:text-gray-200">${product.price}/day</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{product.location}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                        <span className="text-sm font-medium dark:text-gray-200">{product.rating}/5.0 ({product.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Added {product.dateAdded}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(product.id, "view")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(product.id, "message")}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message Provider
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {product.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction(product.id, "approve")}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(product.id, "reject")}
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
                            onClick={() => handleAction(product.id, "suspend")}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                          {product.flagged && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(product.id, "unflag")}
                            >
                              <Flag className="h-4 w-4 mr-1" />
                              Unflag
                            </Button>
                          )}
                        </>
                      )}

                      {product.status === "suspended" && (
                        <Button
                          size="sm"
                          onClick={() => handleAction(product.id, "reactivate")}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Reactivate
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(product.id, "more")}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card className="p-8 border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-center">
              <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No products found</h3>
              <p className="text-gray-600 dark:text-gray-300">Try adjusting your search criteria or filters.</p>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </Protected>
  );
}

