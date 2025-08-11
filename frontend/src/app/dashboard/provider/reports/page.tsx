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
  Package, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Eye,
  Star,
  Clock
} from "lucide-react";

const mockAnalytics = {
  totalRevenue: 45250,
  revenueGrowth: 12.5,
  totalRentals: 238,
  rentalsGrowth: 8.3,
  activeProducts: 45,
  productsGrowth: -2.1,
  avgRating: 4.7,
  ratingGrowth: 3.2,
  monthlyData: [
    { month: "Jan", revenue: 3200, rentals: 18 },
    { month: "Feb", revenue: 3800, rentals: 22 },
    { month: "Mar", revenue: 4100, rentals: 25 },
    { month: "Apr", revenue: 3900, rentals: 21 },
    { month: "May", revenue: 4500, rentals: 28 },
    { month: "Jun", revenue: 5200, rentals: 32 }
  ],
  topProducts: [
    { id: 1, name: "Professional Camera Kit", rentals: 45, revenue: 6750, rating: 4.9 },
    { id: 2, name: "Drone with 4K Camera", rentals: 38, revenue: 5700, rating: 4.8 },
    { id: 3, name: "Sound Equipment Bundle", rentals: 32, revenue: 4800, rating: 4.7 },
    { id: 4, name: "Lighting Kit Pro", rentals: 28, revenue: 4200, rating: 4.6 },
    { id: 5, name: "Video Editing Workstation", rentals: 24, revenue: 3600, rating: 4.8 }
  ],
  recentBookings: [
    { id: 1, customer: "John Doe", product: "Professional Camera Kit", amount: 150, date: "2024-01-15", status: "completed" },
    { id: 2, customer: "Sarah Smith", product: "Drone with 4K Camera", amount: 200, date: "2024-01-14", status: "active" },
    { id: 3, customer: "Mike Johnson", product: "Sound Equipment Bundle", amount: 120, date: "2024-01-13", status: "pending" },
    { id: 4, customer: "Emily Brown", product: "Lighting Kit Pro", amount: 100, date: "2024-01-12", status: "completed" }
  ]
};

export default function ProviderReportsPage() {
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
    return growth >= 0 ? "text-green-500" : "text-red-500";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800",
      active: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800",
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800"
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  return (
    <Protected roles={["provider", "staff", "manager"]}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-8">
          <PageHeader 
            title="Reports & Analytics" 
            subtitle="Track your performance, analyze trends, and optimize your rental business"
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
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="products">Products</SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">${mockAnalytics.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {getGrowthIcon(mockAnalytics.revenueGrowth)}
                    <span className={`text-sm ml-1 ${getGrowthColor(mockAnalytics.revenueGrowth)}`}>
                      {mockAnalytics.revenueGrowth}% vs last period
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Rentals</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{mockAnalytics.totalRentals}</p>
                  <div className="flex items-center mt-1">
                    {getGrowthIcon(mockAnalytics.rentalsGrowth)}
                    <span className={`text-sm ml-1 ${getGrowthColor(mockAnalytics.rentalsGrowth)}`}>
                      {mockAnalytics.rentalsGrowth}% vs last period
                    </span>
                  </div>
                </div>
                <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Active Products</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{mockAnalytics.activeProducts}</p>
                  <div className="flex items-center mt-1">
                    {getGrowthIcon(mockAnalytics.productsGrowth)}
                    <span className={`text-sm ml-1 ${getGrowthColor(mockAnalytics.productsGrowth)}`}>
                      {mockAnalytics.productsGrowth}% vs last period
                    </span>
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Average Rating</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{mockAnalytics.avgRating}/5.0</p>
                  <div className="flex items-center mt-1">
                    {getGrowthIcon(mockAnalytics.ratingGrowth)}
                    <span className={`text-sm ml-1 ${getGrowthColor(mockAnalytics.ratingGrowth)}`}>
                      {mockAnalytics.ratingGrowth}% vs last period
                    </span>
                  </div>
                </div>
                <Star className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Revenue Trend</h3>
                <PieChart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="space-y-4">
                {mockAnalytics.monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{data.month}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                          style={{ width: `${(data.revenue / 6000) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">${data.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Performing Products</h3>
                <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="space-y-4">
                {mockAnalytics.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{product.rentals} rentals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">${product.revenue}</p>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Bookings</h3>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAnalytics.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-2">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{booking.customer}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{booking.product}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">${booking.amount}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{booking.date}</p>
                      </div>
                      <Badge className={getStatusBadge(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
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
