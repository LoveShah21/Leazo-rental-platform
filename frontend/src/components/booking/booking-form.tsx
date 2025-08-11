"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/components/auth-provider";
import { API_BASE_URL } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import { CalendarIcon, CreditCard, Package, MapPin, Loader2, CheckCircle } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";

interface BookingFormProps {
  product: any;
}

export function BookingForm({ product }: BookingFormProps) {
  const { user, getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: ''
  });
  const [contactPerson, setContactPerson] = useState({
    name: user?.firstName + ' ' + user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });
  const [notes, setNotes] = useState('');

  // Calculate pricing
  const rentalDays = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;
  const dailyRate = product.pricing?.basePrice?.daily || product.pricing?.daily || 0;
  const baseAmount = dailyRate * quantity * rentalDays;
  const depositAmount = product.pricing?.deposit?.required ? (product.pricing.deposit.amount * quantity) : 0;
  const taxes = baseAmount * 0.18; // 18% GST
  const totalAmount = baseAmount + depositAmount + taxes;

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const token = getToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Failed to create booking');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🎉 Booking Created Successfully!",
        description: `Your booking ${data.data.booking.bookingNumber} has been created. Redirecting to your bookings...`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['customer-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      
      // Reset form
      setStartDate(undefined);
      setEndDate(undefined);
      setQuantity(1);
      setNotes('');
      
      // Redirect to bookings page after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard/customer/bookings';
      }, 2000);
    },
    onError: (error: Error) => {
      console.error('Booking creation error:', error);
      toast({
        title: "❌ Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a booking.",
        variant: "destructive",
      });
      return;
    }

    const token = getToken();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Authentication token not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Dates Required",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    if (startDate >= endDate) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    if (deliveryType === 'delivery' && !deliveryAddress.street) {
      toast({
        title: "Delivery Address Required",
        description: "Please provide a delivery address.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      productId: product._id,
      locationId: product.inventory?.[0]?.locationId,
      quantity,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      paymentMethod,
      delivery: {
        type: deliveryType,
        ...(deliveryType === 'delivery' && { 
          deliveryAddress: {
            street: deliveryAddress.street,
            city: deliveryAddress.city,
            state: deliveryAddress.state,
            country: deliveryAddress.country,
            postalCode: deliveryAddress.postalCode
          }
        }),
        contactPerson: {
          name: contactPerson.name,
          phone: contactPerson.phone,
          email: contactPerson.email
        }
      },
      notes: {
        customer: notes
      }
    };

    createBookingMutation.mutate(bookingData);
  };

  if (!user) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Book This Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <Package className="h-12 w-12 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <p className="font-medium">Please log in to make a booking</p>
              <p className="text-sm text-muted-foreground">You need an account to rent this item</p>
            </div>
            <Button asChild className="w-full">
              <a href="/login">Log In to Book</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Book This Item
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date < (startDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {rentalDays > 0 && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                Rental duration: {rentalDays} day{rentalDays !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={product.inventory?.[0]?.quantity || 1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Maximum available: {product.inventory?.[0]?.quantity || 0}
            </p>
          </div>

          {/* Delivery Type */}
          <div className="space-y-3">
            <Label>Delivery Option</Label>
            <RadioGroup value={deliveryType} onValueChange={setDeliveryType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="cursor-pointer">Pickup from location</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="cursor-pointer">Home delivery (+charges may apply)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Delivery Address */}
          {deliveryType === 'delivery' && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </h4>
              <div className="space-y-3">
                <Input
                  placeholder="Street Address *"
                  value={deliveryAddress.street}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="City *"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="State *"
                    value={deliveryAddress.state}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Postal Code *"
                    value={deliveryAddress.postalCode}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, postalCode: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="Country"
                    value={deliveryAddress.country}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, country: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="razorpay">💳 Razorpay (UPI, Cards, Net Banking)</SelectItem>
                <SelectItem value="stripe">🌐 Stripe (International Cards)</SelectItem>
                <SelectItem value="cash">💵 Cash on Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Special Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Special Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Pricing Summary */}
          {rentalDays > 0 && (
            <div className="space-y-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <h4 className="font-medium">Pricing Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Rate ({rentalDays} day{rentalDays !== 1 ? 's' : ''} × {quantity} item{quantity !== 1 ? 's' : ''})</span>
                  <span>{formatCurrency(baseAmount)}</span>
                </div>
                {depositAmount > 0 && (
                  <div className="flex justify-between text-orange-600 dark:text-orange-400">
                    <span>Security Deposit (refundable)</span>
                    <span>{formatCurrency(depositAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes (18% GST)</span>
                  <span>{formatCurrency(taxes)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2 text-primary">
                  <span>Total Amount</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!startDate || !endDate || createBookingMutation.isPending}
          >
            {createBookingMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Booking...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Book Now - {formatCurrency(totalAmount)}
              </>
            )}
          </Button>

          {product.rentalTerms?.requiresApproval && (
            <p className="text-xs text-muted-foreground text-center">
              ℹ️ This booking requires provider approval before confirmation
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
