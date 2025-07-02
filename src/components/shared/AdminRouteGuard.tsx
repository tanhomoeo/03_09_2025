
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { PageHeaderCard } from './PageHeaderCard';
import { Button } from '../ui/button';
import { ROUTES } from '@/lib/constants';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center" aria-live="polite" aria-busy="true">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3">অ্যাক্সেস যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" role="alert">
            <PageHeaderCard
                title="প্রবেশাধিকার নেই"
                description="দুঃখিত, এই পৃষ্ঠাটি শুধুমাত্র অ্যাডমিনদের জন্য সংরক্ষিত।"
                actions={<ShieldAlert className="w-10 h-10 text-destructive" />}
                className="w-full max-w-2xl text-center"
                titleClassName="text-destructive"
            />
            <div className="mt-8">
                <Button onClick={() => router.push(ROUTES.DASHBOARD)}>
                    ড্যাশবোর্ডে ফিরে যান
                </Button>
            </div>
      </div>
    );
  }

  return <>{children}</>;
}
