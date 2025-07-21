'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getPatientById, addPrescription, getVisitById, getPrescriptionsByPatientId, getPrescriptionById, updatePrescription, getClinicSettings } from '@/lib/firestoreService';
import type { Patient, Prescription, Visit, ClinicSettings } from '@/lib/types';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import { DiagnosisAssistant } from '@/components/ai/DiagnosisAssistant';
import { PlusCircle, Trash2, Save, Printer, ClipboardList, ChevronsDown, ChevronsUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ROUTES } from '@/lib/constants';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PrintLayout } from '@/components/prescription/PrintLayout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CategorizedSymptomsDisplay, LABELS as CATEGORY_LABELS } from '@/components/categorized-symptoms-display';


const prescriptionItemSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  notes: z.string().optional(),
});

const prescriptionFormSchema = z.object({
  items: z.array(prescriptionItemSchema).min(1, "At least one medicine is required"),
  followUpDays: z.coerce.number().int().positive().optional(),
  advice: z.string().optional(),
  diagnosis: z.string().optional(),
  doctorName: z.string().optional(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

export default function PrescriptionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const visitId = searchParams.get('visitId');
  const prescriptionIdQuery = searchParams.get('prescriptionId');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);
  const [existingPrescription, setExistingPrescription] = useState<Prescription | null>(null);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [pageHeaderDescriptionString, setPageHeaderDescriptionString] = useState<string>('রোগীর তথ্য লোড হচ্ছে...');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      items: [{ medicineName: '', dosage: '', frequency: '', duration: '', notes: '' }],
      followUpDays: 7,
      advice: '',
      diagnosis: '',
      doctorName: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const formValues = form.watch();

  const fetchPrescriptionData = useCallback(async () => {
    setIsLoading(true);
    let fetchedPatient: Patient | null = null;
    let fetchedVisit: Visit | null = null;
    let fetchedClinicSettings: ClinicSettings | null = null;

    try {
      [fetchedPatient, fetchedClinicSettings] = await Promise.all([
        getPatientById(patientId),
        getClinicSettings()
      ]);

      setPatient(fetchedPatient);
      setClinicSettings(fetchedClinicSettings);

      if (visitId) {
        const visit = await getVisitById(visitId);
        setCurrentVisit(visit);
        fetchedVisit = visit;
      }
      
      const resetValues: Partial<PrescriptionFormValues> = {
          items: [{ medicineName: '', dosage: '', frequency: '', duration: '', notes: '' }],
          followUpDays: 7,
          advice: '',
          diagnosis: fetchedVisit?.diagnosis || fetchedVisit?.symptoms || '',
          doctorName: fetchedClinicSettings?.doctorName || '',
      };

      if (prescriptionIdQuery) {
          const prescription = await getPrescriptionById(prescriptionIdQuery);
          if (prescription) {
              setExistingPrescription(prescription);
              Object.assign(resetValues, {
                  items: prescription.items,
                  followUpDays: prescription.followUpDays,
                  advice: prescription.advice,
                  diagnosis: prescription.diagnosis || resetValues.diagnosis,
                  doctorName: prescription.doctorName || resetValues.doctorName,
              });
          }
      } else if (visitId) {
          const prescriptionsForVisit = (await getPrescriptionsByPatientId(patientId)).filter(p => p.visitId === visitId);
          if (prescriptionsForVisit.length > 0) {
              const currentPrescriptionForVisit = prescriptionsForVisit[0];
              setExistingPrescription(currentPrescriptionForVisit);
              Object.assign(resetValues, {
                  items: currentPrescriptionForVisit.items,
                  followUpDays: currentPrescriptionForVisit.followUpDays,
                  advice: currentPrescriptionForVisit.advice,
                  diagnosis: currentPrescriptionForVisit.diagnosis || resetValues.diagnosis,
                  doctorName: currentPrescriptionForVisit.doctorName || resetValues.doctorName,
              });
          }
      }
      
      form.reset(resetValues as PrescriptionFormValues);

      const patientName = fetchedPatient ? fetchedPatient.name : 'N/A';
      const diaryNumber = fetchedPatient ? (fetchedPatient.diaryNumber || 'N/A') : 'N/A';
      const visitDate = fetchedVisit ? format(new Date(fetchedVisit.visitDate), "PP", { locale: bn }) : format(new Date(), "PP", { locale: bn });
      setPageHeaderDescriptionString(`রোগী: ${patientName} | ডায়েরি নং: ${diaryNumber} | তারিখ: ${visitDate}`);

    } catch (error) {
        console.error("Error fetching prescription data:", error);
        toast({ title: "Error", description: "Failed to load prescription data.", variant: "destructive" });
        setPageHeaderDescriptionString('রোগীর তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
        setIsLoading(false);
    }
  }, [patientId, visitId, prescriptionIdQuery, form, toast]);

  useEffect(() => {
    fetchPrescriptionData();
  }, [fetchPrescriptionData]);

  const onSubmit: SubmitHandler<PrescriptionFormValues> = async (data) => {
    if (!patient || !visitId) {
      toast({ title: "Error", description: "Patient or Visit information is missing.", variant: "destructive" });
      return;
    }

    try {
      const prescriptionDataPayload = {
        patientId: patient.id,
        visitId: visitId,
        date: new Date().toISOString(),
        items: data.items,
        followUpDays: data.followUpDays,
        advice: data.advice,
        diagnosis: data.diagnosis,
        doctorName: data.doctorName || clinicSettings?.doctorName,
      };

      if (existingPrescription) {
        await updatePrescription(existingPrescription.id, {
          ...prescriptionDataPayload,
          serialNumber: existingPrescription.serialNumber, 
        });
        toast({ title: 'প্রেসক্রিপশন আপডেট হয়েছে', description: `রোগী ${patient.name}-এর প্রেসক্রিপশন আপডেট করা হয়েছে।` });
      } else {
        const newSerialNumber = `P${Date.now().toString().slice(-6)}`;
        const newId = await addPrescription({
          ...prescriptionDataPayload,
          serialNumber: newSerialNumber,
        });
        if (!newId) throw new Error("Failed to add prescription");
        setExistingPrescription({ ...prescriptionDataPayload, id: newId, createdAt: new Date().toISOString(), serialNumber: newSerialNumber });
        toast({ title: 'প্রেসক্রিপশন সংরক্ষণ করা হয়েছে', description: `রোগী ${patient.name}-এর প্রেসক্রিপশন সংরক্ষণ করা হয়েছে।` });
      }
      window.dispatchEvent(new CustomEvent('firestoreDataChange'));
    } catch (error) {
      console.error('Failed to save prescription:', error);
      toast({ title: 'সংরক্ষণ ব্যর্থ', description: 'প্রেসক্রিপশন সংরক্ষণ করার সময় একটি ত্রুটি ঘটেছে।', variant: "destructive" });
    }
  };

  const handlePrintPrescription = () => {
    if (typeof window !== 'undefined') {
      document.body.classList.add('printing-prescription-active');
      window.print();
      document.body.classList.remove('printing-prescription-active');
    }
  };
  
  const handleKeySymptomsSelect = (symptoms: string) => {
    form.setValue('diagnosis', symptoms);
    toast({
      title: "লক্ষণ যুক্ত হয়েছে",
      description: "AI দ্বারা চিহ্নিত প্রধান লক্ষণগুলো 'রোগ নির্ণয়' ফিল্ডে যোগ করা হয়েছে।",
    });
  };

  const handleGoToMedicineInstructions = () => {
    if (patient && visitId) {
      router.push(`${ROUTES.MEDICINE_INSTRUCTIONS}?patientId=${patient.id}&name=${encodeURIComponent(patient.name)}&visitId=${visitId}`);
    } else {
      toast({ title: "ত্রুটি", description: "রোগী বা ভিজিটের তথ্য পাওয়া যায়নি।", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <LoadingSpinner variant="page" label="প্রেসক্রিপশন ডেটা লোড হচ্ছে..." />;
  }

  if (!patient && !isLoading) {
    return <div className="text-center py-10 text-destructive">রোগী খুঁজে পাওয়া যায়নি। আইডি পরীক্ষা করুন।</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="প্রেসক্রিপশন শিট"
        description={pageHeaderDescriptionString}
        className="hide-on-print"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="shadow-lg bg-card/80 backdrop-blur-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-headline text-xl">ঔষধের বিবরণ</CardTitle>
                      <CardDescription>প্রেসক্রিপশন আইডি: {existingPrescription?.serialNumber || 'নতুন'}</CardDescription>
                    </div>
                    <FormField
                      control={form.control}
                      name="doctorName"
                      render={({ field }) => (
                        <FormItem className="w-1/2 md:w-1/3">
                          <FormLabel className="text-xs">ডাক্তারের নাম</FormLabel>
                          <FormControl>
                            <Input placeholder="ডাক্তারের পুরো নাম" {...field} className="h-10 text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <Separator />
                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>রোগ নির্ণয় / প্রধান অভিযোগ</FormLabel>
                        <FormControl>
                          <Textarea placeholder="রোগ নির্ণয় বা প্রধান অভিযোগ লিখুন" {...field} rows={3} id="diagnosisMain" className="text-base resize-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator />

                  <div>
                    <h3 className="mb-2 text-md font-semibold text-primary">ঔষধসমূহ</h3>
                    {fields.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 border p-3 rounded-md mb-3 relative bg-background/50 dark:bg-background/20">
                        <FormField
                          control={form.control}
                          name={`items.${index}.medicineName`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-3">
                              <FormLabel className="text-xs">ঔষধের নাম</FormLabel>
                              <FormControl>
                                <Input placeholder="যেমন, নাপা" {...field} id={`medName${index}`} className="h-10 text-sm" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.dosage`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-xs">মাত্রা</FormLabel>
                              <FormControl>
                                <Input placeholder="যেমন, ৫০০মিগ্রা, ১ চামচ" {...field} className="h-10 text-sm" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.frequency`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-xs">পুনরাবৃত্তি</FormLabel>
                              <FormControl>
                                <Input placeholder="যেমন, ১+০+১" {...field} className="h-10 text-sm" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.duration`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-xs">সময়কাল</FormLabel>
                              <FormControl>
                                <Input placeholder="যেমন, ৭ দিন" {...field} className="h-10 text-sm" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.notes`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-xs">নোট</FormLabel>
                              <FormControl>
                                <Input placeholder="যেমন, খাবারের পর" {...field} id={`medNotes${index}`} className="h-10 text-sm" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="md:col-span-1 flex items-end">
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10" title="Remove medicine">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ medicineName: '', dosage: '', frequency: '', duration: '', notes: '' })}
                      className="mt-2"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> ঔষধ যোগ করুন
                    </Button>
                    {form.formState.errors.items && typeof form.formState.errors.items === 'object' && !Array.isArray(form.formState.errors.items) && <p className="text-sm text-destructive mt-1">{form.formState.errors.items.message}</p>}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="followUpDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ফলো-আপ (দিন)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="যেমন, ৭" {...field} onChange={event => field.onChange(+event.target.value)} className="h-10 text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="advice"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>পরামর্শ / সাধারণ নির্দেশাবলী</FormLabel>
                          <FormControl>
                            <Textarea placeholder="যেমন, পর্যাপ্ত বিশ্রাম নিন, গরম জল পান করুন।" {...field} rows={3} id="adviceMain" className="text-base resize-none" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-end items-center gap-2 border-t pt-4 hide-on-print">
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    size="sm"
                    className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-500 text-white hover:brightness-105 transition-all"
                  >
                    {form.formState.isSubmitting ? <LoadingSpinner variant="button" /> : <Save className="mr-2 h-4 w-4" />}
                    {existingPrescription ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                  </Button>
                  {existingPrescription && (
                    <>
                      <Button
                        type="button"
                        onClick={handlePrintPrescription}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto bg-gradient-to-r from-sky-100 to-cyan-200 text-sky-800 hover:brightness-105 transition-all"
                      >
                        <Printer className="mr-2 h-4 w-4" /> প্রিন্ট
                      </Button>
                      <Button
                        type="button"
                        onClick={handleGoToMedicineInstructions}
                        variant="default"
                        size="sm"
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-100 to-indigo-200 text-purple-800 hover:brightness-105 transition-all"
                      >
                        <ClipboardList className="mr-2 h-4 w-4" /> নিয়মাবলী
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
        <div className="lg:col-span-1 space-y-6 hide-on-print">
          <DiagnosisAssistant
            patient={patient}
            visit={currentVisit}
            onKeySymptomsSelect={handleKeySymptomsSelect}
          />
          {patient && patient.categorizedCaseNotes && (
            <Card className="shadow-md bg-gradient-to-br from-indigo-100 to-blue-200 dark:from-indigo-900/40 dark:to-blue-900/40 backdrop-blur-lg">
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <CardTitle className="font-headline text-lg text-slate-800 dark:text-slate-200">রোগীর সমস্যার সারসংক্ষেপ</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300" onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}>
                    {isSummaryExpanded ? <ChevronsUp className="h-5 w-5" /> : <ChevronsDown className="h-5 w-5" />}
                    <span className="sr-only">{isSummaryExpanded ? "সংক্ষিপ্ত করুন" : "বিস্তারিত দেখুন"}</span>
                  </Button>
                </div>
                <CardDescription className="text-xs text-slate-600 dark:text-slate-400">নিবন্ধিত তথ্য অনুযায়ী একটি সংক্ষিপ্ত বিবরণ।</CardDescription>
              </CardHeader>
              <CardContent className="text-sm relative">
                 <ScrollArea className={cn("h-auto pr-4 transition-all ease-in-out duration-500", isSummaryExpanded ? "max-h-[500px]" : "max-h-[250px]")}>
                  {patient.categorizedCaseNotes ? (
                     <CategorizedSymptomsDisplay 
                       symptoms={patient.categorizedCaseNotes} 
                       labels={CATEGORY_LABELS} 
                       showNumbers
                     />
                  ) : (
                    <p className="text-muted-foreground italic">এই রোগীর জন্য কোনো বিস্তারিত বা শ্রেণীবদ্ধ নোট নেই।</p>
                  )}
                 </ScrollArea>
                 {!isSummaryExpanded && <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-indigo-100 to-transparent dark:from-indigo-900/40 pointer-events-none"></div>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <PrintLayout 
        patient={patient}
        clinicSettings={clinicSettings}
        formValues={formValues}
        visitDate={currentVisit?.visitDate || null}
        prescriptionDate={existingPrescription?.date || null}
      />
    </div>
  );
}
