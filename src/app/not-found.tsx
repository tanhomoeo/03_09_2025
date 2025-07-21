
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronLeft } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 text-foreground p-4 w-full">
      <main className="text-center w-full max-w-lg mx-auto">
        <div className="relative mb-8 w-48 h-48 mx-auto">
            <Image
                src="https://placehold.co/600x400.png"
                alt="404 Not Found"
                width={400}
                height={400}
                className="opacity-50"
                data-ai-hint="sad robot confused"
            />
             <div className="absolute inset-0 flex items-center justify-center">
                 <AlertTriangle className="w-20 h-20 text-destructive opacity-80" />
             </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-destructive font-headline mb-4">
            404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            পৃষ্ঠা খুঁজে পাওয়া যায়নি
        </h2>

        <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
            দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি এখানে নেই। সম্ভবত ঠিকানাটি ভুল লেখা হয়েছে অথবা পৃষ্ঠাটি সরিয়ে ফেলা হয়েছে।
        </p>

        <Button asChild size="lg" variant="default" className="shadow-lg hover:shadow-xl transition-shadow">
            <Link href={ROUTES.DASHBOARD}>
              <ChevronLeft className="mr-2 h-5 w-5" />
              ড্যাশবোর্ডে ফিরে যান
            </Link>
        </Button>
      </main>
    </div>
  );
}
