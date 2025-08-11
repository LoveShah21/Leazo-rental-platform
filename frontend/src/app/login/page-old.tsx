"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import { Shield, User as UserIcon, Building, Crown, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { login, loading, setDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      // Redirect based on role is handled on dashboard pages
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <PageHeader
        title={<span className="inline-flex items-center gap-2">Welcome back <Sparkles className="h-6 w-6 text-primary" /></span>}
        subtitle="Sign in to access your dashboard and manage your rentals."
        className="mb-10"
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="order-2 md:order-1">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use your email and password to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <div className="pt-2 space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Don’t have an account? <Link href="/signup" className="underline">Sign up</Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="order-1 md:order-2">
          <CardHeader>
            <CardTitle>Quick demo</CardTitle>
            <CardDescription>View each dashboard instantly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => { setDemo("customer"); window.location.href = "/dashboard"; }}>
                <UserIcon className="h-4 w-4 mr-2" /> Customer
              </Button>
              <Button variant="outline" onClick={() => { setDemo("provider"); window.location.href = "/dashboard"; }}>
                <Building className="h-4 w-4 mr-2" /> Provider
              </Button>
              <Button variant="outline" onClick={() => { setDemo("admin"); window.location.href = "/dashboard"; }}>
                <Shield className="h-4 w-4 mr-2" /> Admin
              </Button>
              <Button variant="outline" onClick={() => { setDemo("super_admin"); window.location.href = "/dashboard"; }}>
                <Crown className="h-4 w-4 mr-2" /> Super Admin
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">These use a local demo user without calling the backend.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
