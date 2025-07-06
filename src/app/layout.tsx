import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./performance.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Melann Lending Management System",
  description: "Modern lending and microfinance management system built with Next.js and Supabase",
};

import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import ErrorMonitor from '@/components/ErrorMonitor'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}>
        <SettingsProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background font-sans antialiased">
              {children}
              {process.env.NODE_ENV === 'development' && <ErrorMonitor />}
            </div>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
