
'use client';
import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getClinicSettings, saveClinicSettings } from '@/lib/firestoreService';
import type { ClinicSettings } from '@/lib/types';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import { Loader2, Save, Building } from 'lucide-react';
import AdminRouteGuard from '@/components/shared/AdminRouteGuard';

const clinicInfoFormSchema = z.object({
  clinicName: z.string().min(1, "ক্লিনিকের নাম আবশ্যক।"),
 doctorName: z.string().min(1, "ডাক্তারের নাম আবশ্যক।"),
  clinicAddress: z.string().min(1, "ক্লিনিকের ঠিকানা আবশ্যক।"),
  clinicContact: z.string().min(1, "ক্লিনিকের যোগাযোগ নম্বর আবশ্যক।"),
  bmRegNo: z.string().optional(),
});

type ClinicInfoFormValues = z.infer<typeof clinicInfoFormSchema>;

export default function ClinicInformationPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ClinicInfoFormValues>({
    resolver: zodResolver(clinicInfoFormSchema),
    defaultValues: {
      clinicName: '',
      doctorName: '',
      clinicAddress: '',
      clinicContact: '',
      bmRegNo: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const currentSettings = await getClinicSettings();
        form.reset({
          clinicName: currentSettings.clinicName || '',
          doctorName: currentSettings.doctorName || '',
          clinicAddress: currentSettings.clinicAddress || '',
          clinicContact: currentSettings.clinicContact || '',
          bmRegNo: currentSettings.bmRegNo || '',
        });
      } catch (error) {
          toast({ title: "ত্রুটি", description: "ক্লিনিকের তথ্য লোড করা যায়নি।", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [form, toast]);

  const onSubmit: SubmitHandler<ClinicInfoFormValues> = async (data) => {
    try {
      const updatedSettings: ClinicSettings = { ...data };
      await saveClinicSettings(updatedSettings);
      toast({
        title: 'ক্লিনিকের তথ্য সংরক্ষিত হয়েছে',
        description: 'ক্লিনিকের বিবরণ সফলভাবে আপডেট করা হয়েছে।',
      });
      window.dispatchEvent(new CustomEvent('firestoreDataChange'));
    } catch (error) {
      console.error('Failed to save clinic information:', error);
      toast({
        title: 'সংরক্ষণ ব্যর্থ হয়েছে',
        description: 'তথ্য সংরক্ষণ করার সময় একটি ত্রুটি ঘটেছে।',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
               <p className="ml-3">ক্লিনিকের তথ্য লোড হচ্ছে...</p>
          </div>
      );
  }

  return (
    <AdminRouteGuard>
      <div className="space-y-6">
        <PageHeaderCard 
          title="ক্লিনিকের তথ্য"
          description="প্রিন্ট করা ডকুমেন্টে ব্যবহারের জন্য আপনার ক্লিনিকের বিবরণ পরিচালনা করুন।"
          actions={<Building className="h-8 w-8 text-primary" />}
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-lg">ক্লিনিকের বিবরণ</CardTitle>
                <CardDescription>এই তথ্যগুলো প্রেসক্রিপশন এবং রিপোর্টের মতো প্রিন্ট করা ডকুমেন্টে ব্যবহৃত হবে।</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clinicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ক্লিনিকের নাম</FormLabel>
                      <FormControl>
                        <Input placeholder="যেমন: আপনার ক্লিনিকের নাম" {...field} id="clinicNameInfo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doctorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ডাক্তারের নাম</FormLabel>
                      <FormControl>
                        <Input placeholder="যেমন: ডাঃ জন ডো" {...field} id="doctorNameInfo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clinicAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>ক্লিনিকের ঠিকানা</FormLabel>
                      <FormControl>
                        <Textarea placeholder="সম্পূর্ণ ঠিকানা" {...field} rows={3} id="clinicAddressInfo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clinicContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>যোগাযোগ (ফোন/ইমেল)</FormLabel>
                       <FormControl>
                         <Input placeholder="যেমন: ০১XXXXXXXXX, email@example.com" {...field} />
                       </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bmRegNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>বিএমডিসি রেজিস্ট্রেশন নং (ঐচ্ছিক)</FormLabel>
                      <FormControl>
                        <Input placeholder="যেমন: 12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-6">
                <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[150px]">
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  তথ্য সংরক্ষণ করুন
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </AdminRouteGuard>
  );
}
