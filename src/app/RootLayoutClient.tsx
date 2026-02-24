
'use client';

import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getAnalyticsInstance, getStorageInstance } from '@/lib/firebase';

export default function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    const initializeFirebaseServices = async () => {
      await getAnalyticsInstance();
      getStorageInstance();
    };

    initializeFirebaseServices();
  }, []);

  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
      <AuthProvider>
        <SidebarProvider>
              <div className="flex min-h-svh w-full">
                  {children}
              </div>
              <Toaster />
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
