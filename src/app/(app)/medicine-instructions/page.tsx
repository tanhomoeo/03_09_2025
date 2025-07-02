
import React from 'react';
import { Suspense } from 'react'; // Explicitly import Suspense
import MedicineInstructionsClientLogic from './MedicineInstructionsClientLogic';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // For fallback styling

export default function MedicineInstructionsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Card className="mb-6 shadow-sm h-24 animate-pulse">
            <CardHeader>
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mt-1"></div>
            </CardHeader>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="shadow-md animate-pulse">
                <CardHeader className="h-20 bg-muted/50 rounded-t-lg"></CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="h-10 bg-muted rounded w-full"></div>
                  <div className="h-24 bg-muted rounded w-full"></div>
                  <div className="h-40 bg-muted rounded w-full"></div>
                  {/* Simulating a footer-like area within the single CardContent */}
                  <div className="h-16 border-t pt-4 mt-4 bg-muted/30 rounded-b-lg"></div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
                <Card className="shadow-sm sticky top-6 animate-pulse">
                    <CardHeader className="h-12 bg-muted/50 rounded-t-lg"></CardHeader>
                    <CardContent className="p-4 min-h-[400px] bg-muted/30 rounded-b-lg"></CardContent>
                </Card>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-4 text-center mt-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-md text-muted-foreground">ঔষধের নিয়মাবলী পাতাটি লোড হচ্ছে...</p>
            <p className="text-sm text-muted-foreground/80">অনুগ্রহ করে অপেক্ষা করুন।</p>
          </div>
        </div>
      }
    >
      <MedicineInstructionsClientLogic />
    </Suspense>
  );
}
