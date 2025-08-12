"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import { Shield, User as UserIcon, Building, Crown, Sparkles, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { login, setDemoRole } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await login(email, password);
      // Redirect to dashboard after successful login
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: string) => {
    setDemoRole(role as any);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto max-w-6xl p-6 relative z-10">
        <PageHeader
          title={
            <span className="inline-flex items-center gap-3">
              Welcome back to Leazo
              <div className="flex">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <Sparkles className="h-4 w-4 text-primary/60 animate-pulse delay-75" />
              </div>
            </span>
          }
          subtitle="Sign in to continue your sustainable rental journey"
          className="mb-12"
        />

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Sign In Form */}
          <div>
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              
              <CardHeader className="relative pb-8">
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Sign in to your account
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    Access your dashboard and manage your rentals with ease
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="relative">
                <form className="space-y-6" onSubmit={onSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      Email address
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="your@email.com"
                      className="h-12 border-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4 text-blue-500" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Enter your password"
                        className="h-12 border-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 pr-10"
                        required 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/50 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{" "}
                        <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                          Create one here
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

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
                  onClick={() => handleDemoLogin("customer")}
                >
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Customer</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950"
                  onClick={() => handleDemoLogin("provider")}
                >
                  <Building className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Provider</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950"
                  onClick={() => handleDemoLogin("admin")}
                >
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Admin</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2 hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-950"
                  onClick={() => handleDemoLogin("super_admin")}
                >
                  <Crown className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Super Admin</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
