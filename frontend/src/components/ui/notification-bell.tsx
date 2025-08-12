"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  DollarSign,
  Package,
  Users,
  Shield,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useSimpleAuth } from "@/lib/auth";
import { useSocket } from "@/lib/socket";

interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  category:
    | "late_fee"
    | "low_stock"
    | "payment"
    | "booking"
    | "system"
    | "security"
    | "user";
  priority: "low" | "medium" | "high" | "critical";
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    bookingId?: string;
    productId?: string;
    userId?: string;
    amount?: number;
    daysOverdue?: number;
    stockLevel?: number;
  };
}

interface NotificationSystemProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useSimpleAuth();
  const { socket, isConnected } = useSocket();

  // Mock notifications for demonstration - replace with real API calls
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "error",
      title: "Late Fee Alert",
      message:
        "Booking #BK-2024-001 is 3 days overdue. Late fee of $25.00 applied.",
      category: "late_fee",
      priority: "high",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionUrl: "/dashboard/admin/bookings",
      actionText: "View Booking",
      metadata: {
        bookingId: "BK-2024-001",
        amount: 25.0,
        daysOverdue: 3,
      },
    },
    {
      id: "2",
      type: "warning",
      title: "Low Stock Alert",
      message:
        'Product "Canon EOS R5 Camera" has only 2 items remaining in stock.',
      category: "low_stock",
      priority: "medium",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionUrl: "/dashboard/admin/products",
      actionText: "Manage Stock",
      metadata: {
        productId: "PROD-001",
        stockLevel: 2,
      },
    },
    {
      id: "3",
      type: "info",
      title: "Payment Pending",
      message: "Payment of $150.00 is pending for booking #BK-2024-002.",
      category: "payment",
      priority: "medium",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
      actionUrl: "/dashboard/admin/payments",
      actionText: "Review Payment",
      metadata: {
        bookingId: "BK-2024-002",
        amount: 150.0,
      },
    },
    {
      id: "4",
      type: "success",
      title: "New User Registration",
      message: 'New provider "John Doe" has completed registration.',
      category: "user",
      priority: "low",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionUrl: "/dashboard/admin/users",
      actionText: "View Profile",
      metadata: {
        userId: "USER-001",
      },
    },
    {
      id: "5",
      type: "warning",
      title: "System Maintenance",
      message:
        "Scheduled maintenance in 2 hours. Expected downtime: 30 minutes.",
      category: "system",
      priority: "medium",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionUrl: "/dashboard/admin/system",
      actionText: "View Details",
    },
  ];

  useEffect(() => {
    // Load notifications from API
    loadNotifications();
  }, []);

  useEffect(() => {
    if (socket && isConnected) {
      // Listen for real-time notifications
      socket.on("notification:new", (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      socket.on("notification:update", (updatedNotification: Notification) => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === updatedNotification.id ? updatedNotification : n
          )
        );
      });

      return () => {
        socket.off("notification:new");
        socket.off("notification:update");
      };
    }
  }, [socket, isConnected]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch('/api/notifications');
      // const data = await response.json();
      // setNotifications(data.notifications);

      // Using mock data for now
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Replace with actual API call
      // await fetch(/api/notifications/${notificationId}/read, { method: 'PUT' });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Replace with actual API call
      // await fetch('/api/notifications/read-all', { method: 'PUT' });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // Replace with actual API call
      // await fetch(/api/notifications/${notificationId}, { method: 'DELETE' });

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case "late_fee":
        return <DollarSign className="h-4 w-4" />;
      case "low_stock":
        return <Package className="h-4 w-4" />;
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      case "booking":
        return <Clock className="h-4 w-4" />;
      case "system":
        return <Shield className="h-4 w-4" />;
      case "user":
        return <Users className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === "critical")
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
    if (priority === "high")
      return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30";
    if (priority === "medium")
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30";
    return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30";
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      medium:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    };
    return variants[priority as keyof typeof variants] || variants.low;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
      >
        <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs flex items-center justify-center font-bold shadow-lg"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-hidden rounded-lg border bg-background shadow-lg z-50"
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Notifications
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                          !notification.read
                            ? "bg-blue-50/50 dark:bg-blue-900/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-full ${getNotificationColor(
                              notification.type,
                              notification.priority
                            )}`}
                          >
                            {getNotificationIcon(notification.category)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-medium text-foreground line-clamp-1">
                                    {notification.title}
                                  </h4>
                                  <Badge
                                    className={`text-xs ${getPriorityBadge(
                                      notification.priority
                                    )}`}
                                  >
                                    {notification.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(
                                      notification.timestamp
                                    ).toLocaleString()}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {notification.actionUrl && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => {
                                          window.open(
                                            notification.actionUrl,
                                            "_blank"
                                          );
                                          markAsRead(notification.id);
                                        }}
                                      >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        {notification.actionText}
                                      </Button>
                                    )}
                                    {!notification.read && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() =>
                                          markAsRead(notification.id)
                                        }
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Mark read
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                                      onClick={() =>
                                        deleteNotification(notification.id)
                                      }
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
