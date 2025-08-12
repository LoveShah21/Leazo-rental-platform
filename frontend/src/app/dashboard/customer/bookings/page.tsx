"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Protected } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { Calendar, Package, MapPin, DollarSign, Clock, Search, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

// Fetch customer bookings
async function fetchCustomerBookings(params: any = {}) {
  const token = localStorage.getItem('token');
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/bookings?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch bookings');
  return response.json();
}

// Cancel booking
async function cancelBooking(bookingId: string, reason: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      status: 'cancelled', 
      reason,
      notes: 'Cancelled by customer'
    })
  });
  if (!response.ok) throw new Error('Failed to cancel booking');
  return response.json();
}

export default function CustomerBookingsPage() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bookings
  const { data, isLoading, isError } = useQuery({
    queryKey: ['customer-bookings', { status: filter !== 'all' ? filter : undefined }],
    queryFn: () => fetchCustomerBookings({ status: filter !== 'all' ? filter : undefined })
  });

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      cancelBooking(bookingId, reason),
    onSuccess: () => {
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const bookings = data?.data?.bookings || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "confirmed": return "default";
      case "approved": return "default";
      case "picked_up": return "default";
      case "in_use": return "default";
      case "returned": return "outline";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  const canCancel = (booking: any) => {
    return ['pending', 'confirmed'].includes(booking.status);
  };

  const handleCancel = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancelMutation.mutate({
        bookingId,
        reason: 'Cancelled by customer'
      });
    }
  };

  const filteredBookings = bookings.filter((booking: any) => {
    if (filter !== "all" && booking.status !== filter) return false;
    if (searchTerm && !booking.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <Protected roles={["customer"]}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <PageHeader title="My Bookings" subtitle="View and manage your rental bookings." />
          
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Your Bookings</CardTitle>
                  <CardDescription>Manage your current and past rentals</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search bookings..." 
                      className="pl-10 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="approved">Approved</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="in_use">In Use</option>
                    <option value="returned">Returned</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking: any) => (
                    <Card key={booking._id} className="border-l-4 border-l-primary/20">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{booking.product?.name}</h3>
                              <Badge variant={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                Quantity: {booking.quantity}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {booking.location?.name || 'Location not specified'}
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-medium">{formatCurrency(booking.pricing?.totalAmount || 0)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Booked: {new Date(booking.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                #{booking.bookingNumber}
                              </div>
                            </div>
                            
                            {booking.notes?.customer && (
                              <div className="bg-muted/50 p-3 rounded-md">
                                <p className="text-sm">{booking.notes.customer}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 lg:min-w-[160px]">
                            {canCancel(booking) && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="w-full text-destructive hover:text-destructive"
                                onClick={() => handleCancel(booking._id)}
                                disabled={cancelMutation.isPending}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel Booking
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="w-full">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {!isLoading && filteredBookings.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                  <p className="text-muted-foreground">
                    {filter === "all" 
                      ? "You haven't made any bookings yet. Start browsing products to make your first rental!"
                      : `No ${filter} bookings found.`
                    }
                  </p>
                  <Button className="mt-4" asChild>
                    <a href="/products">Browse Products</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </Protected>
  );
}
