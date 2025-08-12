"use client";

import { useState } from "react";
import { register as registerFn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import { Sparkles, ArrowRight, Eye, EyeOff, CheckCircle, User, Mail, Lock } from "lucide-react";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      await registerFn({ firstName, lastName, email, password });
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    } finally { setLoading(false); }
  };

  const passwordsMatch = password && confirm && password === confirm;
  const passwordLengthOk = password.length >= 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto max-w-6xl p-6">
        <PageHeader
          title={
            <span className="inline-flex items-center gap-3">
              Join Leazo
              <div className="flex">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <Sparkles className="h-4 w-4 text-primary/60 animate-pulse delay-100" />
                <Sparkles className="h-3 w-3 text-primary/40 animate-pulse delay-200" />
              </div>
            </span>
          }
          subtitle="Create your account and start renting smarter today."
          className="mb-12"
        />

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Sign Up Form */}
          <Card className="relative overflow-hidden border-primary/20 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-background" />
            <CardHeader className="relative">
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>Join thousands of users making smart rental choices.</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <form className="space-y-6" onSubmit={onSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-3 w-3" />
                      First name
                    </Label>
                    <Input 
                      id="firstName" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      placeholder="John"
                      className="h-11"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
                    <Input 
                      id="lastName" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      placeholder="Doe"
                      className="h-11"
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    Email address
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="john@example.com"
                    className="h-11"
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-3 w-3" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Create password"
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
                    {password && (
                      <div className="text-xs space-y-1">
                        <div className={`flex items-center gap-1 ${passwordLengthOk ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <CheckCircle className={`h-3 w-3 ${passwordLengthOk ? 'text-green-600' : 'text-muted-foreground'}`} />
                          At least 6 characters
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm" className="text-sm font-medium">Confirm password</Label>
                    <div className="relative">
                      <Input 
                        id="confirm" 
                        type={showConfirm ? "text" : "password"}
                        value={confirm} 
                        onChange={(e) => setConfirm(e.target.value)} 
                        placeholder="Confirm password"
                        className="h-11 pr-10"
                        required 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {confirm && (
                      <div className="text-xs">
                        <div className={`flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                          <CheckCircle className={`h-3 w-3 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`} />
                          {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base" 
                    disabled={loading || !passwordsMatch || !passwordLengthOk}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link href="/login" className="font-medium text-primary hover:underline">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20" />
            <CardHeader className="relative">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Why choose Leazo?
              </CardTitle>
              <CardDescription>
                Join the smart rental revolution and access quality items when you need them.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-medium">Verified providers</h3>
                    <p className="text-sm text-muted-foreground">All providers are vetted for quality and reliability.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-medium">Secure payments</h3>
                    <p className="text-sm text-muted-foreground">Your transactions are protected with bank-level security.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-medium">24/7 support</h3>
                    <p className="text-sm text-muted-foreground">Get help whenever you need it from our dedicated team.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div>
                    <h3 className="font-medium">Flexible terms</h3>
                    <p className="text-sm text-muted-foreground">Rent for a day, a week, or longer – whatever works for you.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border">
                <p className="text-sm text-center font-medium">
                  🎉 Join over <span className="text-primary">10,000+</span> happy renters today!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
