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
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Download,
  Eye,
  Globe,
  Shield,
  Clock,
  UserCheck
} from "lucide-react";

const mockSystemAnalytics = {
  platformRevenue: 125450,
  revenueGrowth: 15.3,
  totalUsers: 2847,
  usersGrowth: 22.1,
  totalProviders: 156,
  providersGrowth: 18.7,
  systemHealth: 98.2,
  healthGrowth: 2.1,
  monthlyGrowth: [
    { month: "Jan", users: 2100, providers: 120, revenue: 18500 },
    { month: "Feb", users: 2250, providers: 128, revenue: 19200 },
    { month: "Mar", users: 2400, providers: 135, revenue: 20800 },
    { month: "Apr", users: 2580, providers: 142, revenue: 21500 },
    { month: "May", users: 2720, providers: 148, revenue: 23200 },
    { month: "Jun", users: 2847, providers: 156, revenue: 25100 }
  ],
  topCategories: [
    { category: "Electronics", providers: 45, products: 234, revenue: 35400 },
    { category: "Tools & Equipment", providers: 38, products: 189, revenue: 28900 },
    { category: "Vehicles", providers: 22, products: 67, revenue: 24600 },
    { category: "Party & Events", providers: 31, products: 156, revenue: 18200 },
    { category: "Sports & Recreation", providers: 20, products: 123, revenue: 15300 }
  ],
  systemMetrics: [
    { metric: "Server Uptime", value: "99.9%", status: "excellent", change: 0.1 },
    { metric: "Average Response Time", value: "245ms", status: "good", change: -12 },
    { metric: "Error Rate", value: "0.02%", status: "excellent", change: -0.01 },
    { metric: "Daily Active Users", value: "1,247", status: "good", change: 8.5 },
    { metric: "Payment Success Rate", value: "99.7%", status: "excellent", change: 0.3 },
    { metric: "Support Tickets", value: "23", status: "warning", change: 15 }
  ],
  recentActivity: [
    { id: 1, type: "user_registration", description: "New user: Sarah Johnson", timestamp: "2 minutes ago", severity: "info" },
    { id: 2, type: "provider_approval", description: "Provider approved: Tech Rentals LLC", timestamp: "15 minutes ago", severity: "success" },
    { id: 3, type: "payment_issue", description: "Payment failed for booking #1247", timestamp: "1 hour ago", severity: "warning" },
    { id: 4, type: "product_flagged", description: "Product flagged for review: Drone Kit", timestamp: "2 hours ago", severity: "warning" },
    { id: 5, type: "system_maintenance", description: "Scheduled maintenance completed", timestamp: "3 hours ago", severity: "info" }
  ]
};

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [reportType, setReportType] = useState("overview");

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent": return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
      case "good": return <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
      case "critical": return <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />;
      default: return <Activity className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-900/30";
      case "good": return "text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30";
      case "warning": return "text-yellow-600 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30";
      case "critical": return "text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30";
      default: return "text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/30";
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      info: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40",
      success: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/40",
      warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800/40",
      error: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/40"
    };
    return variants[severity as keyof typeof variants] || variants.info;
  };

  return (
    <Protected roles={["admin", "super_admin"]}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-8">
          <PageHeader 
            title="System Analytics" 
            subtitle="Monitor platform performance, user growth, and system health across all operations"
          />

          {/* Filters and Controls */}
          <Card className="p-6 border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-7-days">Last 7 days</SelectItem>
                      <SelectItem value="last-30-days">Last 30 days</SelectItem>
                      <SelectItem value="last-90-days">Last 90 days</SelectItem>
                      <SelectItem value="last-year">Last year</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Overview</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="users">Users & Growth</SelectItem>
                      <SelectItem value="system">System Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Report
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export Analytics
                </Button>
              </div>
            </div>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Platform Revenue</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">${mockSystemAnalytics.platformRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {getGrowthIcon(mockSystemAnalytics.revenueGrowth)}
                    <span className={`text-sm ml-1 ${getGrowthColor(mockSystemAnalytics.revenueGrowth)}`}>
                      {mockSystemAnalytics.revenueGrowth}% vs last period
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{mockSystemAnalytics.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {getGrowthIcon(mockSystemAnalytics.usersGrowth)}
                    <span className={`text-sm ml-1 ${getGrowthColor(mockSystemAnalytics.usersGrowth)}`}>
                      {mockSystemAnalytics.usersGrowth}% vs last period
                    </span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Active Providers</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{mockSystemAnalytics.totalProviders}</p>
                  <div className="flex items-center mt-1">
                    {getGrowthIcon(mockSystemAnalytics.providersGrowth)}
                    <span className={`text-sm ml-1 ${getGrowthColor(mockSystemAnalytics.providersGrowth)}`}>
                      {mockSystemAnalytics.providersGrowth}% vs last period
                    </span>
                  </div>
                </div>
                <UserCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">System Health</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{mockSystemAnalytics.systemHealth}%</p>
                  <div className="flex items-center mt-1">
                    {getGrowthIcon(mockSystemAnalytics.healthGrowth)}
                    <span className={`text-sm ml-1 ${getGrowthColor(mockSystemAnalytics.healthGrowth)}`}>
                      {mockSystemAnalytics.healthGrowth}% vs last period
                    </span>
                  </div>
                </div>
                <Activity className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </Card>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Platform Growth</h3>
                <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="space-y-4">
                {mockSystemAnalytics.monthlyGrowth.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600 dark:text-gray-400">{data.month}</span>
                      <span className="text-gray-900 dark:text-gray-100">{data.users} users</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                        style={{ width: `${(data.users / 3000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Categories</h3>
                <PieChart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="space-y-4">
                {mockSystemAnalytics.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{category.category}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{category.providers} providers • {category.products} products</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">${category.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* System Health Metrics */}
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Health Metrics</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockSystemAnalytics.systemMetrics.map((metric, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(metric.status)}
                        <span className="text-sm font-medium dark:text-gray-200">{metric.metric}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold dark:text-gray-100">{metric.value}</p>
                        <div className="flex items-center justify-end">
                          {getGrowthIcon(metric.change)}
                          <span className={`text-xs ml-1 ${getGrowthColor(metric.change)}`}>
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent System Activity */}
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent System Activity</h3>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Logs
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockSystemAnalytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-2">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getSeverityBadge(activity.severity)}>
                      {activity.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </Protected>
  );
}

