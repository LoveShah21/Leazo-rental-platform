import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateItem: (productId: string, updates: Partial<CartItem>) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalAmount: () => number
  getTotalDeposit: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId
          )
          
          if (existingIndex >= 0) {
            // Update existing item
            const newItems = [...state.items]
            newItems[existingIndex] = item
            return { items: newItems }
          } else {
            // Add new item
            return { items: [...state.items, item] }
          }
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      updateItem: (productId, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, ...updates } : item
          ),
        })),

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalAmount: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price, 0)
      },

      getTotalDeposit: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.deposit, 0)
      },

      getItemCount: () => {
        const { items } = get()
        return items.length
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)