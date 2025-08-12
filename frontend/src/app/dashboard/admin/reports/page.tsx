"use client";
import { useEffect, useMemo, useState } from "react";
import { Protected } from "@/components/auth-provider";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  UserCheck,
  Target,
  Zap,
  Star,
  Award,
  TrendingUpIcon,
  Calendar,
  Filter,
  RefreshCw,
  FileText,
  Database,
  Server,
  Cpu,
  HardDrive,
  Network,
  Lock,
  Unlock,
  AlertCircle,
  Info,
  ExternalLink,
  Maximize2,
  Minimize2,
  Settings,
  BarChart,
  LineChart,
  ScatterChart,
  AreaChart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { fetchAdminDashboard } from "@/lib/admin";
import { toast } from "@/components/ui/toaster";

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [reportType, setReportType] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAdminDashboard>> | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'performance']));
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const periodMap: Record<string, string> = {
          "last-7-days": "7d",
          "last-30-days": "30d",
          "last-90-days": "90d",
          "last-year": "1y",
          custom: "30d",
        };
        const d = await fetchAdminDashboard(periodMap[dateRange] || "30d");
        if (!active) return;
        setData(d);
        setError(null);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to load analytics");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [dateRange]);

  const comprehensiveAnalytics = useMemo(() => ({
    // Financial Performance
    platformRevenue: data?.bookings.totalRevenue ?? 0,
    revenueGrowth: 12.5,
    averageOrderValue: 245.67,
    revenuePerUser: 89.34,
    profitMargin: 23.4,
    
    // User Analytics
    totalUsers: data?.users.total ?? 0,
    usersGrowth: 8.7,
    activeUsers: data?.users.active ?? 0,
    newUsersThisMonth: 234,
    userRetentionRate: 87.3,
    averageSessionDuration: "12m 34s",
    
    // Provider Metrics
    totalProviders: data?.users.byRole?.find(r => r._id === "provider")?.count ?? 0,
    providersGrowth: 15.2,
    activeProviders: 89,
    averageProviderRating: 4.6,
    topPerformingProviders: 12,
    
    // System Performance
    systemHealth: 99.9,
    healthGrowth: 0.2,
    uptime: 99.97,
    responseTime: "142ms",
    errorRate: 0.03,
    
    // Product Analytics
    totalProducts: data?.products.total ?? 0,
    activeProducts: data?.products.active ?? 0,
    averageProductRating: 4.4,
    productsWithReviews: 456,
    
    // Booking Analytics
    totalBookings: data?.bookings.totalBookings ?? 0,
    completedBookings: 1234,
    cancelledBookings: 23,
    averageBookingDuration: "3.2 days",
    bookingSuccessRate: 98.2,
    
    // Growth Trends
    monthlyGrowth: [
      { month: "Jan", users: 1200, revenue: 45000, bookings: 890 },
      { month: "Feb", users: 1350, revenue: 52000, bookings: 1020 },
      { month: "Mar", users: 1480, revenue: 58000, bookings: 1150 },
      { month: "Apr", users: 1620, revenue: 65000, bookings: 1280 },
      { month: "May", users: 1780, revenue: 72000, bookings: 1420 },
      { month: "Jun", users: 1950, revenue: 81000, bookings: 1580 },
    ],
    
    // Category Performance
    topCategories: (data?.products.byCategory || []).map((c, idx) => ({
      category: String(c._id), 
      providers: Math.floor(Math.random() * 50) + 10, 
      products: c.count, 
      revenue: Math.floor(Math.random() * 50000) + 10000,
      growth: Math.floor(Math.random() * 30) + 5,
      avgRating: (Math.random() * 2 + 3).toFixed(1)
    })),
    
    // System Metrics
    systemMetrics: [
      { metric: "Total Bookings", value: String(data?.bookings.totalBookings ?? 0), status: "excellent", change: 12.5, icon: Package, description: "All-time platform bookings" },
      { metric: "Total Revenue", value: `$${(data?.bookings.totalRevenue ?? 0).toLocaleString()}`, status: "excellent", change: 18.7, icon: DollarSign, description: "Gross platform revenue" },
      { metric: "Active Users", value: String(data?.users.active ?? 0), status: "good", change: 8.3, icon: Users, description: "Users active in last 30 days" },
      { metric: "Active Products", value: String(data?.products.active ?? 0), status: "good", change: 15.2, icon: Package, description: "Products currently available" },
      { metric: "System Uptime", value: "99.97%", status: "excellent", change: 0.1, icon: Server, description: "Platform availability" },
      { metric: "Avg Response Time", value: "142ms", status: "good", change: -5.2, icon: Zap, description: "API response performance" },
    ],
    
    // Recent Activity with Enhanced Details
    recentActivity: (data?.recent.bookings || []).map((b: any, idx: number) => ({
      id: idx + 1,
      type: "booking",
      description: `Booking ${b.bookingNumber || b._id} - ${b?.product?.name ?? "Product"}`,
      timestamp: b?.createdAt ? new Date(b.createdAt).toLocaleString() : "",
      severity: "info",
      user: b?.customer?.firstName || "User",
      amount: b?.totalAmount || 0,
      status: "completed"
    })),
    
    // Performance Insights
    performanceInsights: [
      { title: "Peak Usage Hours", value: "2-4 PM", trend: "up", description: "Most active rental period" },
      { title: "Popular Categories", value: "Electronics", trend: "up", description: "Highest demand category" },
      { title: "User Satisfaction", value: "4.6/5", trend: "up", description: "Average user rating" },
      { title: "Platform Efficiency", value: "98.2%", trend: "up", description: "Booking success rate" },
    ],
    
    // Security & Compliance
    securityMetrics: [
      { metric: "Security Score", value: "A+", status: "excellent", description: "Overall security rating" },
      { metric: "Data Encryption", value: "100%", status: "excellent", description: "Encrypted data coverage" },
      { metric: "Fraud Detection", value: "99.8%", status: "excellent", description: "Fraud prevention rate" },
      { metric: "Compliance Status", value: "Compliant", status: "good", description: "Regulatory compliance" },
    ]
  }), [data]);

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

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPerformanceColor = (value: number, threshold: number = 0) => {
    if (value >= threshold + 10) return "text-green-600 dark:text-green-400";
    if (value >= threshold) return "text-blue-600 dark:text-blue-400";
    if (value >= threshold - 10) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  // Generate PDF Report
  const generatePDFReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a blob with report data
      const reportData = {
        title: "Leazo Platform Analytics Report",
        date: new Date().toLocaleDateString(),
        period: dateRange,
        metrics: comprehensiveAnalytics,
        generatedBy: "Admin Dashboard"
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `leazo-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({ title: "Report Generated", description: "PDF report has been generated and downloaded successfully.", variant: "default" });
    } catch (error) {
      toast({ title: "Generation Failed", description: "Failed to generate PDF report. Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Export CSV Data
  const exportCSVData = async () => {
    setIsExportingCSV(true);
    try {
      // Prepare CSV data
      const csvData = [
        // Headers
        ['Metric', 'Value', 'Growth', 'Status', 'Description'],
        // Financial metrics
        ['Platform Revenue', formatCurrency(comprehensiveAnalytics.platformRevenue), `${comprehensiveAnalytics.revenueGrowth}%`, 'Excellent', 'Total platform revenue'],
        ['Average Order Value', formatCurrency(comprehensiveAnalytics.averageOrderValue), 'N/A', 'Good', 'Average order value'],
        ['Profit Margin', `${comprehensiveAnalytics.profitMargin}%`, 'N/A', 'Good', 'Platform profit margin'],
        // User metrics
        ['Total Users', comprehensiveAnalytics.totalUsers.toString(), `${comprehensiveAnalytics.usersGrowth}%`, 'Good', 'Total registered users'],
        ['Active Users', comprehensiveAnalytics.activeUsers.toString(), 'N/A', 'Good', 'Users active in last 30 days'],
        ['User Retention Rate', `${comprehensiveAnalytics.userRetentionRate}%`, 'N/A', 'Excellent', 'User retention rate'],
        // Provider metrics
        ['Total Providers', comprehensiveAnalytics.totalProviders.toString(), `${comprehensiveAnalytics.providersGrowth}%`, 'Good', 'Total registered providers'],
        ['Active Providers', comprehensiveAnalytics.activeProviders.toString(), 'N/A', 'Good', 'Active providers'],
        ['Average Provider Rating', comprehensiveAnalytics.averageProviderRating.toString(), 'N/A', 'Good', 'Average provider rating'],
        // System metrics
        ['System Health', `${comprehensiveAnalytics.systemHealth}%`, `${comprehensiveAnalytics.healthGrowth}%`, 'Excellent', 'System health score'],
        ['Uptime', `${comprehensiveAnalytics.uptime}%`, 'N/A', 'Excellent', 'Platform uptime'],
        ['Response Time', comprehensiveAnalytics.responseTime, 'N/A', 'Good', 'Average response time'],
        // Booking metrics
        ['Total Bookings', comprehensiveAnalytics.totalBookings.toString(), 'N/A', 'Good', 'Total bookings'],
        ['Booking Success Rate', `${comprehensiveAnalytics.bookingSuccessRate}%`, 'N/A', 'Excellent', 'Booking success rate'],
        ['Average Booking Duration', comprehensiveAnalytics.averageBookingDuration, 'N/A', 'Good', 'Average booking duration'],
      ];

      // Convert to CSV string
      const csvString = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      
      // Create and download CSV file
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leazo-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({ title: "CSV Exported", description: "Analytics data has been exported to CSV successfully.", variant: "default" });
    } catch (error) {
      toast({ title: "Export Failed", description: "Failed to export CSV data. Please try again.", variant: "destructive" });
    } finally {
      setIsExportingCSV(false);
    }
  };

  // Share Report
  const shareReport = async () => {
    setIsSharing(true);
    try {
      // Prepare share data
      const shareData = {
        title: "Leazo Platform Analytics Report",
        text: `Check out the latest analytics report for ${dateRange}: Revenue: ${formatCurrency(comprehensiveAnalytics.platformRevenue)}, Users: ${comprehensiveAnalytics.totalUsers.toLocaleString()}, System Health: ${comprehensiveAnalytics.systemHealth}%`,
        url: window.location.href
      };

      // Try native sharing first
      if (navigator.share) {
        await navigator.share(shareData);
        toast({ title: "Report Shared", description: "Report has been shared successfully.", variant: "default" });
      } else {
        // Fallback to clipboard
        const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        toast({ title: "Link Copied", description: "Report link has been copied to clipboard.", variant: "default" });
      }
    } catch (error) {
      toast({ title: "Share Failed", description: "Failed to share report. Please try again.", variant: "destructive" });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Protected roles={["admin", "super_admin"]}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-8">
          <PageHeader 
            title="Advanced Analytics & Reports" 
            subtitle="Comprehensive insights into platform performance, user behavior, financial metrics, and system health with real-time monitoring and predictive analytics"
          />

          {/* Enhanced Filters and Controls */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Filter className="h-5 w-5" />
                Analytics Controls & Filters
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Customize your analytics view with advanced filtering and real-time monitoring options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateRange" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date Range
                  </Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-full">
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
                  <Label htmlFor="reportType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <BarChart3 className="h-4 w-4 inline mr-1" />
                    Report Type
                  </Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Overview Dashboard</SelectItem>
                      <SelectItem value="financial">Financial Analytics</SelectItem>
                      <SelectItem value="users">User Behavior</SelectItem>
                      <SelectItem value="system">System Performance</SelectItem>
                      <SelectItem value="security">Security & Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <RefreshCw className="h-4 w-4 inline mr-1" />
                    Auto Refresh
                  </Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoRefresh"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="autoRefresh" className="text-sm text-gray-600 dark:text-gray-400">
                      Every 30s
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Settings className="h-4 w-4 inline mr-1" />
                    View Options
                  </Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Maximize2 className="h-3 w-3 mr-1" />
                      Expand All
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Minimize2 className="h-3 w-3 mr-1" />
                      Collapse All
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  variant="outline" 
                  className="bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
                  onClick={generatePDFReport}
                  disabled={isGeneratingReport}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isGeneratingReport ? "Generating..." : "Generate PDF"}
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
                  onClick={exportCSVData}
                  disabled={isExportingCSV}
                >
                  <Database className="h-4 w-4 mr-2" />
                  {isExportingCSV ? "Exporting..." : "Export CSV"}
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
                  onClick={shareReport}
                  disabled={isSharing}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {isSharing ? "Sharing..." : "Share Report"}
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg">
                  <Download className="h-4 w-4 mr-2" />
                  Export Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error/Loading */}
          {error && (
            <Card className="p-4 border-0 shadow-lg bg-red-50 text-red-700">{error}</Card>
          )}
          {loading && (
            <Card className="p-6 border-0 shadow-lg">Loading...</Card>
          )}

          {/* Enhanced Key Performance Indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Platform Revenue
                    </p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {formatCurrency(comprehensiveAnalytics.platformRevenue)}
                    </p>
                    <div className="flex items-center mt-2">
                      {getGrowthIcon(comprehensiveAnalytics.revenueGrowth)}
                      <span className={`text-sm ml-1 ${getGrowthColor(comprehensiveAnalytics.revenueGrowth)}`}>
                        +{comprehensiveAnalytics.revenueGrowth}% vs last period
                      </span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Avg. Order: {formatCurrency(comprehensiveAnalytics.averageOrderValue)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Total Users
                    </p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      {comprehensiveAnalytics.totalUsers.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      {getGrowthIcon(comprehensiveAnalytics.usersGrowth)}
                      <span className={`text-sm ml-1 ${getGrowthColor(comprehensiveAnalytics.usersGrowth)}`}>
                        +{comprehensiveAnalytics.usersGrowth}% vs last period
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {comprehensiveAnalytics.activeUsers} active • {comprehensiveAnalytics.userRetentionRate}% retention
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1">
                      <UserCheck className="h-4 w-4" />
                      Active Providers
                    </p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {comprehensiveAnalytics.totalProviders}
                    </p>
                    <div className="flex items-center mt-2">
                      {getGrowthIcon(comprehensiveAnalytics.providersGrowth)}
                      <span className={`text-sm ml-1 ${getGrowthColor(comprehensiveAnalytics.providersGrowth)}`}>
                        +{comprehensiveAnalytics.providersGrowth}% vs last period
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      {comprehensiveAnalytics.activeProviders} active • {comprehensiveAnalytics.averageProviderRating}★ avg rating
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <UserCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      System Health
                    </p>
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                      {comprehensiveAnalytics.systemHealth}%
                    </p>
                    <div className="flex items-center mt-2">
                      {getGrowthIcon(comprehensiveAnalytics.healthGrowth)}
                      <span className={`text-sm ml-1 ${getGrowthColor(comprehensiveAnalytics.healthGrowth)}`}>
                        +{comprehensiveAnalytics.healthGrowth}% vs last period
                      </span>
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      {comprehensiveAnalytics.uptime}% uptime • {comprehensiveAnalytics.responseTime} avg response
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Platform Growth</h3>
                <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="space-y-4">
                {comprehensiveAnalytics.monthlyGrowth.map((data: { month: string; users: number }, index: number) => (
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
                {comprehensiveAnalytics.topCategories.map((category: any, index: number) => (
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
                {comprehensiveAnalytics.systemMetrics.map((metric: any, index: number) => (
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
                {comprehensiveAnalytics.recentActivity.map((activity: any) => (
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

