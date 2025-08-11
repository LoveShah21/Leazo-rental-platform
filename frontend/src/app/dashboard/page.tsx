"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";

export default function DashboardIndex() {
  const { user, loading, setDemo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "customer") router.replace("/dashboard/customer");
    else if (user.role === "provider" || user.role === "staff" || user.role === "manager") router.replace("/dashboard/provider");
    else if (user.role === "admin" || user.role === "super_admin") router.replace("/dashboard/admin");
    else router.replace("/");
  }, [user, loading, router]);

  return (
    <div className="container mx-auto p-6">
      <PageHeader title="Dashboard" subtitle="Redirecting you to the right place…" />
      <Card>
        <CardHeader>
          <CardTitle>Try a different role</CardTitle>
          <CardDescription>For demo purposes, switch dashboards instantly.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => { setDemo("customer"); }}>Customer</Button>
          <Button variant="outline" onClick={() => { setDemo("provider"); }}>Provider</Button>
          <Button variant="outline" onClick={() => { setDemo("admin"); }}>Admin</Button>
          <Button variant="outline" onClick={() => { setDemo("super_admin"); }}>Super Admin</Button>
        </CardContent>
      </Card>
    </div>
  );
}
