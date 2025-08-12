"use client";

import { useState } from "react";
import { register as registerFn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import { Sparkles, ArrowRight, Eye, EyeOff, CheckCircle, User, Mail, Lock, Shield, Zap, Star, Heart, Globe } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-400/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto max-w-6xl p-6 relative z-10">
        <PageHeader
          title={
            <motion.span 
              className="inline-flex items-center gap-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Join the Leazo Community
              <div className="flex">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <Sparkles className="h-4 w-4 text-primary/60 animate-pulse delay-100" />
                <Sparkles className="h-3 w-3 text-primary/40 animate-pulse delay-200" />
              </div>
            </motion.span>
          }
          subtitle="Create your account and start your sustainable rental journey today"
          className="mb-12"
        />

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Sign Up Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
              
              <CardHeader className="relative pb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Create your account
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    Join thousands of users making smart rental choices
                  </CardDescription>
                </motion.div>
              </CardHeader>
              
              <CardContent className="relative">
                <form className="space-y-6" onSubmit={onSubmit}>
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-500" />
                        First name
                      </Label>
                      <Input 
                        id="firstName" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        placeholder="John"
                        className="h-12 border-2 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-semibold">Last name</Label>
                      <Input 
                        id="lastName" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        placeholder="Doe"
                        className="h-12 border-2 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                        required 
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-500" />
                      Email address
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="john@example.com"
                      className="h-12 border-2 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                      required 
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                        <Lock className="h-4 w-4 text-emerald-500" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"}
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          placeholder="Create password"
                          className="h-12 border-2 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 pr-10"
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
                      {password && (
                        <div className="text-xs space-y-1">
                          <div className={`flex items-center gap-1 ${passwordLengthOk ? 'text-emerald-600' : 'text-gray-500'}`}>
                            <CheckCircle className={`h-3 w-3 ${passwordLengthOk ? 'text-emerald-600' : 'text-gray-500'}`} />
                            At least 6 characters
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm" className="text-sm font-semibold">Confirm password</Label>
                      <div className="relative">
                        <Input 
                          id="confirm" 
                          type={showConfirm ? "text" : "password"}
                          value={confirm} 
                          onChange={(e) => setConfirm(e.target.value)} 
                          placeholder="Confirm password"
                          className="h-12 border-2 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 pr-10"
                          required 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                          onClick={() => setShowConfirm(!showConfirm)}
                        >
                          {showConfirm ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      {confirm && (
                        <div className="text-xs">
                          <div className={`flex items-center gap-1 ${passwordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                            <CheckCircle className={`h-3 w-3 ${passwordsMatch ? 'text-emerald-600' : 'text-red-500'}`} />
                            {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {error && (
                    <motion.div 
                      className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/50 dark:border-red-800"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                  )}
                  
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300" 
                      disabled={loading || !passwordsMatch || !passwordLengthOk}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                          Sign in here
                        </Link>
                      </p>
                    </div>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Creative Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8"
          >
            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                  <Heart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Welcome to Leazo!</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Join our growing community</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Start your journey towards sustainable living. Rent what you need, when you need it, and make a positive impact on the environment.
              </p>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                What you'll get
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Access to premium rental items</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Secure payment processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">24/7 customer support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Flexible rental terms</span>
                </div>
              </div>
            </motion.div>

            {/* Community Stats */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                    <Star className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">4.9★</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">User Rating</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
                    <Globe className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">25+</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cities</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Security Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-xl rounded-xl p-6 border border-emerald-200/50 dark:border-emerald-800/50"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                  <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">100% Secure</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your data is protected with bank-level encryption</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
