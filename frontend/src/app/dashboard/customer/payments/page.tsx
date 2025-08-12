"use client";
import { Protected } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CreditCard, DollarSign, Calendar, Receipt, CheckCircle, Clock } from "lucide-react";

export default function CustomerPaymentsPage() {
  const mockPayments = [
    {
      id: "PAY001",
      bookingId: "BK001",
      productName: "Professional DSLR Camera",
      amount: 135,
      type: "rental",
      status: "completed",
      date: "2024-08-15",
      method: "Credit Card (****4532)",
      invoiceUrl: "#"
    },
    {
      id: "PAY002",
      bookingId: "BK001", 
      productName: "Professional DSLR Camera",
      amount: 200,
      type: "deposit",
      status: "refunded",
      date: "2024-08-17",
      method: "Credit Card (****4532)",
      invoiceUrl: "#"
    },
    {
      id: "PAY003",
      bookingId: "BK002",
      productName: "Mountain Bike",
      amount: 105,
      type: "rental",
      status: "pending",
      date: "2024-08-20",
      method: "Credit Card (****4532)",
      invoiceUrl: "#"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "pending": return "secondary";
      case "refunded": return "outline";
      case "failed": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-3 w-3" />;
      case "pending": return <Clock className="h-3 w-3" />;
      case "refunded": return <DollarSign className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    return type === "deposit" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : 
           "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  };

  return (
    <Protected roles={["customer"]}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
        <PageHeader title="Payments" subtitle="Your payment history and invoices." />
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-lg font-semibold">$440</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Receipt className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-lg font-semibold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-lg font-semibold">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-lg font-semibold">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>All your transactions and invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{payment.productName}</h4>
                        <Badge className={getTypeColor(payment.type)}>
                          {payment.type}
                        </Badge>
                        <Badge variant={getStatusColor(payment.status)} className="flex items-center gap-1">
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {payment.date}
                        </span>
                        <span>{payment.method}</span>
                        <span>#{payment.id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-lg">${payment.amount}</div>
                    <Button size="sm" variant="outline" className="mt-2">
                      <Download className="h-3 w-3 mr-1" />
                      Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {mockPayments.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
              <p className="text-muted-foreground mb-4">Your payment history will appear here once you make bookings.</p>
            </CardContent>
          </Card>
        )}
      </div>
      </DashboardLayout>
    </Protected>
  );
}

