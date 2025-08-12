"use client";
import { useEffect, useMemo, useState } from "react";
import { Protected } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Package, BarChart3, PieChart, Download, Eye, Star, Calendar } from "lucide-react";
import { fetchProviderDashboard, fetchProviderBookings, type ProviderPeriod } from "@/lib/provider";

export default function ProviderReportsPage() {
  const [dateRange, setDateRange] = useState<ProviderPeriod | "last-year" | "custom">("30d");
  const [reportType, setReportType] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [recent, setRecent] = useState<any[]>([]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const p: ProviderPeriod = dateRange === "7d" || dateRange === "30d" || dateRange === "90d" ? dateRange : "30d";
      const dash = (await fetchProviderDashboard(p)).dashboard;
      setTotalRevenue(dash.bookings.totalRevenue || 0);
      setTotalBookings(dash.bookings.totalBookings || 0);
      setActiveProducts(dash.products.active || 0);
      setRecent(dash.recentBookings || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

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

  return (
    <Protected roles={["provider", "staff", "manager"]}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-8">
          <PageHeader title="Reports & Analytics" subtitle="Track your performance, analyze trends, and optimize your rental business" />

          {error && (
            <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">{error}</Card>
          )}

          {/* Filters and Controls */}
          <Card className="p-6 border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
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
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" disabled>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Total Revenue" value={`$${Number(totalRevenue).toLocaleString()}`} Icon={DollarSign} color="blue" loading={loading} />
            <MetricCard title="Total Rentals" value={totalBookings} Icon={Package} color="green" loading={loading} />
            <MetricCard title="Active Products" value={activeProducts} Icon={BarChart3} color="purple" loading={loading} />
            <MetricCard title="Average Rating" value={avgRating} Icon={Star} color="orange" loading={loading} />
          </div>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Bookings</h3>
                <Button variant="outline" size="sm" disabled>
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {loading && <div className="text-sm text-muted-foreground">Loading recent bookings...</div>}
                {!loading && recent.length === 0 && <div className="text-sm text-muted-foreground">No recent bookings</div>}
                {recent.map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-2">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{booking.customer?.firstName} {booking.customer?.lastName}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{booking.product?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{booking.pricing?.totalAmount}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{new Date(booking.startDate).toLocaleDateString()}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
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

function MetricCard({ title, value, Icon, color, loading }: { title: string; value: string | number; Icon: any; color: "blue" | "green" | "purple" | "orange"; loading?: boolean }) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30",
    green: "from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30",
    purple: "from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30",
    orange: "from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30",
  };
  return (
    <Card className={`p-6 border-0 shadow-lg bg-gradient-to-br ${colorMap[color]} hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{loading ? "—" : value}</p>
        </div>
        <Icon className="h-8 w-8 text-gray-700 dark:text-gray-300" />
      </div>
    </Card>
  );
}