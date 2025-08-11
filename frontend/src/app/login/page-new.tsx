"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import { Shield, User as UserIcon, Building, Crown, Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, loading, setDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto max-w-6xl p-6">
        <PageHeader
          title={
            <span className="inline-flex items-center gap-3">
              Welcome back
              <div className="flex">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <Sparkles className="h-4 w-4 text-primary/60 animate-pulse delay-75" />
              </div>
            </span>
          }
          subtitle="Sign in to access your dashboard and manage your rentals."
          className="mb-12"
        />

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Sign In Form */}
          <Card className="relative overflow-hidden border-primary/20 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-background" />
            <CardHeader className="relative">
              <CardTitle className="text-2xl">Sign in to Leazo</CardTitle>
              <CardDescription>Enter your credentials to continue your rental journey.</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <form className="space-y-6" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="your@email.com"
                    className="h-11"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Enter your password"
                      className="h-11 pr-10"
                      required 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link href="/signup" className="font-medium text-primary hover:underline">
                        Create one here
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Demo Access */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-transparent to-primary/5" />
            <CardHeader className="relative">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Quick Demo Access
              </CardTitle>
              <CardDescription>
                Explore all dashboard features instantly with our demo accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950"
                  onClick={() => { setDemo("customer"); window.location.href = "/dashboard"; }}
                >
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Customer</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950"
                  onClick={() => { setDemo("provider"); window.location.href = "/dashboard"; }}
                >
                  <Building className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Provider</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950"
                  onClick={() => { setDemo("admin"); window.location.href = "/dashboard"; }}
                >
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Admin</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2 hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-950"
                  onClick={() => { setDemo("super_admin"); window.location.href = "/dashboard"; }}
                >
                  <Crown className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Super Admin</span>
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-dashed">
                <p className="text-xs text-muted-foreground text-center">
                  ✨ Demo accounts use mock data and don't require backend authentication.
                  Perfect for exploring the interface and features!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
