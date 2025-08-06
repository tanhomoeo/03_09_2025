
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';
import { SidebarProvider } from '@/components/ui/sidebar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ROUTES } from '@/lib/constants';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return <LoadingSpinner variant="page" showLogo={true} label="অ্যাকাউন্ট লোড হচ্ছে..." />;
  }

  // This check might be redundant due to the effect above, but serves as a safeguard.
  if (pathname === '/') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 md:ml-0 max-w-6xl mx-auto w-full">
        {children}
      </main>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
