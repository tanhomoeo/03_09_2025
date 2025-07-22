
'use client';
import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getClinicSettings, getPatientById } from '@/lib/firestoreService';
import type { ClinicSettings, Patient } from '@/lib/types';
import { APP_NAME, ROUTES } from '@/lib/constants';
import { Printer, CalendarIcon, Info, ClipboardList, User, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { bn } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { CreatePaymentSlipModalProps } from '@/components/slip/CreatePaymentSlipModal';


const CreatePaymentSlipModal = dynamic<CreatePaymentSlipModalProps>(() =>
  import('@/components/slip/CreatePaymentSlipModal').then((mod) => mod.CreatePaymentSlipModal), {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-6 w-6 animate-spin text-primary" /> <span className="ml-2">পেমেন্ট মডাল লোড হচ্ছে...</span></div>
  }
);

const dropsOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toLocaleString('bn-BD'));
const shakesOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toLocaleString('bn-BD'));
const intervalOptions = ["২", "৩", "৪", "৬", "৮", "১২", "২৪"];
const intakeTimeOptionsT1 = [
  "সকালে", "দুপুরে", "রাত্রে",
  "সকালে ও রাত্রে",
  "খাবার ৩০ মিনিট আগে", "খাবার ৩০ মিনিট পরে",
  "সকালে খালি পেটে",
  "প্রয়োজন অনুযায়ী"
];
const intakeTimeOptionsT2 = ["সকালে", "দুপুরে", "রাত্রে", "সকালে ও রাত্রে"];
const followUpDaysOptions = ["৩", "৭", "১০", "১৫", "২১", "৩০", "৪৫", "৬০"];

const instructionsFormSchema = z.object({
  patientName: z.string().min(1, "রোগীর নাম আবশ্যক।"),
  patientActualId: z.string().optional(),
  visitId: z.string().optional(),
  instructionDate: z.date({ required_error: "নির্দেশনার তারিখ আবশ্যক।" }).optional(),
  serialNumber: z.string().optional(),
  followUpDays: z.string().min(1, "ফলো-আপ দিন নির্বাচন করুন।"),
  instructionTemplate: z.enum(['template1', 'template2']).default('template1'),
  dropsT1: z.string().optional(),
  intervalT1: z.string().optional(),
  intakeTimeT1: z.string().optional(),
  shakesT2: z.string().optional(),
  dropsT2: z.string().optional(),
  intervalT2: z.string().optional(),
  intakeTimeT2: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.instructionTemplate === 'template1') {
    if (!data.dropsT1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ঔষধের ফোঁটা নির্বাচন করুন।", path: ['dropsT1'] });
    if (!data.intervalT1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "কতক্ষণ পর পর তা নির্বাচন করুন।", path: ['intervalT1'] });
    if (!data.intakeTimeT1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "কখন খাবেন তা নির্বাচন করুন।", path: ['intakeTimeT1'] });
  } else if (data.instructionTemplate === 'template2') {
    if (!data.shakesT2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "কতবার ঝাঁকি দিতে হবে নির্বাচন করুন।", path: ['shakesT2'] });
    if (!data.dropsT2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ঔষধের ফোঁটা নির্বাচন করুন।", path: ['dropsT2'] });
    if (!data.intervalT2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "কতক্ষণ পর পর মিশ্রণ খাবেন।", path: ['intervalT2'] });
    if (!data.intakeTimeT2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "কখন মিশ্রণ খাবেন।", path: ['intakeTimeT2'] });
  }
});

type InstructionsFormValues = z.infer<typeof instructionsFormSchema>;

function MedicineInstructionsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [generatedInstruction, setGeneratedInstruction] = useState<string>('');
  const [generatedSlipNumber, setGeneratedSlipNumber] = useState<string>('');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);

  const form = useForm<InstructionsFormValues>({
    resolver: zodResolver(instructionsFormSchema),
    defaultValues: {
      patientName: '',
      patientActualId: '',
      visitId: '',
      instructionDate: undefined,
      serialNumber: '',
      followUpDays: '৭',
      instructionTemplate: 'template1',
      dropsT1: '৫',
      intervalT1: '৮',
      intakeTimeT1: 'সকালে ও রাত্রে',
      shakesT2: '৫',
      dropsT2: '৫',
      intervalT2: '৮',
      intakeTimeT2: 'সকালে',
    },
  });

  const currentTemplate = form.watch('instructionTemplate');

  const fetchData = useCallback(async () => {
    setIsLoadingPageData(true);
    try {
        const settings = await getClinicSettings();
        setClinicSettings(settings);

        const patientIdFromQuery = searchParams.get('patientId');
        const patientNameFromQuery = searchParams.get('name');
        const visitIdFromQuery = searchParams.get('visitId');

        const formDataUpdate: Partial<InstructionsFormValues> = {};
        let localSelectedPatient: Patient | null = null;

        if (visitIdFromQuery) {
            formDataUpdate.visitId = visitIdFromQuery;
        }

        if (patientIdFromQuery) {
            const patientData = await getPatientById(patientIdFromQuery);
            if (patientData) {
                localSelectedPatient = patientData;
                formDataUpdate.patientName = patientData.name;
                formDataUpdate.patientActualId = patientData.id;
                formDataUpdate.serialNumber = patientData.diaryNumber ? String(patientData.diaryNumber) : `MI-${String(Date.now()).slice(-6)}`;
            } else if (patientNameFromQuery) {
                formDataUpdate.patientName = decodeURIComponent(patientNameFromQuery);
                formDataUpdate.serialNumber = `MI-${String(Date.now()).slice(-6)}`;
            }
        } else if (patientNameFromQuery) {
            formDataUpdate.patientName = decodeURIComponent(patientNameFromQuery);
            formDataUpdate.serialNumber = `MI-${String(Date.now()).slice(-6)}`;
        }

        if (!formDataUpdate.serialNumber) {
            formDataUpdate.serialNumber = `MI-${String(Date.now()).slice(-6)}`;
        }

        setSelectedPatient(localSelectedPatient);
        form.reset({
            ...form.getValues(),
            ...formDataUpdate,
            instructionDate: formDataUpdate.instructionDate || undefined,
        });
        setPaymentCompleted(false);

    } catch (error) {
        console.error("Error fetching initial data for medicine instructions:", error);
        toast({ title: "ত্রুটি", description: "পৃষ্ঠার তথ্য লোড করতে সমস্যা হয়েছে।", variant: "destructive" });
    } finally {
        setIsLoadingPageData(false);
    }
  }, [searchParams, form, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isLoadingPageData && !form.getValues('instructionDate')) {
      form.setValue('instructionDate', new Date());
    }
  }, [isLoadingPageData, form]);


  const generateInstructionText = (data: InstructionsFormValues): string => {
    if (data.instructionTemplate === 'template1') {
      if (!data.dropsT1 || !data.intervalT1 || !data.intakeTimeT1) return "অনুগ্রহ করে টেমপ্লেট ১ এর জন্য সকল তথ্য পূরণ করুন।";
      return `${data.dropsT1} ফোঁটা ঔষধ সামান্য ঠান্ডা জলের সাথে মিশিয়ে ${data.intervalT1} ঘন্টা পর পর ${data.intakeTimeT1} খাবেন।`;
    } else if (data.instructionTemplate === 'template2') {
      if (!data.shakesT2 || !data.dropsT2 || !data.intervalT2 || !data.intakeTimeT2) return "অনুগ্রহ করে টেমপ্লেট ২ এর জন্য সকল তথ্য পূরণ করুন।";
      return `প্রতিবার ঔষধ সেবনের পূর্বে শিশিটিকে হাতের তালুর উপরে সজরে ${data.shakesT2} বার ঝাঁকি দিয়ে ${data.dropsT2} ফোটা ঔষধ এক কাপ জলে ভালোভাবে মিশিয়ে ${data.intervalT2} ঘন্টা পর পর মিশ্রণ থেকে এক চামচ করে ${data.intakeTimeT2} সেবন করুন।`;
    }
    return "একটি নির্দেশিকা টেমপ্লেট নির্বাচন করুন।";
  };

  const onSubmit: SubmitHandler<InstructionsFormValues> = (data) => {
    const instructionDateValue = form.getValues('instructionDate');
    if (!instructionDateValue || !isValid(instructionDateValue)) {
        toast({
            title: "তারিখ নির্বাচন করুন",
            description: "অনুগ্রহ করে নির্দেশনার জন্য একটি বৈধ তারিখ নির্বাচন করুন।",
            variant: "destructive"
        });
        return;
    }
    setGeneratedInstruction(generateInstructionText(data));
    setGeneratedSlipNumber(data.serialNumber || 'N/A');
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        document.body.classList.add('printing-active');
        window.print();
        document.body.classList.remove('printing-active');
      }
    }, 100);
  };

  const handleOpenPaymentModal = () => {
    if (selectedPatient && form.getValues('visitId')) {
      setIsPaymentModalOpen(true);
    } else {
        toast({ title: "ত্রুটি", description: "রোগীর তথ্য বা ভিজিট আইডি পাওয়া যায়নি। পেমেন্ট মডাল খোলা সম্ভব হচ্ছে না।", variant: "destructive" });
    }
  };

  const handlePaymentModalClose = (slipCreated: boolean = false) => {
    setIsPaymentModalOpen(false);
    if (slipCreated) {
      setPaymentCompleted(true);
      window.dispatchEvent(new CustomEvent('firestoreDataChange'));
    }
  };

  const handleFinishAndGoToDashboard = () => {
    router.push(ROUTES.DASHBOARD);
  };

  const inputWrapperClass = "flex h-10 items-center w-full rounded-md border border-input bg-card shadow-inner overflow-hidden focus-within:ring-1 focus-within:ring-ring focus-within:border-primary";
  const inputFieldClass = "h-full flex-1 border-0 bg-transparent shadow-none focus:ring-0 focus-visible:ring-0 px-3 text-base placeholder-muted-foreground";
  const readOnlyInputClass = "bg-muted/30 cursor-default";

  const currentValues = form.watch();
  const previewInstructionText = useMemo(() => generateInstructionText(currentValues), [currentValues]);
  const previewSlipNumber = useMemo(() => currentValues.serialNumber || 'N/A', [currentValues.serialNumber]);
  const isPatientNamePrefilled = !!searchParams.get('name') || !!selectedPatient;

  let pageHeaderDescriptionText: string;
  if (isLoadingPageData) {
    pageHeaderDescriptionText = "ঔষধের নিয়মাবলী লোড হচ্ছে...";
  } else if (selectedPatient) {
    const diaryStr = selectedPatient.diaryNumber ? ` (ডায়েরি নং: ${String(selectedPatient.diaryNumber)})` : '';
    pageHeaderDescriptionText = `রোগী: ${selectedPatient.name}${diaryStr}`;
  } else if (form.getValues('patientName')) {
    pageHeaderDescriptionText = `রোগী: ${form.getValues('patientName')}`;
  } else {
    pageHeaderDescriptionText = "রোগীর জন্য ঔষধ খাওয়ার নির্দেশিকা তৈরি ও প্রিন্ট করুন।";
  }

  if (isLoadingPageData && !selectedPatient && !searchParams.get('name') && !form.getValues('patientName')) {
      return (
        <React.Fragment>
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-3">ঔষধের নিয়মাবলী পাতাটি লোড হচ্ছে...</p>
          </div>
        </React.Fragment>
      );
  }

  return (
    <React.Fragment>
      <div className="space-y-6">
        <PageHeaderCard
          title="ঔষধ খাওয়ার নিয়মাবলী"
          description={pageHeaderDescriptionText}
          className="hide-on-print bg-gradient-to-br from-indigo-100 to-blue-200 dark:from-indigo-900/30 dark:to-blue-900/30"
          actions={<ClipboardList className="h-8 w-8 text-primary" />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 hide-on-print">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="shadow-md bg-card/80 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="font-headline text-lg">নির্দেশিকার তথ্য</CardTitle>
                    <CardDescription>অনুগ্রহ করে নিচের তথ্যগুলো পূরণ করুন।</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <FormField
                          control={form.control}
                          name="patientName"
                          render={({ field }) => (
                          <FormItem className="md:col-span-1">
                              <FormLabel>রোগীর নাম</FormLabel>
                              <div className={cn(inputWrapperClass, isPatientNamePrefilled && readOnlyInputClass)}>
                              <User className="h-4 w-4 text-muted-foreground mx-2" />
                              <FormControl>
                                  <Input
                                  placeholder="রোগীর পুরো নাম"
                                  {...field}
                                  readOnly={isPatientNamePrefilled}
                                  className={cn(inputFieldClass, isPatientNamePrefilled && readOnlyInputClass, "!pl-0")}
                                  />
                              </FormControl>
                              </div>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                       <FormField
                          control={form.control}
                          name="patientActualId"
                          render={({ field }) => (<Input type="hidden" {...field} />)}
                      />
                       <FormField
                          control={form.control}
                          name="visitId"
                          render={({ field }) => (<Input type="hidden" {...field} />)}
                      />
                      <FormField
                          control={form.control}
                          name="instructionDate"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>নির্দেশনার তারিখ</FormLabel>
                              <Popover>
                              <PopoverTrigger asChild>
                                  <Button
                                      variant={"outline"}
                                      className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                      inputWrapperClass
                                      )}
                                  >
                                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                                  {field.value && isValid(field.value) ? format(field.value, "PPP", { locale: bn }) : <span>একটি তারিখ নির্বাচন করুন</span>}
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                  <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  locale={bn}
                                  disabled={(date) => date < new Date("1900-01-01")}
                                  />
                              </PopoverContent>
                              </Popover>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="serialNumber"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>ডায়েরি নম্বর (স্লিপের ক্রমিক)</FormLabel>
                              <div className={cn(inputWrapperClass, readOnlyInputClass)}>
                              <FormControl>
                                  <Input {...field} readOnly className={cn(inputFieldClass, readOnlyInputClass)} />
                              </FormControl>
                              </div>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                       <FormField
                          control={form.control}
                          name="followUpDays"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>ফলো-আপ</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                  <SelectTrigger className={inputWrapperClass}>
                                      <SelectValue placeholder="দিন নির্বাচন করুন" />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  {followUpDaysOptions.map(option => <SelectItem key={option} value={option}>{option} দিন পর</SelectItem>)}
                              </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="instructionTemplate"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>নির্দেশনার টেমপ্লেট</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => {
                                  field.onChange(value as 'template1' | 'template2');
                              }}
                              defaultValue={field.value}
                              className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4"
                            >
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="template1" id="template1" />
                                </FormControl>
                                <FormLabel htmlFor="template1" className="font-normal">টেমপ্লেট ১ (সাধারণ)</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="template2" id="template2" />
                                </FormControl>
                                <FormLabel htmlFor="template2" className="font-normal">টেমপ্লেট ২ (ঝাঁকি ও মিশ্রণ)</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {currentTemplate === 'template1' && (
                      <Card className="p-4 bg-muted/50 backdrop-blur-md">
                        <CardDescription className="mb-3 text-sm font-medium text-primary">টেমপ্লেট ১: সাধারণ নিয়মাবলী</CardDescription>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField control={form.control} name="dropsT1" render={({ field }) => (
                              <FormItem> <FormLabel>ঔষধের ফোঁটা</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger className={inputWrapperClass}><SelectValue placeholder="ফোঁটা" /></SelectTrigger></FormControl> <SelectContent>{dropsOptions.map(o => <SelectItem key={`t1d${o}`} value={o}>{o} ফোঁটা</SelectItem>)}</SelectContent></Select> <FormMessage /> </FormItem>
                          )} />
                          <FormField control={form.control} name="intervalT1" render={({ field }) => (
                              <FormItem> <FormLabel>কতক্ষণ পর পর</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger className={inputWrapperClass}><SelectValue placeholder="সময়" /></SelectTrigger></FormControl> <SelectContent>{intervalOptions.map(o => <SelectItem key={`t1i${o}`} value={o}>{o} ঘন্টা</SelectItem>)}</SelectContent></Select> <FormMessage /> </FormItem>
                          )} />
                          <FormField control={form.control} name="intakeTimeT1" render={({ field }) => (
                              <FormItem className="md:col-span-3"> <FormLabel>কখন খাবেন</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger className={inputWrapperClass}><SelectValue placeholder="খাওয়ার সময়" /></SelectTrigger></FormControl> <SelectContent>{intakeTimeOptionsT1.map(o => <SelectItem key={`t1t${o}`} value={o}>{o}</SelectItem>)}</SelectContent></Select> <FormMessage /> </FormItem>
                          )} />
                        </div>
                      </Card>
                    )}

                    {currentTemplate === 'template2' && (
                      <Card className="p-4 bg-muted/50 backdrop-blur-md">
                         <CardDescription className="mb-3 text-sm font-medium text-primary">টেমপ্লেট ২: ঝাঁকি ও মিশ্রণ</CardDescription>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField control={form.control} name="shakesT2" render={({ field }) => (
                              <FormItem> <FormLabel>কতবার ঝাঁকি</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger className={inputWrapperClass}><SelectValue placeholder="ঝাঁকি" /></SelectTrigger></FormControl> <SelectContent>{shakesOptions.map(o => <SelectItem key={`t2s${o}`} value={o}>{o} বার</SelectItem>)}</SelectContent></Select> <FormMessage /> </FormItem>
                          )} />
                          <FormField control={form.control} name="dropsT2" render={({ field }) => (
                              <FormItem> <FormLabel>ঔষধের ফোঁটা (মিশ্রণে)</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger className={inputWrapperClass}><SelectValue placeholder="ফোঁটা" /></SelectTrigger></FormControl> <SelectContent>{dropsOptions.map(o => <SelectItem key={`t2d${o}`} value={o}>{o} ফোঁটা</SelectItem>)}</SelectContent></Select> <FormMessage /> </FormItem>
                          )} />
                          <FormField control={form.control} name="intervalT2" render={({ field }) => (
                              <FormItem> <FormLabel>কতক্ষণ পর (মিশ্রণ)</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger className={inputWrapperClass}><SelectValue placeholder="সময়" /></SelectTrigger></FormControl> <SelectContent>{intervalOptions.map(o => <SelectItem key={`t2i${o}`} value={o}>{o} ঘন্টা</SelectItem>)}</SelectContent></Select> <FormMessage /> </FormItem>
                          )} />
                          <FormField control={form.control} name="intakeTimeT2" render={({ field }) => (
                              <FormItem> <FormLabel>কখন খাবেন (মিশ্রণ)</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger className={inputWrapperClass}><SelectValue placeholder="খাওয়ার সময়" /></SelectTrigger></FormControl> <SelectContent>{intakeTimeOptionsT2.map(o => <SelectItem key={`t2t${o}`} value={o}>{o}</SelectItem>)}</SelectContent></Select> <FormMessage /> </FormItem>
                          )} />
                        </div>
                      </Card>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-end items-center gap-3 border-t pt-6">
                    <Button type="submit" className="w-full sm:w-auto">
                      <Printer className="mr-2 h-4 w-4" /> প্রিন্ট করুন
                    </Button>
                    {selectedPatient && form.getValues('visitId') && !paymentCompleted && (
                      <Button
                        type="button"
                        onClick={handleOpenPaymentModal}
                        variant="default"
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CreditCard className="mr-2 h-4 w-4" /> পেমেন্ট গ্রহণ করুন
                      </Button>
                    )}
                    {paymentCompleted && (
                      <Button
                          type="button"
                          onClick={handleFinishAndGoToDashboard}
                          variant="default"
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                      >
                          <CheckCircle className="mr-2 h-4 w-4" /> ড্যাশবোর্ডে ফিরে যান
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </div>

          <div className="lg:col-span-1 hide-on-print">
            <Card className="shadow-sm sticky top-6 bg-card/80 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="font-headline text-md flex items-center"><Info className="mr-2 h-5 w-5 text-primary" /> প্রিন্ট প্রিভিউ</CardTitle>
              </CardHeader>
              <CardContent className="p-4 border rounded-md bg-background/50 min-h-[400px] instruction-print-preview-area">
                <div className="print-header-preview text-center mb-3">
                  <h2 className="text-lg font-bold">{clinicSettings?.clinicName || APP_NAME}</h2>
                  {clinicSettings?.clinicAddress && <p className="text-xs">{clinicSettings.clinicAddress}</p>}
                  {clinicSettings?.clinicContact && <p className="text-xs">যোগাযোগ: {(clinicSettings.clinicContact || '')}</p>}
                </div>

                <div className="flex justify-between text-xs mb-1">
                  <span>ক্রমিক নং (স্লিপ): {previewSlipNumber}</span>
                  <span>তারিখ: {currentValues.instructionDate && isValid(currentValues.instructionDate) ? format(currentValues.instructionDate, "dd/MM/yyyy", {locale: bn}) : "..."}</span>
                </div>
                <div className="text-xs mb-1">নামঃ {currentValues.patientName || "রোগীর নাম"}</div>
                {selectedPatient?.diaryNumber && (
                   <div className="text-xs mb-3 leading-tight">
                      ডায়েরি নং: {String(selectedPatient.diaryNumber)}
                  </div>
                )}

                <h3 className="text-center font-semibold text-md my-3 underline">ঔষধ খাওয়ার নিয়মাবলী</h3>

                <p className="text-sm text-center my-4 p-2 border border-dashed border-primary/50 rounded min-h-[60px]">
                  {previewInstructionText || "ঔষধের ফোঁটা, সময় ইত্যাদি নির্বাচন করুন..."}
                </p>

                <h4 className="font-semibold text-sm mt-4 mb-1 text-red-600">পরামর্শঃ</h4>
                <ul className="list-none space-y-1 text-xs">
                  <li className="flex items-start"><span className="text-red-500 mr-1 mt-0.5">*</span> ঔষধ সেবনকালীন পেস্ট সহ যাবতীয় দেশী ও বিদেশী ঔষধি নিষিদ্ধ।</li>
                  <li className="flex items-start"><span className="text-red-500 mr-1 mt-0.5">*</span> ঔষধ সেবনের আধাঘন্টা আগে ও পরে কোন প্রকার খাবার ও পানীয় গ্রহণ করবেন না (সাধারণ জল ব্যতীত)।</li>
                  {clinicSettings?.clinicContact &&
                    <li className="flex items-start"><span className="text-red-500 mr-1 mt-0.5">*</span> জরুরি প্রয়োজনে কল করুনঃ {(clinicSettings.clinicContact || '')} (বিকেল ৫টা থেকে সন্ধ্যা ৭টা পর্যন্ত)।</li>
                  }
                  <li className="flex items-start"><span className="text-red-500 mr-1 mt-0.5">*</span> {currentValues.followUpDays || "..."} দিন পরে আবার সাক্ষাৎ করবেন।</li>
                </ul>
                 <div className="print-footer-preview text-right mt-6">
                      {(clinicSettings?.doctorName || clinicSettings?.bmRegNo) && <p className="text-xs leading-tight">_________________________</p>}
                      {clinicSettings?.doctorName && <p className="text-xs font-medium">{clinicSettings.doctorName}</p>}
                      {clinicSettings?.bmRegNo && <p className="text-xs">{(clinicSettings.bmRegNo || '')}</p>}
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {isPaymentModalOpen && selectedPatient && form.getValues('visitId') && (
          <CreatePaymentSlipModal
            patient={selectedPatient}
            isOpen={isPaymentModalOpen}
            onClose={handlePaymentModalClose}
            visitId={form.getValues('visitId')!}
          />
        )}
      </div>
      <div className="print-only-block print-instruction-container bg-white text-black">
        <div className="print-header">
          <h1 className="font-headline text-2xl font-bold">{clinicSettings?.clinicName || APP_NAME}</h1>
          {clinicSettings?.clinicAddress && <p className="text-sm">{clinicSettings.clinicAddress}</p>}
 {clinicSettings?.clinicContact && <p className="text-sm">যোগাযোগ: {(clinicSettings.clinicContact || '')}</p>}
        </div>

        <div className="meta-info">
          <span>ক্রমিক নং (স্লিপ): {generatedSlipNumber || currentValues.serialNumber || `N/A`}</span>
          <span>তারিখ: {currentValues.instructionDate && isValid(currentValues.instructionDate) ? format(currentValues.instructionDate, "dd MMMM, yyyy", { locale: bn }) : "..."}</span>
        </div>
        <div className="patient-name">নামঃ {currentValues.patientName}</div>
          {selectedPatient?.diaryNumber &&
            <div className="patient-diary-no-print text-xs">
                ডায়েরি নং: {String(selectedPatient.diaryNumber)}
            </div>
        }

        <h2 className="instruction-title">ঔষধ খাওয়ার নিয়মাবলী</h2>

        <p className="main-instruction">
          {generatedInstruction || previewInstructionText}
        </p>

        <div className="advice-section">
          <h3 className="advice-title">পরামর্শঃ</h3>
          <ul className="advice-list">
            <li><span className="text-red-500 mr-1">*</span> ঔষধ সেবনকালীন পেস্ট সহ যাবতীয় দেশী ও বিদেশী ঔষধি নিষিদ্ধ।</li>
            <li><span className="text-red-500 mr-1">*</span> ঔষধ সেবনের আধাঘন্টা আগে ও পরে কোন প্রকার খাবার ও পানীয় গ্রহণ করবেন না (সাধারণ জল ব্যতীত)।</li>
            {clinicSettings?.clinicContact &&
              <li><span className="text-red-500 mr-1">*</span> জরুরি প্রয়োজনে কল করুনঃ {(clinicSettings.clinicContact || '')} (বিকেল ৫টা থেকে সন্ধ্যা ৭টা পর্যন্ত)।</li>
            }
            <li><span className="text-red-500 mr-1">*</span> {currentValues.followUpDays} দিন পরে আবার সাক্ষাৎ করবেন।</li>
          </ul>
        </div>

        <div className="print-footer">
            <div className="signature-area">
                {(clinicSettings?.doctorName || clinicSettings?.bmRegNo) && <p className="signature-line"></p>}
                {clinicSettings?.doctorName && <p>{clinicSettings.doctorName}</p>}
                {clinicSettings?.bmRegNo && <p>{(clinicSettings.bmRegNo || '')}</p>}
            </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default function MedicineInstructionsPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-3">লোড হচ্ছে...</p></div>}>
            <MedicineInstructionsPageContent />
        </Suspense>
    )
}
