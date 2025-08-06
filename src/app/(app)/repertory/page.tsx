'use client';
import React from 'react';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookMarked, Construction } from 'lucide-react';

export default function RepertoryBrowserPage() {
  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="রেপার্টরি ব্রাউজার"
        description="অধ্যায়, রুব্রিক এবং প্রতিকার ব্রাউজ এবং অনুসন্ধান করুন।"
        actions={<BookMarked className="h-8 w-8 text-primary" />}
        className="bg-gradient-to-br from-cyan-100 to-sky-200 dark:from-cyan-900/30 dark:to-sky-900/30"
      />
      <Card className="shadow-md bg-card/80 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center">
            <Construction className="mr-3 h-6 w-6 text-amber-500" />
            এই ফিচারটি শীঘ্রই আসছে!
          </CardTitle>
          <CardDescription>
            আমরা বর্তমানে একটি পূর্ণাঙ্গ রেপার্টরি ব্রাউজার তৈরির জন্য কাজ করছি। এই মডিউলটি আপনাকে অধ্যায়, রুব্রিক এবং প্রতিকারগুলোর মধ্যে সহজে অনুসন্ধান এবং ব্রাউজ করতে সাহায্য করবে।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center bg-muted/50 rounded-lg">
            <Construction className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              পূর্ণাঙ্গ রেপার্টরি ব্রাউজার এবং এর সাথে সম্পর্কিত ম্যানেজমেন্ট টুলগুলো শীঘ্রই চালু করা হবে। আমাদের সাথে থাকার জন্য ধন্যবাদ!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
