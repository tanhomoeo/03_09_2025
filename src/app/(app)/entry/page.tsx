"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { addPatient, updatePatient } from "@/lib/firestoreService";
import type { Patient, CategorizedCaseNotes } from "@/lib/types";
import { PageHeaderCard } from "@/components/shared/PageHeaderCard";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  CalendarIcon,
  Brain,
  ClipboardEdit,
  Lightbulb,
  Save,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, isValid } from "date-fns";
import { bn } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
import type { HandwrittenFormOutput } from "@/ai/flows/handwritten-patient-form-parser-flow";
import { categorizeCaseNotes, CategorizedCaseNotesOutput } from "@/ai/flows/categorize-case-notes-flow";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  CategorizedSymptomsDisplay,
  LABELS as CATEGORY_LABELS,
} from "@/components/repertory/CategorizedSymptomsDisplay";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";


const patientFormSchema = z.object({
  registrationDate: z.date({ required_error: "নিবন্ধনের তারিখ আবশ্যক।" }),
  diaryNumber: z.string().optional(),
  name: z.string().min(1, { message: "পুরো নাম আবশ্যক।" }),
  age: z.string().optional(),
  gender: z
    .enum(["male", "female", "other", ""], {
      errorMap: () => ({ message: "লিঙ্গ নির্বাচন করুন।" }),
    })
    .optional(),
  occupation: z.string().optional(),
  phone: z.string().regex(/^(\+8801|01)\d{9}$/, {
    message: "একটি বৈধ বাংলাদেশী ফোন নম্বর লিখুন।",
  }),
  guardianName: z.string().optional(),
  district: z.string().optional(),
  thanaUpazila: z.string().optional(),
  villageUnion: z.string().optional(),
  caseNotes: z.string().optional(),
  categorizedCaseNotes: z.custom<CategorizedCaseNotes>().optional(),
  keySymptoms: z.array(z.string()).optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

const ScanPatientFormModal = dynamic(
  () => import('@/components/patient/ScanPatientFormModal'),
  {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">ক্যামেরা লোড হচ্ছে...</span></div>
  }
);


function PatientEntryPageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [categorizationError, setCategorizationError] = useState<string | null>(
    null,
  );
  const [categorizationResult, setCategorizationResult] = useState<CategorizedCaseNotesOutput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [savedPatientId, setSavedPatientId] = useState<string | null>(null);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      registrationDate: new Date(),
      diaryNumber: "",
      name: "",
      age: "",
      gender: "",
      occupation: "",
      phone: "",
      guardianName: "",
      district: "",
      thanaUpazila: "",
      villageUnion: "",
      caseNotes: "",
      categorizedCaseNotes: undefined,
      keySymptoms: [],
    },
  });

  const {
    formState: { isDirty },
  } = form;

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue =
          "আপনার করা পরিবর্তনগুলো সেভ করা হয়নি। আপনি কি নিশ্চিত যে আপনি এই পেজটি ছাড়তে চান?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    const urlParams = Object.fromEntries(searchParams.entries());
    if (Object.keys(urlParams).length > 0) {
      Object.entries(urlParams).forEach(([key, value]) => {
        if (value && key in form.getValues()) {
          if (key !== "registrationDate" && key !== "categorizedCaseNotes") {
            form.setValue(key as keyof PatientFormValues, value, {
              shouldDirty: true,
            });
          }
        }
      });
    }
  }, [searchParams, form]);

  const handleDataExtracted = (extractedData: HandwrittenFormOutput) => {
    if (extractedData.name)
      form.setValue("name", extractedData.name, { shouldDirty: true });
    if (extractedData.phone)
      form.setValue("phone", extractedData.phone, { shouldDirty: true });
    if (extractedData.guardianName)
      form.setValue("guardianName", extractedData.guardianName, {
        shouldDirty: true,
      });
    if (extractedData.villageUnion)
      form.setValue("villageUnion", extractedData.villageUnion, {
        shouldDirty: true,
      });
    if (extractedData.thanaUpazila)
      form.setValue("thanaUpazila", extractedData.thanaUpazila, {
        shouldDirty: true,
      });
    if (extractedData.district)
      form.setValue("district", extractedData.district, { shouldDirty: true });
    if (extractedData.age)
      form.setValue("age", extractedData.age, { shouldDirty: true });
    
    setIsCameraModalOpen(false);

    toast({
      title: "ফর্ম পূরণ হয়েছে",
      description:
        "AI দ্বারা সনাক্ত করা তথ্য দিয়ে ফর্মটি পূরণ করা হয়েছে। অনুগ্রহ করে যাচাই করে নিন।",
    });
  };

  const handleCategorizeNotes = async () => {
    const caseNotesText = form.getValues("caseNotes");
    if (!caseNotesText || caseNotesText.trim().length < 20) {
      toast({
        title: "অপর্যাপ্ত তথ্য",
        description:
          "বিশ্লেষণ করার জন্য অনুগ্রহ করে রোগীর সমস্যা ও ইতিহাস সম্পর্কে আরও বিস্তারিত লিখুন (কমপক্ষে ২০ অক্ষর)।",
        variant: "destructive",
      });
      return;
    }

    // Stop voice input and sync latest DOM value back into form so text never disappears
    try {
      window.dispatchEvent(new CustomEvent('stop-voice-input'));
    } catch {}
    const el = document.getElementById('caseNotes-textarea') as HTMLTextAreaElement | null;
    if (el && el.value !== form.getValues('caseNotes')) {
      form.setValue('caseNotes', el.value, { shouldDirty: true });
    }

    setIsCategorizing(true);
    setCategorizationError(null);
    setCategorizationResult(null);

    try {
      const result = await categorizeCaseNotes({ caseNotesText });
      setCategorizationResult(result);
      form.setValue("categorizedCaseNotes", result.categorizedNotes, { shouldDirty: true });
      form.setValue("keySymptoms", result.keySymptoms, { shouldDirty: true });
      toast({
        title: "লক্ষণ শ্রেণীবিভাগ সফল হয়েছে",
        description:
          "AI দ্বারা রোগীর লক্ষণগুলো সফলভাবে ৭টি ক্যাটাগরিতে ভাগ করা হয়েছে এবং গুরুত্বপূর্ণ লক্ষণগুলো চিহ্নিত করা হয়েছে।",
      });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "একটি অজানা ত্রুটি ঘটেছে।";
        setCategorizationError(errorMessage);
        toast({
            title: "বিশ্���েষণ ব্যর্থ হয়েছে",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
      setIsCategorizing(false);
    }
  }; 

  const handleSaveBasicInfo = async () => {
    const basicInfoFields: (keyof PatientFormValues)[] = [
        "registrationDate", "diaryNumber", "name", "age", "gender", "occupation", 
        "phone", "guardianName", "district", "thanaUpazila", "villageUnion"
    ];
    const triggerResult = await form.trigger(basicInfoFields);

    if (!triggerResult) {
        toast({ title: "ফর্ম যাচাইকরণ ব্যর্থ", description: "অনুগ্রহ করে সকল আবশ্যক তথ্য পূরণ করুন।", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    const data = form.getValues();

    try {
        const patientDataPayload: Partial<Patient> = {
            name: data.name, phone: data.phone, registrationDate: data.registrationDate.toISOString(),
            age: data.age || undefined, gender: (data.gender as Patient['gender']) || undefined, 
            occupation: data.occupation || undefined, 
            guardianName: data.guardianName || undefined, district: data.district || undefined, 
            thanaUpazila: data.thanaUpazila || undefined, villageUnion: data.villageUnion || undefined,
            diaryNumber: data.diaryNumber || undefined,
        };

        let patientId = savedPatientId;
        if (patientId) {
            await updatePatient(patientId, patientDataPayload);
        } else {
            const newPatientId = await addPatient(patientDataPayload);
            setSavedPatientId(newPatientId);
            patientId = newPatientId;
        }

        toast({
            title: "সাধারণ তথ্য সংরক্ষিত হয়েছে",
            description: `${data.name}-এর প্রাথমিক তথ্য সফলভাবে সেভ করা হয়েছে। এখন আপনি কেস হিস্ট্রি যোগ করতে পারেন।`,
        });
        window.dispatchEvent(new CustomEvent('firestoreDataChange'));

    } catch (error) {
        console.error("Failed to save basic patient info:", error);
        toast({ title: "সংরক্ষণ ব্যর্থ", description: `সাধারণ তথ্য সেভ করার সময় একটি ত্রুটি ঘটেছে।`, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const onSubmit: SubmitHandler<PatientFormValues> = async (data) => {
    setIsSubmittingFinal(true);
    try {
        let patientId = savedPatientId;
        
        const fullPatientData: Partial<Patient> = {
            name: data.name, phone: data.phone, registrationDate: data.registrationDate.toISOString(),
            age: data.age || undefined, gender: (data.gender as Patient['gender']) || undefined,
            occupation: data.occupation || undefined, 
            guardianName: data.guardianName || undefined, district: data.district || undefined,
            thanaUpazila: data.thanaUpazila || undefined, villageUnion: data.villageUnion || undefined,
            diaryNumber: data.diaryNumber || undefined, caseNotes: data.caseNotes || undefined,
            categorizedCaseNotes: data.categorizedCaseNotes || undefined,
        };

        if (patientId) {
            await updatePatient(patientId, fullPatientData);
        } else {
            patientId = await addPatient(fullPatientData);
        }
        
        toast({
            title: "রোগী নিবন্ধিত",
            description: `${data.name} সফলভাবে নিবন্ধিত হয়েছেন। আইডি: ${patientId}`,
        });
        
        form.reset(); 
        setCategorizationResult(null);
        setSavedPatientId(null);
        window.dispatchEvent(new CustomEvent('firestoreDataChange'));

    } catch (error) {
        console.error("Failed to register patient:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ title: "নিবন্ধন ব্যর্থ হয়েছে", description: `রোগী নিবন্ধন করার সময় একটি ত্রুটি ঘটেছে: ${errorMessage}`, variant: "destructive" });
    } finally {
        setIsSubmittingFinal(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Form {...form}>
          <PageHeaderCard
            title="নতুন রোগী নিবন্ধন"
            description="নতুন রোগী নিবন্ধন করতে নিচের বিবরণগুলি পূরণ করুন।"
            className="bg-gradient-to-br from-violet-100 to-indigo-200 dark:from-violet-900/30 dark:to-indigo-900/30"
          />
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="shadow-lg border-border/30 bg-card/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="font-headline text-lg">
                  রোগীর সাধারণ তথ্য
                </CardTitle>
                <CardDescription>
                  রোগীর ব্যক্তিগত এবং যোগাযোগের তথ্য লিখুন।
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="registrationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          নিবন্ধনের তারিখ{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
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
                                date > new Date() ||
                                date < new Date("1900-01-01")
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
                      <FormItem>
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
                  <div className="hidden lg:block"></div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-3">
                        <FormLabel>
                          পুরো নাম <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="পুরো নাম লিখুন"
                            {...field}
                            id="patientNameEntry"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>বয়স</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="বয়স লিখুন"
                            {...field}
                            type="text"
                            id="patientAgeEntry"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>লিঙ্গ</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue=""
                        >
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
                      <FormItem>
                        <FormLabel>রোগীর পেশা (ঐচ্ছিক)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue=""
                        >
                          <FormControl>
                            <SelectTrigger id="patientOccupationEntry">
                              <SelectValue placeholder="পেশা নির্বাচন করুন" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="student">
                              ছাত্র/ছাত্রী
                            </SelectItem>
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
                      <FormItem>
                        <FormLabel>
                          ফোন নম্বর <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="যেমন: 01XXXXXXXXX"
                            {...field}
                            id="patientPhoneEntry"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guardianName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>অভিভাবক (পিতা/স্বামী)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="অভিভাবকের নাম লিখুন"
                            {...field}
                            id="guardianNameEntry"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="villageUnion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>গ্রাম / ইউনিয়ন (ঐচ্ছিক)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="গ্রাম বা ইউনিয়ন লিখুন"
                            {...field}
                            id="villageUnionEntry"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="thanaUpazila"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>থানা / উপজেলা (ঐচ্ছিক)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="থানা বা উপজেলা লিখুন"
                            {...field}
                            id="thanaUpazilaEntry"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>জেলা (ঐচ্ছিক)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="জেলা লিখুন"
                            {...field}
                            id="districtEntry"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
               <CardFooter className="flex justify-end border-t pt-6">
                 <Button type="button" onClick={handleSaveBasicInfo} disabled={isSubmitting} className="min-w-[180px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:brightness-105 transition-all">
                    {isSubmitting ? <LoadingSpinner variant="button" /> : <Save className="mr-2 h-4 w-4" />}
                    সাধারণ তথ্য সংরক্ষণ করুন
                 </Button>
               </CardFooter>
            </Card>

            <Card className="shadow-lg border-border/30 bg-card/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="font-headline text-lg">
                  রোগীর সমস্যা ও বিশ্লেষণ
                </CardTitle>
                <CardDescription>
                  এখানে রোগীর সকল সমস্যা, মানসিক অবস্থা, রোগের কারণ, পূর্ব ও
                  পারিবারিক ইতিহাস ইত্যাদি বিস্তারিতভাবে লিখুন।
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="caseNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="caseNotes-textarea">
                        রোগীর সমস্যা, ইতিহাস এবং অন্যান্য লক্ষণ
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          id="caseNotes-textarea"
                          placeholder="রোগীর সকল সমস্যা বিস্তারিতভাবে এখানে লিখুন..."
                          {...field}
                          rows={6}
                          className="text-base"
                        />
                      </FormControl>
                       <p className="text-xs text-muted-foreground pt-1">
                          টিপস: ভয়েস টাইপিংয়ের জন্য কীবোর্ডের &apos;Control&apos; কী চেপে ধরে রাখুন।
                       </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 rounded-lg border bg-card/80 p-4 shadow-inner">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-base text-primary flex items-center">
                        <Brain className="w-5 h-5 mr-2" />
                        AI দ্বারা লক্ষণ বিশ্লেষণ
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        উপরের টেক্সটবক্সে লেখা বিবরণ থেকে স্বয়ংক্রিয়ভাবে
                        লক্ষণগুলো ৭টি ক্যাটাগরিতে ভাগ করুন।
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleCategorizeNotes}
                      disabled={isCategorizing}
                      className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md hover:shadow-lg hover:brightness-105 transition-all"
                    >
                      {isCategorizing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ClipboardEdit className="mr-2 h-4 w-4" />
                      )}
                      {isCategorizing
                        ? "বিশ্লেষণ চলছে..."
                        : "নোট বিশ্লেষণ করুন"}
                    </Button>
                  </div>

                  {categorizationError && (
                    <Alert variant="destructive">
                      <AlertTitle>ত্রুটি</AlertTitle>
                      <AlertDescription>{categorizationError}</AlertDescription>
                    </Alert>
                  )}

                  {categorizationResult && categorizationResult.categorizedNotes && (
                    <div className="space-y-4 pt-4 mt-4 border-t">
                      {categorizationResult.keySymptoms && categorizationResult.keySymptoms.length > 0 && (
                        <Alert className="bg-yellow-100/70 border-yellow-300/80 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800/50 dark:text-yellow-200">
                          <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <AlertTitle className="font-bold text-yellow-800 dark:text-yellow-300">মূল লক্ষণসমূহ</AlertTitle>
                          <AlertDescription className="text-yellow-700 dark:text-yellow-300/90">
                            AI দ্বারা চিহ্নিত প্রধান লক্ষণগুলো নিচে দেওয়া হলো:
                            <ul className="list-disc pl-5 mt-1">
                              {categorizationResult.keySymptoms.map((symptom, i) => (
                                <li key={i}>{symptom}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                      <CategorizedSymptomsDisplay
                        symptoms={categorizationResult.categorizedNotes}
                        labels={CATEGORY_LABELS}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
               <CardFooter className="flex justify-end border-t pt-6">
                 <Button
                    type="submit"
                    disabled={isSubmittingFinal || isSubmitting}
                    className="min-w-[180px] bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold tracking-wider hover:brightness-110 active:brightness-90 transition-all duration-200 shadow-lg"
                  >
                    {isSubmittingFinal ? (
                      <LoadingSpinner variant="button" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    বিশ্লেষণসহ ন��বন্ধন করুন
                  </Button>
               </CardFooter>
            </Card>

          </form>
        </Form>
      </div>

      {isCameraModalOpen && (
        <ScanPatientFormModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          onDataExtracted={handleDataExtracted}
        />
      )}
    </>
  );
}

export default function PatientEntryPage() {
    return (
        <Suspense fallback={<LoadingSpinner variant="page" label="নিবন্ধন পৃষ্ঠা লোড হচ্ছে..." />}>
            <PatientEntryPageContent />
        </Suspense>
    )
}
