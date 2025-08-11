"use client";
import { Protected, useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CustomerProfilePage() {
  const { user, logout } = useAuth();
  return (
    <Protected roles={["customer"]}>
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader title="Profile" subtitle="Manage your account details." />
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Role:</span> {user?.role}</p>
          </CardContent>
        </Card>

        <div>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
      </div>
    </Protected>
  );
}
