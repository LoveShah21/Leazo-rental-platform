"use client";

import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function CartDrawer() {
  const {
    items,
    isOpen,
    toggleCart,
    removeItem,
    updateItem,
    getTotalAmount,
    getTotalDeposit,
    clearCart,
  } = useCartStore();

  const total = getTotalAmount();
  const totalDeposit = getTotalDeposit();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={toggleCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Your Cart</h2>
              <Button variant="ghost" size="icon" onClick={toggleCart}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Browse our catalog to find items to rent
                  </p>
                  <Button asChild onClick={toggleCart}>
                    <Link href="/catalog">Browse Items</Link>
                  </Button>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      {/* Product Image Placeholder */}
                      <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0" />

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          Product {item.productId}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDateRange(item.startDate, item.endDate)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.duration} {item.durationUnit}(s)
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="text-sm">
                            <span className="font-medium">
                              {formatCurrency(item.price)}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              + {formatCurrency(item.deposit)} deposit
                            </span>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.productId)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-6 space-y-4">
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Rental Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Security Deposit</span>
                    <span>{formatCurrency(totalDeposit)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg border-t pt-2">
                    <span>Total Due</span>
                    <span>{formatCurrency(total + totalDeposit)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Deposit will be refunded after return
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout" onClick={toggleCart}>
                      Proceed to Checkout
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
