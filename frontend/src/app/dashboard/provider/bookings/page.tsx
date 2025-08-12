"use client";
import { useEffect, useMemo, useState } from "react";
import { Protected } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, User, MapPin, DollarSign, Clock, MessageCircle, Check, X, Search } from "lucide-react";
import { fetchProviderBookings, updateProviderBookingStatus } from "@/lib/provider";

export default function ProviderBookingsPage() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, any> = { page: 1, limit: 20 };
      if (filter !== "all") params.status = filter;
      const res = await fetchProviderBookings(params);
      let list = res.bookings;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        list = list.filter((b: any) =>
          `${b.customer?.firstName ?? ""} ${b.customer?.lastName ?? ""}`.toLowerCase().includes(q) ||
          `${b.product?.name ?? ""}`.toLowerCase().includes(q)
        );
      }
      setBookings(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "confirmed": return "default";
      case "approved": return "secondary";
      case "rejected": return "destructive";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const handleApprove = async (bookingId: string) => {
    try {
      setLoading(true);
      await updateProviderBookingStatus(bookingId, { status: "approved" });
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to approve booking");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      setLoading(true);
      await updateProviderBookingStatus(bookingId, { status: "rejected" });
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to reject booking");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => bookings, [bookings]);

  return (
    <Protected roles={["provider", "staff", "manager"]}>
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader title="Bookings" subtitle="Review, approve, and manage orders." />

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4 text-red-700 dark:text-red-300">{error}</CardContent>
          </Card>
        )}

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
                    onKeyDown={(e) => { if (e.key === "Enter") load(); }}
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
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button variant="outline" onClick={() => load()} disabled={loading}>Refresh</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading && <div className="text-sm text-muted-foreground">Loading bookings...</div>}
              {filteredBookings.map((booking) => (
                <Card key={booking._id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{booking.product?.name ?? "Product"}</h3>
                          <Badge variant={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="font-medium">{`${booking.customer?.firstName ?? ""} ${booking.customer?.lastName ?? ""}`.trim() || booking.customer?.email}</span>
                              <div className="text-xs text-muted-foreground">{booking.customer?.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {booking.location?.name ?? ""}
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{booking.pricing?.totalAmount}</span>
                            <span className="text-xs text-muted-foreground">{booking.pricing?.currency}</span>
                          </div>
                          <div className="text-xs text-muted-foreground col-span-2">
                            Booking #{booking.bookingNumber}
                          </div>
                        </div>

                        {booking.notes?.customer && (
                          <div className="bg-muted/50 p-3 rounded-md">
                            <p className="text-sm">{booking.notes.customer}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 lg:min-w-[200px]">
                        {booking.status === "confirmed" && (
                          <>
                            <Button size="sm" className="w-full" onClick={() => handleApprove(booking._id)} disabled={loading}>
                              <Check className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-destructive hover:text-destructive"
                              onClick={() => handleReject(booking._id)}
                              disabled={loading}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {booking.status !== "confirmed" && (
                          <Button size="sm" variant="outline" className="w-full" disabled>
                            <Calendar className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredBookings.length === 0 && !loading && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground">
                  {filter === "all"
                    ? "You don't have any bookings yet. Once customers book your products, they'll appear here."
                    : `No ${filter} bookings found.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Protected>
  );
}