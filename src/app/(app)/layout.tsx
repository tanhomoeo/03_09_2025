'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

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
    <>
        <AppSidebar />
        <main className={cn(
            "flex-1 w-full transition-all duration-300 ease-in-out motion-reduce:transition-none motion-reduce:animate-none px-4 sm:px-6 pb-20 md:pb-6",
            "peer-data-[state=open]:md:ml-[16rem] peer-data-[state=closed]:md:ml-[4.5rem]"
        )}>
            {children}
        </main>
        <MobileBottomNav />
    </>
  );
}
