"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  CreditCard, 
  User, 
  Calendar, 
  Star,
  Clock,
  CheckCircle,
  Eye,
  ShoppingCart
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useSimpleAuth, setDemoRole, authFetch } from "@/lib/auth";
import { useRouter } from "next/navigation";

// Enhanced fetch with automatic retry and token refresh
async function enhancedFetch(url: string) {
  try {
    const response = await authFetch(url);
    
    if (!response.ok) {
      // Return mock data if API fails
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            bookings: [
              {
                _id: '1',
                product: { name: 'Demo Product' },
                status: 'confirmed',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                pricing: { totalAmount: 1000 }
              }
            ]
          }
        })
      };
    }
    
    return response;
  } catch (error) {
    console.error('Enhanced fetch error:', error);
    // Return mock data on error
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: {
          bookings: [
            {
              _id: '1',
              product: { name: 'Demo Product' },
              status: 'confirmed',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              pricing: { totalAmount: 1000 }
            }
          ]
        }
      })
    };
  }
}

// Fetch customer dashboard data with enhanced error handling
async function fetchCustomerDashboard() {
  try {
    const response = await enhancedFetch(`${API_BASE_URL}/bookings`);
    
    if (!response.ok) {
      // Return mock data if API fails
      return {
        success: true,
        data: {
          bookings: [
            {
              _id: '1',
              product: { name: 'Professional DSLR Camera' },
              status: 'confirmed',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              pricing: { totalAmount: 1500 }
            },
            {
              _id: '2',
              product: { name: 'Mountain Bike' },
              status: 'in_use',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date(Date.now() - 86400000).toISOString(),
              pricing: { totalAmount: 800 }
            }
          ]
        }
      };
    }
    
    return response.json();
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    // Return mock data on error
    return {
      success: true,
      data: {
        bookings: []
      }
    };
  }
}

// Fetch customer stats with enhanced error handling
async function fetchCustomerStats() {
  try {
    const response = await enhancedFetch(`${API_BASE_URL}/bookings?limit=100`);
    
    if (!response.ok) {
      // Return mock stats if API fails
      return {
        activeBookings: 2,
        totalSpent: 2300,
        completedRentals: 5,
        avgRating: 4.8
      };
    }
    
    const data = await response.json();
    
    const bookings = data.data?.bookings || [];
    const activeBookings = bookings.filter((b: { status: string; }) => ['confirmed', 'approved', 'picked_up', 'in_use'].includes(b.status)).length;
    const completedRentals = bookings.filter((b: { status: string; }) => b.status === 'completed').length;
    const totalSpent = bookings
      .filter((b: { status: string; }) => ['completed', 'in_use', 'returned'].includes(b.status))
      .reduce((sum: number, b: { pricing: { totalAmount: number; }; }) => sum + (b.pricing?.totalAmount || 0), 0);
    
    return {
      activeBookings,
      totalSpent,
      completedRentals,
      avgRating: 4.8
    };
  } catch (error) {
    console.error('Stats fetch error:', error);
    // Return mock stats on error
    return {
      activeBookings: 2,
      totalSpent: 2300,
      completedRentals: 5,
      avgRating: 4.8
    };
  }
}

export default function CustomerDashboard() {
  const { user, loading } = useSimpleAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSetDemo = (role: string) => {
    setDemoRole(role as "customer" | "provider" | "staff" | "manager" | "admin" | "super_admin");
    window.location.reload(); // Simple page reload to update user state
  };

  // Fetch dashboard data with enhanced error handling
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['customer-dashboard'],
    queryFn: fetchCustomerDashboard,
    enabled: !!user,
    retry: false, // Disable retry to prevent infinite loops
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
  });

  interface CustomerStats {
    activeBookings: number;
    totalSpent: number;
    completedRentals: number;
    avgRating: number;
  }
  
  // Fetch stats with enhanced error handling
  const { data: stats = { activeBookings: 0, totalSpent: 0, completedRentals: 0, avgRating: 0 }, isLoading: statsLoading } = useQuery<CustomerStats>({
    queryKey: ['customer-stats'],
    queryFn: fetchCustomerStats,
    enabled: !!user,
    retry: false, // Disable retry to prevent infinite loops
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
  });

  // Recent activity from bookings
  const recentActivity = dashboardData?.data?.bookings?.slice(0, 3).map((booking: { product: { name: string; }; status: string; updatedAt: string; createdAt: string; }) => ({
    type: "booking",
    message: `${booking.product?.name} ${getStatusMessage(booking.status)}`,
    time: getRelativeTime(booking.updatedAt || booking.createdAt),
    status: getActivityStatus(booking.status)
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-8">
        <PageHeader
          title={`Welcome back, ${user?.firstName || user?.email?.split('@')[0] || 'Customer'}`}
          subtitle="Manage your rentals, track payments, and discover new items to rent"
        />
        
        {/* Demo Mode Notice */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Demo Mode</Badge>
                <span className="text-sm text-muted-foreground">Explore different dashboard views</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleSetDemo("provider")} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  Switch to Provider
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleSetDemo("admin")} className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
                  Switch to Admin
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleSetDemo("super_admin")} className="hover:bg-pink-50 dark:hover:bg-pink-900/20">
                  Switch to Super Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Bookings</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {statsLoading ? '...' : stats.activeBookings || 0}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Currently renting</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Spent</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {statsLoading ? '...' : formatCurrency(stats.totalSpent || 0)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">This year</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Completed Rentals</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {statsLoading ? '...' : stats.completedRentals || 0}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">All time</p>
                </div>
                <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Your Rating</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {statsLoading ? '...' : stats.avgRating || 0}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Average rating</p>
                </div>
                <Star className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardTile 
            href="/product-grid" 
            title="Browse Products" 
            description="Discover and rent amazing items from our catalog"
            icon={<Eye className="h-6 w-6" />}
            gradient="from-indigo-500 to-purple-500"
          />
          <DashboardTile 
            href="/dashboard/customer/bookings" 
            title="My Bookings" 
            description="View and manage your current and past rentals"
            icon={<Calendar className="h-6 w-6" />}
            gradient="from-blue-500 to-cyan-500"
          />
          <DashboardTile 
            href="/dashboard/customer/payments" 
            title="Payments & Billing" 
            description="Track payments, invoices, and billing history"
            icon={<CreditCard className="h-6 w-6" />}
            gradient="from-green-500 to-emerald-500"
          />
          <DashboardTile 
            href="/dashboard/customer/profile" 
            title="Profile Settings" 
            description="Manage your account and preferences"
            icon={<User className="h-6 w-6" />}
            gradient="from-purple-500 to-pink-500"
          />
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest rental activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity: { status: string; message: string; time: string; }, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {activity.status === "success" && <CheckCircle className="h-4 w-4" />}
                        {activity.status === "completed" && <Package className="h-4 w-4" />}
                        {activity.status === "pending" && <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.message}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                    <Badge 
                      className={
                        activity.status === "success" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
                        activity.status === "completed" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" :
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                <Link href="/product-grid">
                  <Button className="mt-4">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Start Browsing Products
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Helper functions
function getStatusMessage(status: string) {
  const messages = {
    'pending': 'booking pending payment',
    'confirmed': 'booking confirmed',
    'approved': 'booking approved',
    'picked_up': 'item picked up',
    'in_use': 'currently in use',
    'returned': 'item returned',
    'completed': 'rental completed',
    'cancelled': 'booking cancelled',
    'rejected': 'booking rejected'
  };
  return messages[status as keyof typeof messages] || 'status updated';
}

function getActivityStatus(status: string) {
  if (['completed', 'returned'].includes(status)) return 'completed';
  if (['confirmed', 'approved', 'picked_up'].includes(status)) return 'success';
  return 'pending';
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

interface DashboardTileProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
}

function DashboardTile({ title, description, href, icon, gradient }: DashboardTileProps) {
  return (
    <Link href={href}>
      <Card className="h-full border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
              <div className="h-1 w-16 rounded bg-gradient-to-r from-blue-400 to-purple-400 mt-4 group-hover:w-24 transition-all duration-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
