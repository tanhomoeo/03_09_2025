'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import { placeSteadfastOrder, getCurrentBalance, getDeliveryStatusByInvoice } from '@/lib/steadfastService';
import type { SteadfastOrder, SteadfastConsignment, SteadfastBalance } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Truck,
  PlusCircle,
  Loader2,
  RefreshCw,
  Wallet,
  CheckCircle,
  Clock,
  XCircle,
  BadgeHelp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/firestoreService';

const orderSchema = z.object({
  invoice: z.string().min(1, 'ইনভয়েস আইডি আবশ্যক।'),
  recipient_name: z.string().min(1, 'প্রাপকের নাম আবশ্যক।').max(100),
  recipient_phone: z.string().regex(/^01\d{9}$/, 'একটি বৈধ ১১ সংখ্যার ফোন নম্বর দিন।'),
  recipient_address: z.string().min(1, 'প্রাপকের ঠিকানা আবশ্যক।').max(250),
  cod_amount: z.coerce.number().min(0, 'ক্যাশ অন ডেলিভারি পরিমাণ ঋণাত্মক হতে পারে না।'),
  note: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const statusVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    in_review: 'outline',
    pending: 'secondary',
    delivered: 'default',
    cancelled: 'destructive',
    hold: 'destructive',
};

const statusIconMap: { [key: string]: React.ElementType } = {
    in_review: Clock,
    pending: Clock,
    delivered: CheckCircle,
    cancelled: XCircle,
    hold: BadgeHelp,
};


export default function CourierPage() {
  const { toast } = useToast();
  const [consignments, setConsignments] = useState<SteadfastConsignment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState<SteadfastBalance | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      invoice: `INV-${Date.now().toString().slice(-6)}`,
      recipient_name: '',
      recipient_phone: '',
      recipient_address: '',
      cod_amount: 0,
      note: '',
    },
  });

  const fetchBalance = useCallback(async () => {
    setIsLoadingBalance(true);
    try {
      const balanceData = await getCurrentBalance();
      setBalance(balanceData);
    } catch (error) {
      toast({
        title: 'ব্যালেন্স লোড করতে সমস্যা',
        description: error instanceof Error ? error.message : 'একটি অজানা ত্রুটি হয়েছে।',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingBalance(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleAddNew = () => {
    form.reset({
      invoice: `INV-${Date.now().toString().slice(-6)}`,
      recipient_name: '',
      recipient_phone: '',
      recipient_address: '',
      cod_amount: 0,
      note: '',
    });
    setIsModalOpen(true);
  };
  
  const handleRefreshStatus = useCallback(async (invoiceId: string) => {
    try {
      const statusData = await getDeliveryStatusByInvoice(invoiceId);
      setConsignments(prev => 
        prev.map(c => 
          c.invoice === invoiceId ? { ...c, status: statusData.delivery_status } : c
        )
      );
      toast({
        title: 'স্ট্যাটাস আপডেট হয়েছে',
        description: `ইনভয়েস ${invoiceId} এর স্ট্যাটাস এখন ${statusData.delivery_status}.`,
      });
    } catch (error) {
      toast({
        title: 'স্ট্যাটাস আপডেট ব্যর্থ',
        description: error instanceof Error ? error.message : 'একটি অজানা ত্রুটি হয়েছে।',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const onSubmit: SubmitHandler<OrderFormValues> = async (data) => {
    try {
      const orderData: SteadfastOrder = data;
      const result = await placeSteadfastOrder(orderData);

      if (result.status === 200) {
        setConsignments(prev => [result.consignment, ...prev]);
        toast({
          title: 'অর্ডার সফল হয়েছে',
          description: result.message,
        });
        setIsModalOpen(false);
      } else {
        throw new Error(result.message || 'অর্ডার তৈরি করতে সমস্যা হয়েছে।');
      }
    } catch (error) {
      toast({
        title: 'অর্ডার ব্যর্থ হয়েছে',
        description: error instanceof Error ? error.message : 'একটি অজানা ত্রুটি হয়েছে।',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="কুরিয়ার সার্ভিস"
        description="Steadfast Courier এর মাধ্যমে আপনার পার্সেল পরিচালনা করুন।"
        actions={
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> নতুন অর্ডার তৈরি করুন
          </Button>
        }
        className="bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30"
      />
      
      <Card className="shadow-md bg-card/80 backdrop-blur-lg">
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-6 h-6 text-green-600"/>
              <CardTitle className="font-headline text-lg">বর্তমান ব্যালেন্স</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={fetchBalance} disabled={isLoadingBalance}>
                <RefreshCw className={cn("h-4 w-4", isLoadingBalance && "animate-spin")} />
            </Button>
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold text-primary">
              {balance ? formatCurrency(balance.current_balance) : 'লোড হচ্ছে...'}
            </p>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-lg border shadow-sm bg-card/80 backdrop-blur-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ইনভয়েস/ট্র্যাকিং</TableHead>
              <TableHead>প্রাপক</TableHead>
              <TableHead>COD</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead className="text-right">কার্যক্রম</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consignments.length > 0 ? (
              consignments.map((c) => {
                const StatusIcon = statusIconMap[c.status] || BadgeHelp;
                return (
                    <TableRow key={c.consignment_id}>
                        <TableCell>
                            <p className="font-medium">{c.invoice}</p>
                            <p className="text-xs text-muted-foreground">{c.tracking_code}</p>
                        </TableCell>
                        <TableCell>
                            <p className="font-medium">{c.recipient_name}</p>
                            <p className="text-xs text-muted-foreground">{c.recipient_phone}</p>
                        </TableCell>
                        <TableCell>{formatCurrency(c.cod_amount)}</TableCell>
                        <TableCell>
                            <Badge variant={statusVariantMap[c.status] || 'secondary'}>
                                <StatusIcon className="h-3 w-3 mr-1.5" />
                                {c.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRefreshStatus(c.invoice)}>
                            <RefreshCw className="h-4 w-4 text-blue-600" />
                        </Button>
                        </TableCell>
                    </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  এখনো কোনো অর্ডার তৈরি করা হয়নি।
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>নতুন কুরিয়ার অর্ডার</DialogTitle>
            <DialogDescription>
              অনুগ্রহ করে পার্সেলের জন্য প্রয়োজনীয় তথ্য দিন।
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="invoice" render={({ field }) => ( <FormItem> <FormLabel>ইনভয়েস আইডি</FormLabel> <FormControl> <Input placeholder="ইউনিক ইনভয়েস আইডি" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="recipient_name" render={({ field }) => ( <FormItem> <FormLabel>প্রাপকের নাম</FormLabel> <FormControl> <Input placeholder="প্রাপকের পুরো নাম" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="recipient_phone" render={({ field }) => ( <FormItem> <FormLabel>প্রাপকের ফোন</FormLabel> <FormControl> <Input placeholder="01XXXXXXXXX" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="recipient_address" render={({ field }) => ( <FormItem> <FormLabel>প্রাপকের ঠিকানা</FormLabel> <FormControl> <Textarea placeholder="সম্পূর্ণ ঠিকানা" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="cod_amount" render={({ field }) => ( <FormItem> <FormLabel>ক্যাশ অন ডেলিভারি (COD)</FormLabel> <FormControl> <Input type="number" placeholder="0" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="note" render={({ field }) => ( <FormItem> <FormLabel>বিশেষ নোট (ঐচ্ছিক)</FormLabel> <FormControl> <Textarea placeholder="ডেলিভারি সংক্রান্ত নোট" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline"> বাতিল </Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  অর্ডার তৈরি করুন
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
