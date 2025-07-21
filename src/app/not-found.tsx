
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import { ROUTES } from '@/lib/constants';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 w-full">
      <main className="text-center w-full">
        <PageHeaderCard
          title="404 - পৃষ্ঠা খুঁজে পাওয়া যায়নি"
          description="দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি এখানে নেই।"
          actions={<AlertTriangle className="w-10 h-10 text-destructive" />}
          className="w-full max-w-2xl mx-auto"
          titleClassName="text-destructive"
        />
        <div className="mt-8">
          <p className="text-lg text-muted-foreground mb-6">
            সম্ভবত ঠিকানাটি ভুল লেখা হয়েছে অথবা পৃষ্ঠাটি সরিয়ে ফেলা হয়েছে।
          </p>
          <Button asChild size="lg" variant="default">
            <Link href={ROUTES.DASHBOARD}>
              ড্যাশবোর্ডে ফিরে যান
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
