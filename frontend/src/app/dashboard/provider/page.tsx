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
  Plus,
  Eye
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchProviderDashboard, fetchProviderProfile, type ProviderDashboard } from "@/lib/provider";

export default function ProviderDashboard() {
  const { setDemo } = useAuth();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<ProviderDashboard | null>(null);
  const [avgRating, setAvgRating] = useState<number>(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [dash, profile] = await Promise.all([
          fetchProviderDashboard("30d").then((d) => d.dashboard),
          fetchProviderProfile().catch(() => null),
        ]);
        if (!active) return;
        setDashboard(dash);
        const rating = (profile?.user?.providerProfile?.averageRating as number | undefined) ?? 0;
        setAvgRating(rating);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to load dashboard");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    if (!dashboard) return null;
    const statuses = dashboard.bookings.statusBreakdown || [];
    const activeStatuses = new Set(["confirmed", "approved", "picked_up", "in_use"]);
    const activeBookings = statuses.filter((s) => activeStatuses.has(s)).length;
    return {
      totalProducts: dashboard.products.total || 0,
      activeBookings,
      totalEarnings: dashboard.bookings.totalRevenue || 0,
      avgRating: Number(avgRating?.toFixed?.(1) ?? 0),
      totalViews: dashboard.products.totalViews || 0,
    };
  }, [dashboard, avgRating]);

  const recentActivity = useMemo(() => {
    if (!dashboard) return [] as Array<{ key: string; message: string; time: string; status: "success" | "completed" | "pending" }>;
    return (dashboard.recentBookings || []).map((b) => ({
      key: b._id,
      message: `Booking ${b.bookingNumber} - ${b.product?.name ?? "Product"}`,
      time: new Date(b.startDate).toLocaleDateString(),
      status: ["completed", "returned"].includes(b.status) ? "completed" : (b.status === "confirmed" ? "success" : "pending"),
    }));
  }, [dashboard]);

  const quickActions = [
    { title: "Add New Product", description: "List a new item for rent", href: "/dashboard/provider/products", action: true },
    { title: "Manage Bookings", description: "Review and update bookings", href: "/dashboard/provider/bookings", urgent: false },
    { title: "View Analytics", description: "Track performance insights", href: "/dashboard/provider/reports", action: false }
  ];

  return (
    <Protected roles={["provider", "staff", "manager"]}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-8">
          <PageHeader
            title={`Provider Dashboard`}
            subtitle={`Welcome back, ${user?.firstName || user?.email?.split('@')[0] || 'Provider'}! Manage your rental business effectively`}
          />

          {error && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardContent className="p-4 text-red-700 dark:text-red-300">{error}</CardContent>
            </Card>
          )}

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
            <StatCard title="Products Listed" value={loading ? "—" : stats?.totalProducts ?? 0} hint="Active listings" Icon={Package} color="blue" />
            <StatCard title="Active Bookings" value={loading ? "—" : stats?.activeBookings ?? 0} hint="Currently rented" Icon={Calendar} color="green" />
            <StatCard title="Total Revenue" value={loading ? "—" : `$${Number(stats?.totalEarnings || 0).toLocaleString()}`} hint="Selected period" Icon={DollarSign} color="purple" />
            <StatCard title="Average Rating" value={loading ? "—" : stats?.avgRating ?? 0} hint="Customer rating" Icon={Star} color="orange" />
            <StatCard title="Total Views" value={loading ? "—" : stats?.totalViews ?? 0} hint="Product views" Icon={TrendingUp} color="teal" />
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
              badge={dashboard ? String((dashboard.bookings?.statusBreakdown || []).length) + " total" : undefined}
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
                  {loading && <div className="text-sm text-muted-foreground">Loading recent activity...</div>}
                  {!loading && recentActivity.length === 0 && (
                    <div className="text-sm text-muted-foreground">No recent bookings</div>
                  )}
                  {recentActivity.map((activity) => (
                    <div key={activity.key} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 transition-all duration-200">
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
                          activity.status === "success"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : activity.status === "completed"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
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

function StatCard({ title, value, hint, Icon, color }: { title: string; value: string | number; hint?: string; Icon: any; color: "blue" | "green" | "purple" | "orange" | "teal" }) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300",
    green: "from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 text-green-700 dark:text-green-300",
    purple: "from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-700 dark:text-purple-300",
    orange: "from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-700 dark:text-orange-300",
    teal: "from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 text-teal-700 dark:text-teal-300",
  };
  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-br ${colorMap[color]} hover:shadow-xl transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium`}>{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
          </div>
          <Icon className={`h-8 w-8`} />
        </div>
      </CardContent>
    </Card>
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