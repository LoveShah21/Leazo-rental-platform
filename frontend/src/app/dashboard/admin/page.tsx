"use client";

import { Protected, useAuth } from "@/components/auth-provider";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  BarChart3, 
  Shield, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Globe,
  UserCheck,
  Flag,
  Settings,
  Eye
} from "lucide-react";

export default function AdminDashboard() {
  const { setDemo } = useAuth();

  // Mock data for admin dashboard stats
  const stats = {
    totalUsers: 2847,
    totalProviders: 156,
    totalProducts: 1247,
    systemHealth: 98.2,
    platformRevenue: 125450,
    pendingReviews: 23
  };

  const criticalAlerts = [
    { type: "security", message: "Unusual login activity detected", severity: "high", time: "5 minutes ago" },
    { type: "system", message: "Server response time increased", severity: "medium", time: "2 hours ago" },
    { type: "content", message: "3 products flagged for review", severity: "medium", time: "4 hours ago" }
  ];

  const recentActivity = [
    { type: "user", message: "New provider account created", time: "15 minutes ago", status: "success" },
    { type: "product", message: "Product listing approved", time: "30 minutes ago", status: "completed" },
    { type: "system", message: "Daily backup completed", time: "1 hour ago", status: "success" },
    { type: "moderation", message: "User account suspended", time: "2 hours ago", status: "warning" }
  ];

  const systemMetrics = [
    { name: "Active Users (24h)", value: "1,247", change: "+8.5%", positive: true },
    { name: "New Registrations", value: "34", change: "+12%", positive: true },
    { name: "Platform Uptime", value: "99.9%", change: "0%", positive: true },
    { name: "Support Tickets", value: "12", change: "-15%", positive: true }
  ];

  return (
    <Protected roles={["admin", "super_admin"]}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-8">
          <PageHeader
            title="System Administration"
            subtitle="Monitor platform health, manage users, and oversee all operations"
          />
          
          {/* Demo Mode Notice */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">Admin Mode</Badge>
                  <span className="text-sm text-muted-foreground">Full system access and controls</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDemo("customer")} className="hover:bg-blue-50">
                    Switch to Customer
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDemo("provider")} className="hover:bg-green-50">
                    Switch to Provider
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          alert.severity === "high" ? "bg-red-100 text-red-600" :
                          alert.severity === "medium" ? "bg-orange-100 text-orange-600" :
                          "bg-yellow-100 text-yellow-600"
                        }`}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                          <p className="text-xs text-gray-600">{alert.time}</p>
                        </div>
                      </div>
                      <Badge className={
                        alert.severity === "high" ? "bg-red-100 text-red-800" :
                        alert.severity === "medium" ? "bg-orange-100 text-orange-800" :
                        "bg-yellow-100 text-yellow-800"
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Users</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 mt-1">Platform wide</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Providers</p>
                    <p className="text-3xl font-bold text-green-900">{stats.totalProviders}</p>
                    <p className="text-xs text-green-600 mt-1">Active</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Products</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.totalProducts.toLocaleString()}</p>
                    <p className="text-xs text-purple-600 mt-1">Total listings</p>
                  </div>
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">System Health</p>
                    <p className="text-3xl font-bold text-orange-900">{stats.systemHealth}%</p>
                    <p className="text-xs text-orange-600 mt-1">Operational</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-700">Revenue</p>
                    <p className="text-3xl font-bold text-teal-900">${(stats.platformRevenue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-teal-600 mt-1">This month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Pending Reviews</p>
                    <p className="text-3xl font-bold text-red-900">{stats.pendingReviews}</p>
                    <p className="text-xs text-red-600 mt-1">Need attention</p>
                  </div>
                  <Flag className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardTile 
              href="/dashboard/admin/users" 
              title="User Management" 
              description="Manage users, roles, and permissions"
              icon={<Users className="h-6 w-6" />}
              gradient="from-blue-500 to-cyan-500"
            />
            <DashboardTile 
              href="/dashboard/admin/products" 
              title="Product Moderation" 
              description="Review and moderate product listings"
              icon={<Package className="h-6 w-6" />}
              gradient="from-purple-500 to-pink-500"
              badge={`${stats.pendingReviews} pending`}
            />
            <DashboardTile 
              href="/dashboard/admin/reports" 
              title="System Analytics" 
              description="Platform insights and performance metrics"
              icon={<BarChart3 className="h-6 w-6" />}
              gradient="from-green-500 to-emerald-500"
            />
          </div>

          {/* System Metrics & Recent Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* System Metrics */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Metrics
                </CardTitle>
                <CardDescription>Real-time platform performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                        <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${
                          metric.positive ? "text-green-600" : "text-red-600"
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest system events and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {activity.status === "success" && <CheckCircle className="h-4 w-4" />}
                          {activity.status === "completed" && <Package className="h-4 w-4" />}
                          {activity.status === "warning" && <AlertTriangle className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-600">{activity.time}</p>
                        </div>
                      </div>
                      <Badge 
                        className={
                          activity.status === "success" ? "bg-green-100 text-green-800" :
                          activity.status === "completed" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
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
      <Card className="h-full border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all duration-300 group relative">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                {title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
              <div className="h-1 w-16 rounded bg-gradient-to-r from-purple-400 to-pink-400 mt-4 group-hover:w-24 transition-all duration-300" />
            </div>
          </div>
          {badge && (
            <Badge className="absolute top-2 right-2 bg-red-100 text-red-800">
              {badge}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
