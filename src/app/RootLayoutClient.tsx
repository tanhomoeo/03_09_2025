
'use client';

import dynamic from 'next/dynamic';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from '@/contexts/AuthContext';
import { VoiceInputProvider } from '@/contexts/VoiceInputContext';

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
        attribute="data-theme"
        defaultTheme="default"
        enableSystem={false}
        disableTransitionOnChange
      >
      <AuthProvider>
        <VoiceInputProvider>
          <div className="flex min-h-svh">
              {children}
          </div>
          <Toaster />
          <FloatingVoiceInput />
        </VoiceInputProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
