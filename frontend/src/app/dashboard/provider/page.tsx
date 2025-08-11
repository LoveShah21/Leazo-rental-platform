"use client";

import { Protected, useAuth } from "@/components/auth-provider";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Calendar, 
  BarChart3, 
  DollarSign, 
  Star, 
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";

export default function ProviderDashboard() {
  const { setDemo } = useAuth();
  const { user } = useAuth();

  // Mock data for provider dashboard stats
  const stats = {
    totalProducts: 12,
    activeBookings: 8,
    totalEarnings: 3420,
    avgRating: 4.7,
    monthlyGrowth: 15.3
  };

  const recentActivity = [
    { type: "booking", message: "New booking for Camera Kit", time: "30 minutes ago", status: "pending" },
    { type: "payment", message: "Payment received: $200", time: "2 hours ago", status: "success" },
    { type: "review", message: "New 5-star review received", time: "1 day ago", status: "success" },
    { type: "product", message: "Power Tools listing approved", time: "2 days ago", status: "completed" }
  ];

  const quickActions = [
    { title: "Add New Product", description: "List a new item for rent", href: "/dashboard/provider/products", action: true },
    { title: "Pending Bookings", description: "3 bookings need approval", href: "/dashboard/provider/bookings", urgent: true },
    { title: "Update Pricing", description: "Optimize your rental rates", href: "/dashboard/provider/products", action: false }
  ];

  return (
    <Protected roles={["provider", "staff", "manager"]}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-8">
          <PageHeader
            title={`Provider Dashboard`}
            subtitle={`Welcome back, ${user?.firstName || user?.email?.split('@')[0] || 'Provider'}! Manage your rental business effectively`}
          />
          
          {/* Demo Mode Notice */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Provider Mode</Badge>
                  <span className="text-sm text-muted-foreground">Switch between dashboard views</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDemo("customer")} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    Switch to Customer
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDemo("admin")} className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
                    Switch to Admin
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDemo("super_admin")} className="hover:bg-pink-50 dark:hover:bg-pink-900/20">
                    Switch to Super Admin
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Products Listed</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalProducts}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Active listings</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Bookings</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.activeBookings}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Currently rented</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Earnings</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">${stats.totalEarnings}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">This month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Average Rating</p>
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.avgRating}</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Customer rating</p>
                  </div>
                  <Star className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-700 dark:text-teal-300">Growth Rate</p>
                    <p className="text-3xl font-bold text-teal-900 dark:text-teal-100">{stats.monthlyGrowth}%</p>
                    <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">vs last month</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardTile 
              href="/dashboard/provider/products" 
              title="Manage Products" 
              description="Add, edit, and manage your rental inventory"
              icon={<Package className="h-6 w-6" />}
              gradient="from-blue-500 to-cyan-500"
            />
            <DashboardTile 
              href="/dashboard/provider/bookings" 
              title="Booking Requests" 
              description="Review and approve rental requests"
              icon={<Calendar className="h-6 w-6" />}
              gradient="from-green-500 to-emerald-500"
              badge="3 pending"
            />
            <DashboardTile 
              href="/dashboard/provider/reports" 
              title="Analytics & Reports" 
              description="Track performance and earnings insights"
              icon={<BarChart3 className="h-6 w-6" />}
              gradient="from-purple-500 to-pink-500"
            />
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Latest updates on your rental business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white">
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
                          activity.status === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" :
                          activity.status === "completed" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300" :
                          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Shortcuts to common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 transition-all duration-200 cursor-pointer">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{action.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{action.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {action.urgent && (
                            <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">Urgent</Badge>
                          )}
                          {action.action && (
                            <Button size="sm" className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </Protected>
  );
}

interface DashboardTileProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
  badge?: string;
}

function DashboardTile({ title, description, href, icon, gradient, badge }: DashboardTileProps) {
  return (
    <Link href={href}>
      <Card className="h-full border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all duration-300 group relative">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
              <div className="h-1 w-16 rounded bg-gradient-to-r from-green-400 to-teal-400 mt-4 group-hover:w-24 transition-all duration-300" />
            </div>
          </div>
          {badge && (
            <Badge className="absolute top-2 right-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
              {badge}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
