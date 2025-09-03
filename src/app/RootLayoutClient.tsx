
'use client';

import dynamic from 'next/dynamic';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from '@/contexts/AuthContext';
import { VoiceInputProvider } from '@/contexts/VoiceInputContext';
import { SidebarProvider } from '@/components/ui/sidebar';

const FloatingVoiceInput = dynamic(
  () => import('@/components/shared/FloatingVoiceInput').then(mod => mod.FloatingVoiceInput),
  { ssr: false }
);

export default function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
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
