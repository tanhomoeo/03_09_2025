
'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from '@/contexts/AuthContext';
import { VoiceInputProvider } from '@/contexts/VoiceInputContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getAnalyticsInstance, getStorageInstance } from '@/lib/firebase';

const FloatingVoiceInput = dynamic(
  () => import('@/components/shared/FloatingVoiceInput').then(mod => mod.FloatingVoiceInput),
  { ssr: false }
);

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
            <VoiceInputProvider>
              <div className="flex min-h-svh w-full">
                  {children}
              </div>
              <Toaster />
              <FloatingVoiceInput />
            </VoiceInputProvider>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
