import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { ChatbotIcon } from "@/components/ui/chatbot-icon";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leazo - Premium Rental Platform",
  description:
    "Discover and rent premium items with ease. Sustainable, convenient, and affordable.",
  keywords: ["rental", "sharing economy", "sustainability", "premium items"],
  authors: [{ name: "Leazo Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
          <ChatbotIcon />
        </Providers>
      </body>
    </html>
  );
}
