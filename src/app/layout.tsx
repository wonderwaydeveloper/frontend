import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Microblogging - Social Network",
  description: "A modern social media platform built with Next.js and Laravel",
  keywords: "social media, microblogging, posts, timeline",
  authors: [{ name: "Wonderway Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="csrf-token" content="{{ csrf_token() }}" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <div id="skip-link">
                <a 
                  href="#main-content" 
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
                >
                  Skip to main content
                </a>
              </div>
              <main id="main-content">
                {children}
              </main>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}