"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface NavigationLoaderProps {
  isLoading: boolean;
}

export function NavigationLoader({ isLoading }: NavigationLoaderProps) {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background/95 backdrop-blur-sm border rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 text-primary" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <p className="text-sm font-medium text-foreground">Loading...</p>
              <p className="text-xs text-muted-foreground">Please wait while we navigate</p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Hook for navigation loading state
export function useNavigationLoader() {
  const [isLoading, setIsLoading] = useState(false);

  const navigateWithLoader = (href: string) => {
    // Only show loader for different pages, not same page
    if (window.location.pathname === href) return;
    
    setIsLoading(true);
    
    // Faster navigation with reduced delay
    setTimeout(() => {
      window.location.href = href;
    }, 200); // Reduced from 500ms to 200ms
  };

  // Reset loading state if needed
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  return { isLoading, navigateWithLoader };
}
