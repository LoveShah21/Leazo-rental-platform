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
  CreditCard, 
  User, 
  Calendar, 
  Star, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { setDemo } = useAuth();

  // Mock data for dashboard stats
  const stats = {
    activeBookings: 3,
    totalSpent: 1250,
    completedRentals: 12,
    avgRating: 4.8
  };

  const recentActivity = [
    { type: "booking", message: "Camera Kit rental confirmed", time: "2 hours ago", status: "success" },
    { type: "payment", message: "Payment of $150 processed", time: "1 day ago", status: "success" },
    { type: "return", message: "Power Tools returned successfully", time: "3 days ago", status: "completed" }
  ];

  return (
    <Protected roles={["customer"]}>
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
                  <Button size="sm" variant="outline" onClick={() => setDemo("provider")} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    Switch to Provider
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Bookings</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.activeBookings}</p>
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
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">${stats.totalSpent}</p>
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
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.completedRentals}</p>
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
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.avgRating}</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Average rating</p>
                  </div>
                  <Star className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
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
            </CardContent>
          </Card>
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
