
'use client';
import React from 'react';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Construction } from 'lucide-react';

export default function StoreManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="ঔষধ ব্যবস্থাপনা"
        description="আপনার ক্লিনিকের ঔষধপত্র এবং স্টক পরিচালনা করুন।"
        actions={<Store className="h-8 w-8 text-primary" />}
      />
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center">
            <Construction className="mr-3 h-6 w-6 text-amber-500" />
            এই ফিচারটি শীঘ্রই আসছে!
            </CardTitle>
          <CardDescription>
            আমরা বর্তমানে ঔষধ ব্যবস্থাপনা মডিউলটির উন্নয়নে কাজ করছি। এটি আপনাকে ঔষধের তালিকা, স্টক লেভেল, মেয়াদ উত্তীর্ণের তারিখ এবং আরও অনেক কিছু ট্র্যাক করতে সাহায্য করবে।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center bg-muted/50 rounded-lg">
            <Construction className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              এই মডিউলটি শীঘ্রই আপনার ব্যবহারের জন্য উপলব্ধ হবে। আপনার ধৈর্যের জন্য ধন্যবাদ!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
