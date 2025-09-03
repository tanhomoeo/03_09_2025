"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type {
  Patient,
  EnrichedVisit,
  CategorizedCaseNotes,
  PatientGender,
} from "@/lib/types";
import {
  getVisitsByPatientId,
  formatDate,
  updatePatient,
  getPrescriptionsByPatientId,
  getPaymentSlipsByPatientId,
  formatCurrency,
  getPaymentMethodLabel,
} from "@/lib/firestoreService";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pencil,
  Save,
  Loader2,
  CalendarDays,
  FileText,
  PackageCheck,
  Truck,
  Banknote,
  ClipboardList,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { isValid, format as formatDateFns } from "date-fns";
import {
  CategorizedSymptomsDisplay,
  LABELS as CATEGORY_LABELS,
} from "@/components/repertory/CategorizedSymptomsDisplay";

export interface PatientDetailsModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "info" | "history";
  onPatientUpdate: (updatedPatient: Patient) => void;
}

type ModalTab = "info" | "case_history" | "history";

const categorizedCaseNotesSchema = z.object({
  physicalSymptoms: z.object({
    general: z.string().optional(),
    gastrointestinal: z.string().optional(),
    urinary: z.string().optional(),
    femaleSpecific: z.string().optional(),
    modalities: z.string().optional(),
    locationAndNature: z.string().optional()
  }).optional(),
  mentalAndEmotionalSymptoms: z.object({
    fear: z.string().optional(),
    sadnessAndDepression: z.string().optional(),
    angerAndMoodSwings: z.string().optional(),
    loneliness: z.string().optional()
  }).optional(),
  excitingCause: z.object({
    weather: z.string().optional(),
    diet: z.string().optional(),
    mentalTrauma: z.string().optional(),
    accidentOrInfection: z.string().optional()
  }).optional(),
  maintainingCause: z.object({
    lifestyle: z.string().optional(),
    mentalStress: z.string().optional(),
    habits: z.string().optional()
  }).optional(),
  familyAndHereditaryHistory: z.object({
    diabetes: z.string().optional(),
    highBloodPressure: z.string().optional(),
    cancer: z.string().optional(),
    allergies: z.string().optional()
  }).optional(),
  pastMedicalHistory: z.object({
    majorIllnesses: z.string().optional(),
    operationsOrTrauma: z.string().optional(),
    chronicIssues: z.string().optional()
  }).optional(),
  pastTreatmentHistory: z.object({
    previousMedication: z.string().optional(),
    treatmentSystems: z.string().optional(),
    otherTreatments: z.string().optional()
  }).optional()
}).optional();


const patientInfoSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .regex(/^(\+8801|01)\d{9}$/, "Valid BD phone number required"),
  villageUnion: z.string().optional(),
  district: z.string().optional(),
  diaryNumber: z.string().optional(),
  age: z.string().optional(),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  occupation: z.string().optional(),
  guardianName: z.string().optional(),
  thanaUpazila: z.string().optional(),
  registrationDate: z
    .string()
    .refine((val) => val === "" || isValid(new Date(val)), {
      message: "নিবন্ধনের তারিখ আবশ্যক অথবা খালি রাখুন।",
    }),
  caseNotes: z.string().optional(),
  categorizedCaseNotes: categorizedCaseNotesSchema,
});
type PatientInfoValues = z.infer<typeof patientInfoSchema>;

export function PatientDetailsModal({
  patient,
  isOpen,
  onClose,
  defaultTab = "info",
  onPatientUpdate,
}: PatientDetailsModalProps) {
  const [visits, setVisits] = useState<EnrichedVisit[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [currentTab, setCurrentTab] = useState<ModalTab>(defaultTab);
  const { toast } = useToast();
  const router = useRouter();

  const patientInfoForm = useForm<PatientInfoValues>({
    resolver: zodResolver(patientInfoSchema),
    defaultValues: {
      name: "",
      phone: "",
      villageUnion: "",
      district: "",
      diaryNumber: "",
      age: "",
      gender: "",
      occupation: "",
      guardianName: "",
      thanaUpazila: "",
      registrationDate: "",
      caseNotes: "",
      categorizedCaseNotes: undefined,
    },
  });

  const getPatientFormValues = useCallback((p: Patient): PatientInfoValues => {
    return {
      name: p.name,
      phone: p.phone,
      villageUnion: p.villageUnion || "",
      district: p.district || "",
      diaryNumber: p.diaryNumber || "",
      age: p.age || "",
      gender: p.gender || "",
      occupation: p.occupation || "",
      guardianName: p.guardianName || "",
      thanaUpazila: p.thanaUpazila || "",
      registrationDate: p.registrationDate
        ? formatDateFns(new Date(p.registrationDate), "yyyy-MM-dd")
        : formatDateFns(new Date(), "yyyy-MM-dd"),
      caseNotes: p.caseNotes || "",
      categorizedCaseNotes: p.categorizedCaseNotes,
    };
  }, []);

  const fetchHistoryData = useCallback(
    async (patientId: string) => {
      if(!patientId) return;
      setIsLoadingVisits(true);
      try {
        const [patientVisits, patientPrescriptions, patientSlips] =
          await Promise.all([
            getVisitsByPatientId(patientId),
            getPrescriptionsByPatientId(patientId),
            getPaymentSlipsByPatientId(patientId),
          ]);

        const enrichedVisitsData = patientVisits
          .map((v) => {
            const visitPrescriptions = patientPrescriptions
              .filter((p) => p.visitId === v.id)
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              );

            const visitSlips = patientSlips.filter((s) => s.visitId === v.id);

            return {
              ...v,
              prescription:
                visitPrescriptions.length > 0 ? visitPrescriptions[0] : null,
              slips: visitSlips,
            };
          })
          .sort(
            (a, b) =>
              new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime(),
          );

        setVisits(enrichedVisitsData);
      } catch (error) {
        console.error("Error fetching history:", error);
        toast({
          title: "ত্রুটি",
          description: "ভিজিটের ইতিহাস আনতে সমস্যা হয়েছে।",
          variant: "destructive",
        });
      } finally {
        setIsLoadingVisits(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    if (isOpen && patient) {
      setCurrentTab(defaultTab);
      patientInfoForm.reset(getPatientFormValues(patient));
      setIsEditingInfo(false);

      if (defaultTab === "history" && visits.length === 0) {
        fetchHistoryData(patient.id);
      }
    }
  }, [isOpen, patient, defaultTab, patientInfoForm, fetchHistoryData, getPatientFormValues, visits.length]);


  const handlePatientInfoSubmit: SubmitHandler<PatientInfoValues> = async (data) => {
    try {
      const updatedPatientData: Partial<Patient> = {
        name: data.name,
        phone: data.phone,
        villageUnion: data.villageUnion || undefined,
        district: data.district || undefined,
        diaryNumber: data.diaryNumber || undefined,
        age: data.age || undefined,
        gender: data.gender as PatientGender,
        occupation: data.occupation || undefined,
        guardianName: data.guardianName || undefined,
        thanaUpazila: data.thanaUpazila || undefined,
        registrationDate: data.registrationDate ? new Date(data.registrationDate).toISOString() : new Date().toISOString(),
        caseNotes: data.caseNotes || undefined,
        categorizedCaseNotes: data.categorizedCaseNotes,
        updatedAt: new Date().toISOString(),
      };

      const success = await updatePatient(patient.id, updatedPatientData);
      if (success) {
        onPatientUpdate({ ...patient, ...updatedPatientData });
        toast({
          title: "রোগীর তথ্য আপডেট হয়েছে",
          description: `${data.name}-এর বিবরণ সংরক্ষণ করা হয়েছে।`,
        });
        setIsEditingInfo(false);
        window.dispatchEvent(new CustomEvent('firestoreDataChange'));
      } else {
        throw new Error("Firestore update failed");
      }
    } catch (error) {
      console.error("Error updating patient:", error);
      toast({
        title: "ত্রুটি",
        description: "রোগীর তথ্য আপডেট করতে ব্যর্থ হয়েছে।",
        variant: "destructive",
      });
    }
  };
  
  const readOnlyInputFieldClass = "bg-muted/50 cursor-default";

  if (!patient) return null;

  const getModalTitle = () => {
    if (currentTab === "info") return "সাধারণ তথ্য";
    if (currentTab === "case_history") return "কেস হিস্ট্রি";
    return "ভিজিটের বিবরণ";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg md:max-w-4xl w-full p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="font-headline text-xl text-primary flex items-center">{getModalTitle()}</DialogTitle>
          <DialogDescription className="text-sm font-body">রোগী: {patient.name}</DialogDescription>
        </DialogHeader>

        <Tabs
          value={currentTab}
          onValueChange={(value) => {
            const newTab = value as ModalTab;
            setCurrentTab(newTab);
            if (newTab === "history" && visits.length === 0) {
              fetchHistoryData(patient.id);
            }
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 sticky top-0 bg-transparent z-10 p-4 border-b rounded-none h-auto gap-2">
            <TabsTrigger value="info" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md p-2 text-sm font-semibold transition-all">সাধারণ তথ্য</TabsTrigger>
            <TabsTrigger value="case_history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md p-2 text-sm font-semibold transition-all">কে�� হিস্ট্রি</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md p-2 text-sm font-semibold transition-all">ভিজিটের বিবরণ</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[55vh] lg:h-[60vh]">
            <div className="p-6">
              <TabsContent value="info">
                 <Form {...patientInfoForm}>
                    <form
                        onSubmit={patientInfoForm.handleSubmit(handlePatientInfoSubmit)}
                        className="space-y-6"
                    >
                        <Card className="bg-card/50">
                            <CardContent className="pt-6">
                                <h3 className="font-headline text-lg mb-4 text-primary">সাধারণ তথ্য</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FormField control={patientInfoForm.control} name="name" render={({ field }) => ( <FormItem><FormLabel>নাম</FormLabel><FormControl><Input {...field} readOnly={!isEditingInfo} className={cn(!isEditingInfo && readOnlyInputFieldClass)} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={patientInfoForm.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>ফোন</FormLabel><FormControl><Input {...field} readOnly={!isEditingInfo} className={cn(!isEditingInfo && readOnlyInputFieldClass)} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={patientInfoForm.control} name="age" render={({ field }) => ( <FormItem><FormLabel>বয়স</FormLabel><FormControl><Input {...field} readOnly={!isEditingInfo} className={cn(!isEditingInfo && readOnlyInputFieldClass)} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={patientInfoForm.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>লিঙ্গ</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={!isEditingInfo}><FormControl><SelectTrigger className={cn(!isEditingInfo && readOnlyInputFieldClass, !isEditingInfo && "cursor-default")}><SelectValue placeholder="লিঙ্গ নির্বাচন করুন" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">পুরুষ</SelectItem><SelectItem value="female">মহিলা</SelectItem><SelectItem value="other">অন্যান্য</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                    <FormField control={patientInfoForm.control} name="guardianName" render={({ field }) => ( <FormItem><FormLabel>অভিভাবক (পিতা/স্বামী)</FormLabel><FormControl><Input {...field} readOnly={!isEditingInfo} className={cn(!isEditingInfo && readOnlyInputFieldClass)} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={patientInfoForm.control} name="occupation" render={({ field }) => ( <FormItem><FormLabel>পেশা</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={!isEditingInfo}><FormControl><SelectTrigger className={cn(!isEditingInfo && readOnlyInputFieldClass, !isEditingInfo && "cursor-default")}><SelectValue placeholder="পেশা নির্বাচন করুন" /></SelectTrigger></FormControl><SelectContent><SelectItem value="student">ছাত্র/ছাত্রী</SelectItem><SelectItem value="housewife">গৃহিণী</SelectItem><SelectItem value="service">চাকুরীজীবী</SelectItem><SelectItem value="business">ব্যবসায়ী</SelectItem><SelectItem value="farmer">কৃষক</SelectItem><SelectItem value="labourer">শ্রমিক</SelectItem><SelectItem value="unemployed">বেকার</SelectItem><SelectItem value="retired">অবসরপ্রাপ্ত</SelectItem><SelectItem value="other">অন্যান্য</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                    <FormField control={patientInfoForm.control} name="villageUnion" render={({ field }) => ( <FormItem><FormLabel>গ্রাম/ইউনিয়ন</FormLabel><FormControl><Input {...field} readOnly={!isEditingInfo} className={cn(!isEditingInfo && readOnlyInputFieldClass)} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={patientInfoForm.control} name="thanaUpazila" render={({ field }) => ( <FormItem><FormLabel>থানা/উপজেলা</FormLabel><FormControl><Input {...field} readOnly={!isEditingInfo} className={cn(!isEditingInfo && readOnlyInputFieldClass)} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={patientInfoForm.control} name="district" render={({ field }) => ( <FormItem><FormLabel>জেলা</FormLabel><FormControl><Input {...field} readOnly={!isEditingInfo} className={cn(!isEditingInfo && readOnlyInputFieldClass)} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={patientInfoForm.control} name="diaryNumber" render={({ field }) => ( <FormItem><FormLabel>ডায়েরি নম্বর</FormLabel><FormControl><Input type="text" {...field} value={field.value || ""} readOnly={!isEditingInfo} className={cn(!isEditingInfo && readOnlyInputFieldClass)} placeholder="যেমন: F/123" /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={patientInfoForm.control} name="registrationDate" render={({ field }) => ( <FormItem><FormLabel>নিবন্ধনের তারিখ</FormLabel><FormControl><Input type="date" {...field} readOnly={!isEditingInfo} className={cn(!isEditingInfo && readOnlyInputFieldClass)} /></FormControl><FormMessage /></FormItem> )} />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <div className="flex justify-end gap-2 mt-4">
                        {isEditingInfo ? (
                            <>
                            <Button type="button" variant="outline" onClick={() => { setIsEditingInfo(false); patientInfoForm.reset(getPatientFormValues(patient)); }}>বাতিল</Button>
                            <Button type="submit" disabled={patientInfoForm.formState.isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                                {patientInfoForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} সংরক্ষণ করুন
                            </Button>
                            </>
                        ) : (
                            <Button type="button" onClick={() => setIsEditingInfo(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
                                <Pencil className="mr-2 h-4 w-4" /> তথ্য সম্পাদনা
                            </Button>
                        )}
                        </div>
                    </form>
                </Form>
              </TabsContent>

              <TabsContent value="case_history">
                <Form {...patientInfoForm}>
                    <form
                        onSubmit={patientInfoForm.handleSubmit(handlePatientInfoSubmit)}
                        className="space-y-6"
                    >
                        <Card className="bg-card/50">
                            <CardContent className="pt-6">
                                <h3 className="font-headline text-lg mb-4 text-primary">পূর্ণাঙ্গ কেস হিস্টরি</h3>
                                {isEditingInfo ? (
                                    <div className="space-y-4">
                                        {Object.entries(CATEGORY_LABELS).map(([categoryKey, categoryInfo]) => (
                                            <div key={categoryKey}>
                                                <h4 className="font-semibold text-base mb-2 flex items-center gap-2"><categoryInfo.icon className="w-5 h-5 text-muted-foreground" /> {categoryInfo.title}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2">
                                                    {Object.entries(categoryInfo.subs).map(([subKey, subLabel]) => (
                                                        <FormField
                                                            key={`${categoryKey}.${subKey}`}
                                                            control={patientInfoForm.control}
                                                            name={`categorizedCaseNotes.${categoryKey}.${subKey}` as any}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm">{subLabel}</FormLabel>
                                                                    <FormControl>
                                                                        <Textarea {...field} value={field.value || ''} rows={2} className="text-sm"/>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    patientInfoForm.watch("categorizedCaseNotes") ? (
                                        <CategorizedSymptomsDisplay
                                            symptoms={patientInfoForm.watch("categorizedCaseNotes")!}
                                            labels={CATEGORY_LABELS}
                                        />
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">এই রোগীর জন্য কোনো বিস্তারিত বা শ্রেণীবদ্ধ নোট নেই।</p>
                                    )
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-2 mt-4">
                        {isEditingInfo ? (
                            <>
                            <Button type="button" variant="outline" onClick={() => { setIsEditingInfo(false); patientInfoForm.reset(getPatientFormValues(patient)); }}>বাতিল</Button>
                            <Button type="submit" disabled={patientInfoForm.formState.isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                                {patientInfoForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} সংরক্ষণ করুন
                            </Button>
                            </>
                        ) : (
                            <Button type="button" onClick={() => setIsEditingInfo(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
                                <Pencil className="mr-2 h-4 w-4" /> তথ্য সম্পাদনা
                            </Button>
                        )}
                        </div>
                    </form>
                 </Form>
              </TabsContent>

              <TabsContent value="history">
                {isLoadingVisits ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />{" "}
                    <span className="ml-2">ভিজিটের বিবরণ লোড হচ্ছে...</span>
                  </div>
                ) : visits.length > 0 ? (
                  <ul className="space-y-4">
                    {visits.map((visit) => (
                      <li key={visit.id}>
                        <Card className="shadow-sm hover:shadow-md transition-shadow bg-card">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between text-primary font-semibold mb-1">
                              <div className="flex items-center">
                                <CalendarDays className="mr-2 h-5 w-5 text-blue-600" />
                                <span>
                                  {formatDate(visit.visitDate, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              {visit.prescription && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto text-sm"
                                  onClick={() =>
                                    router.push(
                                      `${ROUTES.PRESCRIPTION}/${patient.id}?visitId=${visit.id}${visit.prescription ? `&prescriptionId=${visit.prescription.id}` : ""}`,
                                    )
                                  }
                                >
                                  <FileText className="mr-1 h-4 w-4 text-indigo-600" />{" "}
                                  প্রেসক্রিপশন দেখুন
                                </Button>
                              )}
                            </div>
                            <p className="text-sm">
                              <strong className="font-medium text-muted-foreground">
                                ডাক্তার:
                              </strong>{" "}
                              {visit.prescription?.doctorName || "N/A"}
                            </p>
                            <p className="text-sm">
                              <strong className="font-medium text-muted-foreground">
                                প্রধান অভিযোগ:
                              </strong>{" "}
                              {visit.symptoms || "N/A"}
                            </p>
                            <p className="text-sm">
                              <strong className="font-medium text-muted-foreground">
                                রোগ নির্ণয় (প্রেসক্রিপশন):
                              </strong>{" "}
                              {visit.prescription?.diagnosis || "N/A"}
                            </p>
                            {visit.medicineDeliveryMethod && (
                              <p className="text-sm">
                                <strong className="font-medium text-muted-foreground">
                                  ঔষধ প্রদান:
                                </strong>
                                {visit.medicineDeliveryMethod === 'direct' ? 'সরাসরি প্রদান' : 'কুরিয়ারের মাধ্যমে প্রেরণ'}
                                {visit.medicineDeliveryMethod === "direct" ? (
                                  <PackageCheck className="inline-block ml-1 h-4 w-4 text-green-600" />
                                ) : (
                                  <Truck className="inline-block ml-1 h-4 w-4 text-blue-600" />
                                )}
                              </p>
                            )}

                            {visit.prescription &&
                              visit.prescription.items.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-1">
                                    <ClipboardList className="w-4 h-4 text-slate-500" />
                                    ঔষধপত্র:
                                  </p>
                                  <ul className="list-disc list-inside pl-2 text-xs space-y-0.5">
                                    {visit.prescription.items.map(
                                      (item, index) => (
                                        <li key={index}>
                                          {item.medicineName} ({item.dosage},{" "}
                                          {item.frequency}, {item.duration})
                                          {item.notes ? ` - ${item.notes}` : ""}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}

                            {visit.slips && visit.slips.length > 0 && (
                              <div className="pt-2 mt-2 border-t border-dashed">
                                <p className="text-sm font-medium text-muted-foreground flex items-center">
                                  <Banknote className="mr-2 h-4 w-4 text-green-600" />
                                  পেমেন্টসমূহ:
                                </p>
                                <ul className="list-none text-xs space-y-0.5 mt-1 pl-4">
                                  {visit.slips.map((slip) => (
                                    <li
                                      key={slip.id}
                                      className="flex justify-between items-center"
                                    >
                                      <span>
                                        {slip.purpose} (
                                        {getPaymentMethodLabel(
                                          slip.paymentMethod,
                                        )}
                                        )
                                      </span>
                                      <span className="font-semibold">
                                        {formatCurrency(slip.amount)}
                                      </span>
                                    </li>
                                  ))}
                                  <li className="flex justify-between items-center font-bold text-xs border-t border-dashed mt-1 pt-1">
                                    <span>মোট পেমেন্ট:</span>
                                    <span>
                                      {formatCurrency(
                                        visit.slips.reduce(
                                          (sum, s) => sum + s.amount,
                                          0,
                                        ),
                                      )}
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    এই রোগীর জন্য কোন পূর্ববর্তী ভিজিটের তথ্য নেই।
                  </p>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="p-4 pt-2 border-t">
          <DialogClose asChild>
            <Button variant="outline">বন্ধ করুন</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
