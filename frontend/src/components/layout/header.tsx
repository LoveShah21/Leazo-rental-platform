"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCartStore } from "@/store/cart";
import { NavigationLoader, useNavigationLoader } from "@/components/ui/navigation-loader";
import { Search, ShoppingCart, User, Menu, X, Sun, Moon, LogIn, LogOut, LayoutGrid, Sparkles, Leaf, Clock, Bell, Star } from "lucide-react";
import { NotificationBell } from "@/components/ui/notification-bell";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useSimpleAuth, logout as logoutFn } from "@/lib/auth";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useSimpleAuth();
  const { getItemCount, toggleCart } = useCartStore();
  const { isLoading, navigateWithLoader } = useNavigationLoader();
  const itemCount = getItemCount();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { 
      name: "Browse", 
      href: "/catalog", 
      icon: Search,
      description: "Discover amazing items"
    },
    { 
      name: "How it Works", 
      href: "/how-it-works", 
      icon: Clock,
      description: "Simple rental process"
    },
    { 
      name: "Pricing", 
      href: "/pricing", 
      icon: Star,
      description: "Choose your plan"
    },
    { 
      name: "Sustainability", 
      href: "/sustainability", 
      icon: Leaf,
      description: "Eco-friendly impact"
    },
  ];

  const handleNavigation = (href: string) => {
    setIsMenuOpen(false);
    navigateWithLoader(href);
  };

  const handleLogout = async () => {
    await logoutFn();
    window.location.href = "/";
  };

  return (
    <>
      <NavigationLoader isLoading={isLoading} />
      <motion.header 
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled 
            ? "bg-background/80 backdrop-blur-lg border-b shadow-lg" 
            : "bg-background/95 backdrop-blur-sm border-b"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto flex h-16 lg:h-18 items-center justify-between px-4">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button 
              onClick={() => navigateWithLoader("/")}
              className="flex items-center space-x-3 group"
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Sparkles className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-ping"></div>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Leazo
                </span>
                <div className="text-xs text-muted-foreground font-medium">Rent Sustainably</div>
              </div>
            </button>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleNavigation(item.href)}
                  className="group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                >
                  <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>{item.name}</span>
                </button>
              </motion.div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Search */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="ghost" size="icon" className="hidden sm:flex relative group">
                <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="sr-only">Search</span>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
              </Button>
            </motion.div>

            {/* Theme Toggle */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative group"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 group-hover:scale-110" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 group-hover:scale-110" />
                <span className="sr-only">Toggle theme</span>
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-600/20 to-blue-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
              </Button>
            </motion.div>

            {/* Notification Bell */}
            {user && (
              <NotificationBell className="hidden sm:block" />
            )}

            {/* Cart */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="relative group"
              >
                <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs flex items-center justify-center font-bold shadow-lg"
                  >
                    {itemCount}
                  </motion.span>
                )}
                <span className="sr-only">Shopping cart</span>
                <div className="absolute -inset-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
              </Button>
            </motion.div>

            {/* User Menu */}
            {user ? (
              <div className="hidden lg:flex items-center gap-3">
                <motion.button 
                  onClick={() => handleNavigation("/dashboard")} 
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted/50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LayoutGrid className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>Dashboard</span>
                </motion.button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="group">
                    <LogOut className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Logout
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <motion.button 
                  onClick={() => handleNavigation("/login")} 
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted/50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>Login</span>
                </motion.button>
                <motion.button 
                  onClick={() => handleNavigation("/signup")} 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign up
                </motion.button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden relative group"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="sr-only">Toggle menu</span>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t bg-background/95 backdrop-blur-sm"
            >
              <nav className="container mx-auto px-4 py-6 space-y-4">
                {/* Navigation Links */}
                <div className="space-y-3">
                  {navigation.map((item, index) => (
                    <motion.button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t pt-4">
                  {/* Search Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Button variant="ghost" className="w-full justify-start mb-3 h-12">
                      <Search className="h-5 w-5 mr-3" />
                      <span>Search products</span>
                    </Button>
                  </motion.div>

                  {/* User Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="space-y-3"
                  >
                    {user ? (
                      <>
                        <button 
                          onClick={() => handleNavigation("/dashboard")} 
                          className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <LayoutGrid className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-foreground">Dashboard</div>
                            <div className="text-sm text-muted-foreground">Manage your account</div>
                          </div>
                        </button>
                        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start h-12">
                          <LogOut className="h-5 w-5 mr-3" />
                          <span>Logout</span>
                        </Button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleNavigation("/login")} 
                          className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <LogIn className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-foreground">Login</div>
                            <div className="text-sm text-muted-foreground">Access your account</div>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleNavigation("/signup")} 
                          className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                        >
                          Get Started Free
                        </button>
                      </>
                    )}
                  </motion.div>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <CartDrawer />
    </>
  );
}
