
'use client';
import React, { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Patient, PaymentSlip, PaymentMethod, MedicineDeliveryMethod } from '@/lib/types';
import { addPaymentSlip, formatCurrency, updateVisit } from '@/lib/firestoreService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Receipt } from 'lucide-react';

export interface CreatePaymentSlipModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: (slipCreated?: boolean) => void;
  onSlipCreated?: (slip: PaymentSlip) => void;
  visitId?: string;
}

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'ক্যাশ' },
  { value: 'bkash', label: 'বিকাশ' },
  { value: 'nagad', label: 'নগদ' },
  { value: 'rocket', label: 'রকেট' },
  { value: 'other', label: 'অন্যান্য' },
];

const medicineDeliveryMethodOptions: { value: MedicineDeliveryMethod; label: string }[] = [
  { value: 'direct', label: 'সরাসরি প্রদান' },
  { value: 'courier', label: 'কুরিয়ারের মাধ্যমে প্রেরণ' },
];

const paymentSlipSchema = z.object({
  purpose: z.string().min(1, "উদ্দেশ্য আবশ্যক।"),
  amount: z.coerce.number().nonnegative("টাকার পরিমাণ অবশ্যই একটি অ-ঋণাত্মক সংখ্যা হতে হবে।"),
  paymentMethod: z.custom<PaymentMethod>().optional(),
  receivedBy: z.string().optional(),
  medicineDeliveryMethod: z.custom<MedicineDeliveryMethod>().optional(),
}).superRefine((data, ctx) => {
  if (data.amount > 0 && !data.paymentMethod) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "টাকার পরিমাণ ০ এর বেশি হলে পেমেন্ট মাধ্যম আবশ্যক।",
      path: ["paymentMethod"],
    });
  }
});

type PaymentSlipFormValues = z.infer<typeof paymentSlipSchema>;

export function CreatePaymentSlipModal({ patient, isOpen, onClose, onSlipCreated, visitId }: CreatePaymentSlipModalProps) {
  const { toast } = useToast();

  const form = useForm<PaymentSlipFormValues>({
    resolver: zodResolver(paymentSlipSchema),
    defaultValues: {
      purpose: visitId ? 'প্রেসক্রিপশন ফি' : 'সাধারণ পেমেন্ট',
      amount: 0,
      paymentMethod: 'cash',
      receivedBy: '',
      medicineDeliveryMethod: 'direct',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        purpose: visitId ? 'প্রেসক্রিপশন ফি' : 'সাধারণ পেমেন্ট',
        amount: 0,
        paymentMethod: 'cash',
        receivedBy: '',
        medicineDeliveryMethod: 'direct',
      });
    }
  }, [isOpen, form, visitId]);

  const onSubmit: SubmitHandler<PaymentSlipFormValues> = async (data) => {
    try {
      const newSlipData: Omit<PaymentSlip, 'id' | 'createdAt'> = {
        patientId: patient.id,
        visitId: visitId,
        slipNumber: `SLIP-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        amount: data.amount,
        purpose: data.purpose,
        paymentMethod: data.amount > 0 ? data.paymentMethod : undefined,
        receivedBy: data.receivedBy,
      };

      if (visitId && data.medicineDeliveryMethod) {
        await updateVisit(visitId, { medicineDeliveryMethod: data.medicineDeliveryMethod });
      }

      const slipId = await addPaymentSlip(newSlipData);
      if (!slipId) {
        throw new Error("Failed to save payment slip to Firestore.");
      }
      const createdSlip = { ...newSlipData, id: slipId, createdAt: new Date().toISOString() };

      toast({
        title: 'পেমেন্ট স্লিপ তৈরি হয়েছে',
        description: `স্লিপ ${createdSlip.slipNumber} (${formatCurrency(createdSlip.amount)}) সফলভাবে তৈরি করা হয়েছে।`,
      });
      if (onSlipCreated) {
        onSlipCreated(createdSlip as PaymentSlip);
      }
      onClose(true);
      window.dispatchEvent(new CustomEvent('firestoreDataChange'));
    } catch (error) {
      console.error("Failed to create payment slip:", error);
      toast({
        title: 'ত্রুটি',
        description: 'পেমেন্ট স্লিপ তৈরি করতে ব্যর্থ হয়েছে।',
        variant: 'destructive',
      });
      onClose(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <Receipt className="mr-2 h-5 w-5 text-primary" />
            {patient.name}-এর জন্য পেমেন্ট স্লিপ তৈরি করুন
          </DialogTitle>
          <DialogDescription>
            নতুন পেমেন্ট স্লিপের বিবরণ লিখুন।
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>উদ্দেশ্য</FormLabel>
                   <FormControl>
                     <Textarea placeholder="যেমন: প্রেসক্রিপশন ফি, ঔষধ বাবদ" {...field} />
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>টাকার পরিমাণ (BDT)</FormLabel>
                   <FormControl>
                     <Input type="number" placeholder="0.00" {...field} />
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>পেমেন্ট মাধ্যম</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''} defaultValue="cash">
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="পেমেন্ট মাধ্যম নির্বাচন করুন" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethodOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {visitId && (
              <FormField
                control={form.control}
                name="medicineDeliveryMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ঔষধ প্রদানের মাধ্যম</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'direct'} defaultValue="direct">
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="মাধ্যম নির্বাচন করুন" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {medicineDeliveryMethodOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="receivedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>গ্রহণকারী (ঐচ্ছিক)</FormLabel>
                  <FormControl>
                    <Input placeholder="গ্রহণকারীর নাম" {...field} id="slipReceivedByModalBengali"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => onClose(false)}>বাতিল</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Receipt className="mr-2 h-4 w-4" />
                )}
                স্লিপ তৈরি করুন
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
