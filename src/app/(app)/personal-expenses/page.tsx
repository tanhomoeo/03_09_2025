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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  formatCurrency,
} from '@/lib/firestoreService';
import type { PersonalExpense, ExpenseCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  DollarSign,
  PlusCircle,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Wallet,
  Landmark,
  Utensils,
  Car,
  HeartPulse,
  GraduationCap,
  Sparkles,
  ShoppingBag
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
import { Card, CardContent } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';

const expenseSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'একটি বৈধ তারিখ প্রয়োজন।',
  }),
  category: z.custom<ExpenseCategory>(),
  description: z.string().min(1, 'বিবরণ আবশ্যক।'),
  amount: z.coerce.number().positive('খরচ অবশ্যই একটি ধনাত্মক সংখ্যা হতে হবে।'),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const expenseCategories: {
  value: ExpenseCategory;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: 'household', label: 'পারিবারিক', icon: Landmark },
  { value: 'transport', label: 'যাতায়াত', icon: Car },
  { value: 'food', label: 'খাবার', icon: Utensils },
  { value: 'utilities', label: 'বিল', icon: Wallet },
  { value: 'personal', label: 'ব্যক্তিগত', icon: ShoppingBag },
  { value: 'health', label: 'স্বাস্থ্য', icon: HeartPulse },
  { value: 'education', label: 'শিক্ষা', icon: GraduationCap },
  { value: 'entertainment', label: 'বিনোদন', icon: Sparkles },
  { value: 'other', label: 'অন্যান্য', icon: DollarSign },
];

const getCategoryInfo = (value: ExpenseCategory) => {
  return (
    expenseCategories.find((c) => c.value === value) || {
      label: 'Unknown',
      icon: DollarSign,
    }
  );
};

export default function PersonalExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PersonalExpense | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: 'household',
      description: '',
      amount: 0,
    },
  });

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const allExpenses = await getExpenses();
      setExpenses(allExpenses);
    } catch {
      toast({
        title: 'ত্রুটি',
        description: 'খরচের তালিকা আনতে সমস্যা হয়েছে।',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleAddNew = () => {
    setEditingExpense(null);
    form.reset({
      date: new Date().toISOString().split('T')[0],
      category: 'household',
      description: '',
      amount: 0,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (expense: PersonalExpense) => {
    setEditingExpense(expense);
    form.reset({
      date: new Date(expense.date).toISOString().split('T')[0],
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      toast({
        title: 'সফল',
        description: 'খরচটি তালিকা থেকে মুছে ফেলা হয়েছে।',
      });
      fetchExpenses();
    } catch {
      toast({
        title: 'ত্রুটি',
        description: 'খরচটি মুছতে সমস্যা হয়েছে।',
        variant: 'destructive',
      });
    }
  };

  const onSubmit: SubmitHandler<ExpenseFormValues> = async (data) => {
    try {
      const expenseData: Omit<
        PersonalExpense,
        'id' | 'createdAt' | 'updatedAt'
      > = {
        date: new Date(data.date).toISOString(),
        category: data.category,
        description: data.description,
        amount: data.amount,
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
        toast({
          title: 'সফল',
          description: 'খরচের তথ্য আপডেট করা হয়েছে।',
        });
      } else {
        await addExpense(expenseData);
        toast({
          title: 'সফল',
          description: 'নতুন খরচ যোগ করা হয়েছে।',
        });
      }
      fetchExpenses();
      setIsModalOpen(false);
    } catch {
      toast({
        title: 'ত্রুটি',
        description: 'তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।',
        variant: 'destructive',
      });
    }
  };

  const filteredExpenses = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return expenses
      .filter((exp) => {
        const expDate = parseISO(exp.date);
        return expDate >= monthStart && expDate <= monthEnd;
      })
      .filter(
        (exp) =>
          exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getCategoryInfo(exp.category)
            .label.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
  }, [expenses, searchTerm, currentMonth]);

  const totalForMonth = useMemo(
    () => filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    [filteredExpenses]
  );
  
  const changeMonth = (direction: 'next' | 'prev') => {
      setCurrentMonth(prev => {
          const newDate = new Date(prev);
          newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
          return newDate;
      });
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="ব্যক্তিগত খরচ"
        description="আপনার ব্যক্তিগত খরচ এবং হিসাব পরিচালনা করুন।"
        actions={
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> নতুন খরচ যোগ করুন
          </Button>
        }
        className="bg-gradient-to-br from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-900/30"
      />

      <Card className="shadow-md bg-card/80 backdrop-blur-lg">
        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
              <Button onClick={() => changeMonth('prev')} variant="outline" size="sm">পূর্ববর্তী মাস</Button>
              <span className="font-bold text-lg text-primary">
                  {format(currentMonth, 'MMMM yyyy', { locale: bn })}
              </span>
              <Button onClick={() => changeMonth('next')} variant="outline" size="sm">পরবর্তী মাস</Button>
          </div>
          <div className="font-bold text-xl">
            মোট খরচ:{" "}
            <span className="text-destructive">{formatCurrency(totalForMonth)}</span>
          </div>
        </CardContent>
      </Card>

       <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="বিবরণ বা খাত দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

      <div className="overflow-x-auto rounded-lg border shadow-sm bg-card/80 backdrop-blur-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>তারিখ</TableHead>
              <TableHead>খাত</TableHead>
              <TableHead>বিবরণ</TableHead>
              <TableHead className="text-right">পরিমাণ</TableHead>
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
            ) : filteredExpenses.length > 0 ? (
              filteredExpenses.map((exp) => {
                const CategoryIcon = getCategoryInfo(exp.category).icon;
                return (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">
                      {format(new Date(exp.date), 'dd MMM, yy', {
                        locale: bn,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{getCategoryInfo(exp.category).label}</span>
                      </div>
                    </TableCell>
                    <TableCell>{exp.description}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(exp.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(exp)}
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
                              এই খরচটি তালিকা থেকে স্থায়ীভাবে মুছে ফেলা হবে। এই
                              প্রক্রিয়াটি বাতিল করা যাবে না।
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>বাতিল</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(exp.id)}
                            >
                              নিশ্চি��� করুন
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
                  এই মাসের জন্য কোনো খরচ পাওয়া যায়নি।
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
              {editingExpense ? 'খরচ সম্পাদনা করুন' : 'নতুন খরচ যোগ করুন'}
            </DialogTitle>
            <DialogDescription>
              খরচের বিবরণ পূরণ করে সংরক্ষণ করুন।
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>তারিখ</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>খাত</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="খাত নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {expenseCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <cat.icon className="h-4 w-4" />
                              <span>{cat.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>বিবরণ</FormLabel>
                    <FormControl>
                      <Textarea placeholder="খরচের বিস্তারিত বিবরণ" {...field} />
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
                    <FormLabel>পরিমাণ (টাকা)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
