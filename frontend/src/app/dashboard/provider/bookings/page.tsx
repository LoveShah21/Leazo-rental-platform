"use client";
import { useState } from "react";
import { Protected } from "@/components/auth-provider";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, User, MapPin, DollarSign, Clock, MessageCircle, Check, X, Search, Filter } from "lucide-react";

export default function ProviderBookingsPage() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const mockBookings = [
    {
      id: "BK001",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      productName: "Professional DSLR Camera",
      startDate: "2024-08-15",
      endDate: "2024-08-17",
      status: "pending",
      totalPrice: 135,
      deposit: 200,
      location: "Downtown Studio",
      message: "Need this for a wedding shoot"
    },
    {
      id: "BK002", 
      customerName: "Sarah Wilson",
      customerEmail: "sarah@example.com",
      productName: "Mountain Bike",
      startDate: "2024-08-20",
      endDate: "2024-08-22",
      status: "confirmed",
      totalPrice: 105,
      deposit: 150,
      location: "Central Park Pickup",
      message: "Planning a weekend trail ride"
    },
    {
      id: "BK003",
      customerName: "Mike Johnson",
      customerEmail: "mike@example.com",
      productName: "Professional DSLR Camera",
      startDate: "2024-07-10",
      endDate: "2024-07-13",
      status: "completed",
      totalPrice: 135,
      deposit: 200,
      location: "Photography Studio",
      message: ""
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "confirmed": return "default";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const handleApprove = (bookingId: string) => {
    console.log("Approving booking:", bookingId);
  };

  const handleReject = (bookingId: string) => {
    console.log("Rejecting booking:", bookingId);
  };

  const filteredBookings = mockBookings.filter(booking => {
    if (filter !== "all" && booking.status !== filter) return false;
    if (searchTerm && !booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !booking.productName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <Protected roles={["provider", "staff", "manager"]}>
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader title="Bookings" subtitle="Review, approve, and manage orders." />
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Booking Requests</CardTitle>
                <CardDescription>Manage incoming and existing bookings</CardDescription>
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
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{booking.productName}</h3>
                          <Badge variant={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="font-medium">{booking.customerName}</span>
                              <div className="text-xs text-muted-foreground">{booking.customerEmail}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {booking.startDate} to {booking.endDate}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {booking.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">${booking.totalPrice}</span>
                            <span className="text-xs text-muted-foreground">+ ${booking.deposit} deposit</span>
                          </div>
                          <div className="text-xs text-muted-foreground col-span-2">
                            Booking #{booking.id}
                          </div>
                        </div>
                        
                        {booking.message && (
                          <div className="bg-muted/50 p-3 rounded-md">
                            <p className="text-sm">{booking.message}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 lg:min-w-[160px]">
                        {booking.status === "pending" && (
                          <>
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleApprove(booking.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-destructive hover:text-destructive"
                              onClick={() => handleReject(booking.id)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <>
                            <Button size="sm" className="w-full">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Contact
                            </Button>
                            <Button size="sm" variant="outline" className="w-full">
                              <Calendar className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                          </>
                        )}
                        {booking.status === "completed" && (
                          <Button size="sm" variant="outline" className="w-full">
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground">
                  {filter === "all" 
                    ? "You don't have any bookings yet. Once customers book your products, they'll appear here."
                    : `No ${filter} bookings found.`
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Protected>
  );
}

