
'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addPatient } from '@/lib/firestoreService';
import type { Patient } from '@/lib/types';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { Loader2, CalendarIcon, UserPlus, Camera } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format, isValid } from 'date-fns';
import { bn } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import type { HandwrittenFormOutput } from '@/ai/flows/handwritten-patient-form-parser-flow';


const ScanPatientFormModal = dynamic(() => 
  import('@/components/patient/ScanPatientFormModal').then((mod) => mod.ScanPatientFormModal),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">ক্যামেরা মডাল লোড হচ্ছে...</span>
      </div>
    ),
  }
);


const patientFormSchema = z.object({
  registrationDate: z.date({ required_error: "নিবন্ধনের তারিখ আবশ্যক।" }),
  diaryNumber: z.string().optional(),
  name: z.string().min(1, { message: "পুরো নাম আবশ্যক।" }),
  age: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', ''], { errorMap: () => ({ message: "লিঙ্গ নির্বাচন করুন।" }) }).optional(),
  occupation: z.string().optional(),
  phone: z.string().regex(/^(\+8801|01)\d{9}$/, { message: "একটি বৈধ বাংলাদেশী ফোন নম্বর লিখুন।" }),
  guardianRelation: z.enum(['father', 'husband', ''], { errorMap: () => ({ message: "অভিভাবকের সম্পর্ক নির্বাচন করুন।" }) }).optional(),
  guardianName: z.string().optional(),
  district: z.string().optional(),
  thanaUpazila: z.string().optional(),
  villageUnion: z.string().optional(),

  // Case History TextAreas
  chiefComplaints: z.string().optional(),
  patientHistory: z.string().optional(),
  familyHistory: z.string().optional(),
  mentalState: z.string().optional(),

  // Generalities
  thermalReaction: z.array(z.string()).optional(),
  thirst: z.enum(['normal', 'less', 'more', 'none', ''], { errorMap: () => ({ message: "পিপাসা নির্বাচন করুন।" }) }).optional(),
  sleep: z.enum(['normal', 'less', 'more', 'none', ''], { errorMap: () => ({ message: "ঘুম নির্বাচন করুন।" }) }).optional(),
  foodAndCraving: z.string().optional(), // Kept as string for detailed entry
  perspiration: z.enum(['normal', 'less', 'more', 'none', ''], { errorMap: () => ({ message: "ঘাম নির্বাচন করুন।" }) }).optional(),
  likesDislikes: z.string().optional(),

  // Excretions
  stoolDetails: z.string().optional(),
  urineDetails: z.string().optional(),
  mensesDetails: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

const thermalOptions = [
  { id: 'chilly', label: 'শীতকাতর' },
  { id: 'hot', label: 'গরম কাতর' },
] as const;

const symptomLevelOptions: { value: 'normal' | 'less' | 'more' | 'none'; label: string }[] = [
    { value: 'normal', label: 'স্বাভাবিক' },
    { value: 'less', label: 'কম' },
    { value: 'more', label: 'বেশি' },
    { value: 'none', label: 'নাই' },
];

export default function PatientEntryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      registrationDate: undefined,
      diaryNumber: '',
      name: '',
      age: '',
      gender: '',
      occupation: '',
      phone: '',
      guardianRelation: '',
      guardianName: '',
      district: '',
      thanaUpazila: '',
      villageUnion: '',
      chiefComplaints: '',
      patientHistory: '',
      familyHistory: '',
      mentalState: '',
      thermalReaction: [],
      thirst: 'normal',
      sleep: 'normal',
      foodAndCraving: '',
      perspiration: 'normal',
      likesDislikes: '',
      stoolDetails: '',
      urineDetails: '',
      mensesDetails: '',
    },
  });
  
  const { formState: { isDirty } } = form;

  useEffect(() => {
    if (!form.getValues('registrationDate')) {
      form.setValue('registrationDate', new Date());
    }
  }, [form]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = 'আপনার করা পরিবর্তনগুলো সেভ করা হয়নি। আপনি কি নিশ্চিত যে আপনি এই পেজটি ছাড়তে চান?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);
  
  const handleDataExtracted = (extractedData: HandwrittenFormOutput) => {
    if (extractedData.name) form.setValue('name', extractedData.name);
    if (extractedData.phone) form.setValue('phone', extractedData.phone);
    if (extractedData.guardianName) form.setValue('guardianName', extractedData.guardianName);
    if (extractedData.villageUnion) form.setValue('villageUnion', extractedData.villageUnion);
    if (extractedData.thanaUpazila) form.setValue('thanaUpazila', extractedData.thanaUpazila);
    if (extractedData.district) form.setValue('district', extractedData.district);
    if (extractedData.age) form.setValue('age', extractedData.age);

    toast({
      title: "ফর্ম পূরণ হয়েছে",
      description: "AI দ্বারা সনাক্ত করা তথ্য দিয়ে ফর্মটি পূরণ করা হয়েছে। অনুগ্রহ করে যাচাই করে নিন।",
    });
    setIsCameraModalOpen(false);
  };

  const onSubmit: SubmitHandler<PatientFormValues> = async (data) => {
    try {
      const newPatientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.name,
        phone: data.phone,
        registrationDate: data.registrationDate.toISOString(),
        age: data.age,
        gender: data.gender as Patient['gender'] || undefined,
        occupation: data.occupation,
        guardianRelation: data.guardianRelation as Patient['guardianRelation'] || undefined,
        guardianName: data.guardianName,
        district: data.district,
        thanaUpazila: data.thanaUpazila,
        villageUnion: data.villageUnion,
        diaryNumber: data.diaryNumber || undefined,
        chiefComplaints: data.chiefComplaints,
        patientHistory: data.patientHistory,
        familyHistory: data.familyHistory,
        mentalState: data.mentalState,
        thermalReaction: data.thermalReaction as ('chilly' | 'hot')[] | undefined,
        thirst: data.thirst as Patient['thirst'],
        sleep: data.sleep as Patient['sleep'],
        foodAndCraving: data.foodAndCraving,
        perspiration: data.perspiration as Patient['perspiration'],
        likesDislikes: data.likesDislikes,
        stoolDetails: data.stoolDetails,
        urineDetails: data.urineDetails,
        mensesDetails: data.mensesDetails,
      };

      const patientId = await addPatient(newPatientData);

      toast({
        title: 'রোগী নিবন্ধিত',
        description: `${data.name} সফলভাবে নিবন্ধিত হয়েছেন। ডায়েরি নং: ${newPatientData.diaryNumber || 'N/A'}`,
      });

      form.reset();
      router.push(`${ROUTES.PATIENT_SEARCH}?q=${newPatientData.phone}`);
      window.dispatchEvent(new CustomEvent('firestoreDataChange'));

    } catch (error: any) {
      console.error('Failed to register patient:', error);
      let errorMessage = "An unknown error occurred during patient registration.";
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else {
            errorMessage = String(error);
        }
      toast({
        title: 'নিবন্ধন ব্যর্থ হয়েছে',
        description: `রোগী নিবন্ধন করার সময় একটি ত্রুটি ঘটেছে: ${errorMessage}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
    <div className="space-y-6">
      <Form {...form}>
        <PageHeaderCard
          title="নতুন রোগী নিবন্ধন"
          description="নতুন রোগী নিবন্ধন করতে নিচের বিবরণগুলি পূরণ করুন।"
          className="bg-gradient-to-br from-blue-100 to-violet-200 dark:from-blue-900/30 dark:to-violet-900/30"
          titleClassName="text-blue-900 dark:text-blue-300 font-bold"
          actions={
            <Button
              type="button"
              onClick={() => setIsCameraModalOpen(true)}
              className="h-12 w-12 p-0 rounded-full bg-gradient-to-br from-green-400 to-teal-500 text-white shadow-[0_5px_15px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
              aria-label="ফর্ম স্ক্যান করুন"
            >
              <Camera className="h-5 w-5" />
            </Button>
          }
        />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="shadow-md">
            <Tabs defaultValue="generalInfo" className="w-full">
               <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle className="font-headline text-lg">রোগীর তথ্য</CardTitle>
                            <CardDescription>প্রয়োজন অনুযায়ী তথ্য যুক্ত করতে বিভিন্ন ট্যাবে যান।</CardDescription>
                        </div>
                        <TabsList className="grid h-auto w-full md:w-auto grid-cols-2 md:grid-cols-4 gap-2 rounded-lg bg-transparent p-0">
                            <TabsTrigger value="generalInfo" className="h-auto py-2 px-3 rounded-lg text-xs md:text-sm font-semibold shadow-neumorphic-outset data-[state=active]:shadow-neumorphic-inset data-[state=active]:text-primary data-[state=active]:ring-2 data-[state=active]:ring-primary/70 transition-all text-slate-800 dark:text-slate-200 bg-gradient-to-r from-sky-100 to-blue-200 hover:brightness-105 data-[state=active]:brightness-110">
                                সাধারণ তথ্য
                            </TabsTrigger>
                            <TabsTrigger value="complaints" className="h-auto py-2 px-3 rounded-lg text-xs md:text-sm font-semibold shadow-neumorphic-outset data-[state=active]:shadow-neumorphic-inset data-[state=active]:text-primary data-[state=active]:ring-2 data-[state=active]:ring-primary/70 transition-all text-slate-800 dark:text-slate-200 bg-gradient-to-r from-violet-100 to-indigo-200 hover:brightness-105 data-[state=active]:brightness-110">
                                সমস্যা ও ইতিহাস
                            </TabsTrigger>
                            <TabsTrigger value="generalities" className="h-auto py-2 px-3 rounded-lg text-xs md:text-sm font-semibold shadow-neumorphic-outset data-[state=active]:shadow-neumorphic-inset data-[state=active]:text-primary data-[state=active]:ring-2 data-[state=active]:ring-primary/70 transition-all text-slate-800 dark:text-slate-200 bg-gradient-to-r from-teal-100 to-green-200 hover:brightness-105 data-[state=active]:brightness-110">
                                সর্বদৈহিক লক্ষণ
                            </TabsTrigger>
                            <TabsTrigger value="excretions" className="h-auto py-2 px-3 rounded-lg text-xs md:text-sm font-semibold shadow-neumorphic-outset data-[state=active]:shadow-neumorphic-inset data-[state=active]:text-primary data-[state=active]:ring-2 data-[state=active]:ring-primary/70 transition-all text-slate-800 dark:text-slate-200 bg-gradient-to-r from-amber-100 to-orange-200 hover:brightness-105 data-[state=active]:brightness-110">
                                মল-মূত্র ও স্রাব
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </CardHeader>
                <CardContent className="mt-2">
                    <TabsContent value="generalInfo" className="mt-0">
                       <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-1 md:grid-cols-3">
                         <FormField
                            control={form.control}
                            name="registrationDate"
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>নিবন্ধনের তারিখ <span className="text-destructive">*</span></FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant={"outline"}
                                       className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                                      {field.value && isValid(field.value) ? (
                                        format(field.value, "PPP", { locale: bn })
                                      ) : (
                                        <span>একটি তারিখ নির্বাচন করুন</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                      locale={bn}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="diaryNumber"
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>ডায়েরি নম্বর</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="যেমন: F/123, CH/456"
                                    {...field}
                                    type="text"
                                    id="patientDiaryNumberEntry"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="md:col-span-1 hidden md:block"></div>

                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="md:col-span-3">
                                <FormLabel>পুরো নাম <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                  <Input placeholder="পুরো নাম লিখুন" {...field} id="patientNameEntry" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>বয়স</FormLabel>
                                <FormControl>
                                  <Input placeholder="বয়স লিখুন" {...field} type="text" id="patientAgeEntry" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>লিঙ্গ</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                                  <FormControl>
                                    <SelectTrigger id="patientGenderEntry">
                                      <SelectValue placeholder="লিঙ্গ নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="male">পুরুষ</SelectItem>
                                    <SelectItem value="female">মহিলা</SelectItem>
                                    <SelectItem value="other">অন্যান্য</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="occupation"
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>রোগীর পেশা (ঐচ্ছিক)</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                                  <FormControl>
                                    <SelectTrigger id="patientOccupationEntry">
                                      <SelectValue placeholder="পেশা নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="student">ছাত্র/ছাত্রী</SelectItem>
                                    <SelectItem value="housewife">গৃহিণী</SelectItem>
                                    <SelectItem value="service">চাকুরীজীবী</SelectItem>
                                    <SelectItem value="business">ব্যবসায়ী</SelectItem>
                                    <SelectItem value="farmer">কৃষক</SelectItem>
                                    <SelectItem value="labourer">শ্রমিক</SelectItem>
                                    <SelectItem value="unemployed">বেকার</SelectItem>
                                    <SelectItem value="retired">অবসরপ্রাপ্ত</SelectItem>
                                    <SelectItem value="other">অন্যান্য</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>ফোন নম্বর <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="যেমন: 01XXXXXXXXX" {...field} id="patientPhoneEntry" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="guardianRelation"
                            render={({ field }) => (
                              <FormItem className="space-y-1 md:col-span-1">
                                <FormLabel>অভিভাবকের সম্পর্ক</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value || ''}
                                    className="flex space-x-3 pt-1 items-center h-10"
                                    id="patientGuardianRelationEntry"
                                  >
                                    <FormItem className="flex items-center space-x-1.5 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="father" />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">পিতা</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-1.5 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="husband" />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">স্বামী</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="guardianName"
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>অভিভাবকের নাম (ঐচ্ছিক)</FormLabel>
                                <FormControl>
                                  <Input placeholder="অভিভাবকের নাম লিখুন" {...field} id="guardianNameEntry" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="villageUnion"
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>গ্রাম / ইউনিয়ন (ঐচ্ছিক)</FormLabel>
                                <FormControl>
                                  <Input placeholder="গ্রাম বা ইউনিয়ন লিখুন" {...field} id="villageUnionEntry" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="thanaUpazila"
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>থানা / উপজেলা (ঐচ্ছিক)</FormLabel>
                                <FormControl>
                                  <Input placeholder="থানা বা উপজেলা লিখুন" {...field} id="thanaUpazilaEntry" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="district"
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>জেলা (ঐচ্ছিক)</FormLabel>
                                <FormControl>
                                  <Input placeholder="জেলা লিখুন" {...field} id="districtEntry" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                       </div>
                    </TabsContent>
                    <TabsContent value="complaints" className="mt-0">
                        <div className="space-y-4 p-1">
                           <FormField control={form.control} name="chiefComplaints" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>বর্তমান প্রধান সমস্যা</FormLabel>
                                  <FormControl><Textarea placeholder="রোগীর বর্তমান প্রধান সমস্যাগুলো বিস্তারিতভাবে লিখুন..." {...field} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          <FormField control={form.control} name="patientHistory" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>রোগীর পূর্ব ইতিহাস</FormLabel>
                                  <FormControl><Textarea placeholder="রোগীর অতীত অসুস্থতা, চিকিৎসা এবং অন্যান্য প্রাসঙ্গিক ইতিহাস লিখুন..." {...field} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          <FormField control={form.control} name="familyHistory" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>পারিবারিক রোগের ইতিহাস</FormLabel>
                                  <FormControl><Textarea placeholder="পরিবারের অন্য সদস্যদের উল্লেখযোগ্য রোগের ইতিহাস (যেমন: ডায়াবেটিস, ক্যান্সার) লিখুন..." {...field} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                        </div>
                    </TabsContent>
                    <TabsContent value="generalities" className="mt-0">
                        <div className="space-y-4 p-1">
                           <FormField control={form.control} name="mentalState" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>বর্তমান মানসিক অবস্থা</FormLabel>
                                  <FormControl><Textarea placeholder="রোগীর মানসিক অবস্থা, যেমন: উদ্বেগ, বিষণ্ণতা, মেজাজ ইত্যাদি সম্পর্কে লিখুন..." {...field} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          <Accordion type="single" collapsible className="w-full" defaultValue="generalities">
                              <AccordionItem value="generalities">
                                  <AccordionTrigger>অন্যান্য সর্বদৈহিক লক্ষণ</AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-4 p-1">
                                      <FormField control={form.control} name="thermalReaction" render={() => (
                                          <FormItem>
                                              <FormLabel>কাতরতা</FormLabel>
                                              <div className="flex items-center space-x-4 pt-2">
                                                  {thermalOptions.map((option) => (
                                                      <FormField key={option.id} control={form.control} name="thermalReaction" render={({ field }) => (
                                                          <FormItem key={option.id} className="flex flex-row items-center space-x-2 space-y-0">
                                                              <FormControl>
                                                                  <Checkbox
                                                                      checked={field.value?.includes(option.id)}
                                                                      onCheckedChange={(checked) => {
                                                                          return checked
                                                                          ? field.onChange([...(field.value || []), option.id])
                                                                          : field.onChange(field.value?.filter((value) => value !== option.id));
                                                                      }}
                                                                  />
                                                              </FormControl>
                                                              <FormLabel className="font-normal text-sm">{option.label}</FormLabel>
                                                          </FormItem>
                                                      )} />
                                                  ))}
                                              </div>
                                              <FormMessage />
                                          </FormItem>
                                      )} />
                                      <FormField control={form.control} name="thirst" render={({ field }) => (
                                          <FormItem className="space-y-3">
                                              <FormLabel>পিপাসা</FormLabel>
                                              <FormControl>
                                                <RadioGroup onValueChange={field.onChange} value={field.value} defaultValue="normal" className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                    {symptomLevelOptions.map(opt => (
                                                        <FormItem key={opt.value} className="flex items-center space-x-2 space-y-0">
                                                            <FormControl><RadioGroupItem value={opt.value} /></FormControl>
                                                            <FormLabel className="font-normal">{opt.label}</FormLabel>
                                                        </FormItem>
                                                    ))}
                                                </RadioGroup>
                                              </FormControl>
                                              <FormMessage />
                                          </FormItem>
                                      )} />
                                      <FormField control={form.control} name="sleep" render={({ field }) => (
                                          <FormItem className="space-y-3">
                                              <FormLabel>ঘুম</FormLabel>
                                               <FormControl>
                                                <RadioGroup onValueChange={field.onChange} value={field.value} defaultValue="normal" className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                    {symptomLevelOptions.map(opt => (
                                                        <FormItem key={opt.value} className="flex items-center space-x-2 space-y-0">
                                                            <FormControl><RadioGroupItem value={opt.value} /></FormControl>
                                                            <FormLabel className="font-normal">{opt.label}</FormLabel>
                                                        </FormItem>
                                                    ))}
                                                </RadioGroup>
                                              </FormControl>
                                              <FormMessage />
                                          </FormItem>
                                      )} />
                                       <FormField control={form.control} name="perspiration" render={({ field }) => (
                                          <FormItem className="space-y-3">
                                              <FormLabel>ঘাম</FormLabel>
                                                <FormControl>
                                                <RadioGroup onValueChange={field.onChange} value={field.value} defaultValue="normal" className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                    {symptomLevelOptions.map(opt => (
                                                        <FormItem key={opt.value} className="flex items-center space-x-2 space-y-0">
                                                            <FormControl><RadioGroupItem value={opt.value} /></FormControl>
                                                            <FormLabel className="font-normal">{opt.label}</FormLabel>
                                                        </FormItem>
                                                    ))}
                                                </RadioGroup>
                                              </FormControl>
                                              <FormMessage />
                                          </FormItem>
                                      )} />
                                      <FormField control={form.control} name="foodAndCraving" render={({ field }) => (
                                          <FormItem><FormLabel>পছন্দের খাদ্য ও বিশেষ ইচ্ছা</FormLabel><FormControl><Input placeholder="কি খেতে ভালোবাসে, লবণ বা মিষ্টির প্রতি আকর্ষণ..." {...field} /></FormControl><FormMessage /></FormItem>
                                      )} />
                                      <FormField control={form.control} name="likesDislikes" render={({ field }) => (
                                          <FormItem><FormLabel>পছন্দ / অপছন্দ</FormLabel><FormControl><Input placeholder="রোগীর সাধারণ পছন্দ বা অপছন্দের বিষয়..." {...field} /></FormControl><FormMessage /></FormItem>
                                      )} />
                                    </div>
                                  </AccordionContent>
                              </AccordionItem>
                          </Accordion>
                        </div>
                    </TabsContent>
                    <TabsContent value="excretions" className="mt-0">
                        <div className="space-y-4 p-1">
                            <FormField control={form.control} name="stoolDetails" render={({ field }) => (
                                <FormItem><FormLabel>পায়খানা সংক্রান্ত বিবরণ</FormLabel><FormControl><Textarea placeholder="যেমন: দিনে বা রাতে কয়বার, ধরন, পরিমাণ, গন্ধ, রঙ, পেটে ব্যথা, আমাশয় ইত্যাদি..." {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="urineDetails" render={({ field }) => (
                                <FormItem><FormLabel>প্রস্রাব সংক্রান্ত বিবরণ</FormLabel><FormControl><Textarea placeholder="যেমন: দিনে বা রাতে কয়বার, পরিমাণ, গন্ধ, রঙ, জ্বালাপোড়া ইত্যাদি..." {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="mensesDetails" render={({ field }) => (
                                <FormItem><FormLabel>স্রাব সংক্রান্ত বিবরণ (মহিলাদের জন্য)</FormLabel><FormControl><Textarea placeholder="যেমন: নিয়মিত হয় কিনা, পরিমাণ, রঙ, গন্ধ, ব্যথা বা অন্যান্য সমস্যা..." {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </TabsContent>
                </CardContent>
            </Tabs>
          </Card>
          
          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting} 
              className="min-w-[150px] bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold tracking-wider hover:brightness-110 active:brightness-90 transition-all duration-200"
            >
                {form.formState.isSubmitting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> সংরক্ষণ করা হচ্ছে...
                </>
                ) : (
                'নিবন্ধন করুন'
                )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
    <Suspense>
      {isCameraModalOpen && (
        <ScanPatientFormModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          onDataExtracted={handleDataExtracted}
        />
      )}
    </Suspense>
    </>
  );
}

    
