
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} from '@/lib/firestoreService';
import type { Medicine } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Store,
  PlusCircle,
  Pencil,
  Trash2,
  Loader2,
  Search,
  PackageWarning,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

const medicineSchema = z.object({
  name: z.string().min(1, 'ঔষধের নাম আবশ্যক।'),
  potency: z.string().min(1, 'পোটেন্সি আবশ্যক।'),
  quantity: z.coerce
    .number()
    .min(0, 'পরিমাণ অবশ্যই একটি অ-ঋণাত্মক সংখ্যা হতে হবে।'),
  unit: z.enum(['dram', 'ml', 'pcs', 'gm', 'other']),
  supplier: z.string().optional(),
  purchaseDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

type MedicineFormValues = z.infer<typeof medicineSchema>;

export default function StoreManagementPage() {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: '',
      potency: '',
      quantity: 0,
      unit: 'dram',
      supplier: '',
      purchaseDate: '',
      expiryDate: '',
    },
  });

  const fetchMedicines = useCallback(async () => {
    setIsLoading(true);
    try {
      const meds = await getMedicines();
      setMedicines(meds);
    } catch (error) {
      toast({
        title: 'ত্রুটি',
        description: 'ঔষধের তালিকা আনতে সমস্যা হয়েছে।',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleAddNew = () => {
    setEditingMedicine(null);
    form.reset({
      name: '',
      potency: '',
      quantity: 0,
      unit: 'dram',
      supplier: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    form.reset({
      name: medicine.name,
      potency: medicine.potency,
      quantity: medicine.quantity,
      unit: medicine.unit,
      supplier: medicine.supplier || '',
      purchaseDate: medicine.purchaseDate
        ? new Date(medicine.purchaseDate).toISOString().split('T')[0]
        : '',
      expiryDate: medicine.expiryDate
        ? new Date(medicine.expiryDate).toISOString().split('T')[0]
        : '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (medicineId: string) => {
    try {
      await deleteMedicine(medicineId);
      toast({
        title: 'সফল',
        description: 'ঔষধটি তালিকা থেকে মুছে ফেলা হয়েছে।',
      });
      fetchMedicines();
    } catch (error) {
      toast({
        title: 'ত্রুটি',
        description: 'ঔষধটি মুছতে সমস্যা হয়েছে।',
        variant: 'destructive',
      });
    }
  };

  const onSubmit: SubmitHandler<MedicineFormValues> = async (data) => {
    try {
      if (editingMedicine) {
        await updateMedicine(editingMedicine.id, data);
        toast({
          title: 'সফল',
          description: 'ঔষধের তথ্য আপডেট করা হয়েছে।',
        });
      } else {
        await addMedicine(data);
        toast({
          title: 'সফল',
          description: 'নতুন ঔষধ যোগ করা হয়েছে।',
        });
      }
      fetchMedicines();
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: 'ত্রুটি',
        description: 'তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।',
        variant: 'destructive',
      });
    }
  };

  const filteredMedicines = useMemo(() => {
    return medicines
      .filter((med) =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((med) => !showLowStock || med.quantity < 10);
  }, [medicines, searchTerm, showLowStock]);

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="ঔষধ ব্যবস্থাপনা"
        description="আপনার ক্লিনিকের ঔষধপত্র এবং স্টক পরিচালনা করুন।"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={showLowStock ? 'destructive' : 'outline'}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <PackageWarning className="mr-2 h-4 w-4" />
              {showLowStock ? 'সকল স্টক দেখুন' : 'লো স্টক'}
            </Button>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> নতুন ঔষধ যোগ করুন
            </Button>
          </div>
        }
        className="bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-900/30"
      >
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="ঔষধের নাম দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </PageHeaderCard>

      <div className="overflow-x-auto rounded-lg border shadow-sm bg-card/80 backdrop-blur-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>নাম ও পোটেন্সি</TableHead>
              <TableHead className="text-center">স্টক</TableHead>
              <TableHead>সরবরাহকারী</TableHead>
              <TableHead>মেয়াদ উত্তীর্ণ</TableHead>
              <TableHead className="text-right">কার্যক্রম</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="ml-2">লোড হচ্ছে...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMedicines.length > 0 ? (
              filteredMedicines.map((med) => {
                const isExpired =
                  med.expiryDate && new Date(med.expiryDate) < new Date();
                const isLowStock = med.quantity < 10;
                return (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">
                      {med.name}
                      <span className="text-muted-foreground text-xs ml-2">
                        {med.potency}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={isLowStock ? 'destructive' : 'secondary'}
                        className="w-20 justify-center"
                      >
                        {med.quantity} {med.unit}
                      </Badge>
                    </TableCell>
                    <TableCell>{med.supplier || 'N/A'}</TableCell>
                    <TableCell
                      className={isExpired ? 'text-destructive font-bold' : ''}
                    >
                      {med.expiryDate
                        ? new Date(med.expiryDate).toLocaleDateString('bn-BD')
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(med)}
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                            <AlertDialogDescription>
                              এই ঔষধটি তালিকা থেকে স্থায়ীভাবে মুছে ফেলা হবে।
                              এই প্রক্রিয়াটি বাতিল করা যাবে না।
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>বাতিল</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(med.id)}
                            >
                              নিশ্চিত করুন
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  কোনো ঔষধ পাওয়া যায়নি।
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMedicine ? 'ঔষধ সম্পাদনা করুন' : 'নতুন ঔষধ যোগ করুন'}
            </DialogTitle>
            <DialogDescription>
              ঔষধের বিবরণ পূরণ করে সংরক্ষণ করুন।
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>নাম</FormLabel>
                      <FormControl>
                        <Input placeholder="ঔষধের নাম" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="potency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>পোটেন্সি</FormLabel>
                      <FormControl>
                        <Input placeholder="যেমন: 30C, 200C, 1M" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>পরিমাণ</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>একক</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="একক নির্বাচন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dram">ড্রাম</SelectItem>
                          <SelectItem value="ml">এমএল</SelectItem>
                          <SelectItem value="pcs">পিস</SelectItem>
                          <SelectItem value="gm">গ্রাম</SelectItem>
                          <SelectItem value="other">অন্যান্য</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>সরবরাহকারী (ঐচ্ছিক)</FormLabel>
                    <FormControl>
                      <Input placeholder="সরবরাহকারীর নাম" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ক্রয়ের তারিখ (ঐচ্ছিক)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>মেয়াদ উত্তীর্ণ (ঐচ্ছিক)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">বাতিল</Button></DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  সংরক্ষণ করুন
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
