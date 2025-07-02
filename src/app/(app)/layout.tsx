
'use client';
import React, { useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FloatingVoiceInput } from '@/components/shared/FloatingVoiceInput';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            {/* Spinning border as the outer animation */}
            <div className="absolute h-[100px] w-[100px] rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            {/* Logo container */}
            <div className="p-4 bg-card rounded-full shadow-neumorphic-outset">
              <Image 
                  src="/icons/icon.png" 
                  alt={`${APP_NAME} Logo`}
                  width={64} 
                  height={64}
                  priority
                  data-ai-hint="clinic health logo"
              />
            </div>
          </div>
          <p className="text-muted-foreground mt-2">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      {/* This outer div takes up the remaining space next to the sidebar */}
      <div className="flex flex-1 flex-col">
        {/* Mobile-only header with sidebar trigger */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-start border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
            <SidebarTrigger />
        </header>
        {/* Main content area with vertical scrolling */}
        <main className="flex-1 overflow-y-auto">
          {/* Centered container for the page content */}
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <FloatingVoiceInput />
    </SidebarProvider>
  );
}
