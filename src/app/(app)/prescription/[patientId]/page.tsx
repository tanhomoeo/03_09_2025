
'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getPatientById, addPrescription, getVisitById, getPrescriptionsByPatientId, getPrescriptionById, updatePrescription, formatDate, getClinicSettings } from '@/lib/firestoreService';
import type { Patient, Prescription, Visit, ClinicSettings } from '@/lib/types';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import { DiagnosisAssistant } from '@/components/ai/DiagnosisAssistant';
import { PlusCircle, Trash2, Save, Loader2, Printer, ClipboardList } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { APP_NAME, ROUTES } from '@/lib/constants';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

const prescriptionItemSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  notes: z.string().optional(),
});

const prescriptionFormSchema = z.object({
  prescriptionType: z.enum(['adult', 'child']),
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

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      prescriptionType: 'adult',
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

  const fetchPrescriptionData = useCallback(async () => {
    setIsLoading(true);
    let fetchedPatient: Patient | null = null;
    let fetchedVisit: Visit | null = null;
    let fetchedClinicSettings: ClinicSettings | null = null;

    try {
      fetchedPatient = await getPatientById(patientId);
      setPatient(fetchedPatient || null);
      fetchedClinicSettings = await getClinicSettings();
      setClinicSettings(fetchedClinicSettings);

      if (visitId) {
        const visit = await getVisitById(visitId);
        setCurrentVisit(visit || null);
        fetchedVisit = visit;
      }
      
      let resetValues: PrescriptionFormValues = {
          prescriptionType: 'adult',
          items: [{ medicineName: '', dosage: '', frequency: '', duration: '', notes: '' }],
          followUpDays: 7,
          advice: '',
          diagnosis: '',
          doctorName: fetchedClinicSettings?.doctorName || '',
      };

      if (prescriptionIdQuery) {
          const prescription = await getPrescriptionById(prescriptionIdQuery);
          if (prescription) {
              setExistingPrescription(prescription);
              resetValues = {
                  prescriptionType: prescription.prescriptionType,
                  items: prescription.items,
                  followUpDays: prescription.followUpDays,
                  advice: prescription.advice,
                  diagnosis: prescription.diagnosis || (fetchedVisit?.diagnosis || fetchedVisit?.symptoms || ''),
                  doctorName: prescription.doctorName || fetchedClinicSettings?.doctorName || '',
              };
          } else if (fetchedVisit) {
              resetValues.diagnosis = fetchedVisit.diagnosis || fetchedVisit.symptoms || '';
          }
      } else if (visitId) {
          const prescriptionsForVisit = (await getPrescriptionsByPatientId(patientId)).filter(p => p.visitId === visitId);
          if (prescriptionsForVisit.length > 0) {
              const currentPrescriptionForVisit = prescriptionsForVisit[0];
              setExistingPrescription(currentPrescriptionForVisit);
              resetValues = {
                  prescriptionType: currentPrescriptionForVisit.prescriptionType,
                  items: currentPrescriptionForVisit.items,
                  followUpDays: currentPrescriptionForVisit.followUpDays,
                  advice: currentPrescriptionForVisit.advice,
                  diagnosis: currentPrescriptionForVisit.diagnosis || (fetchedVisit?.diagnosis || fetchedVisit?.symptoms || ''),
                  doctorName: currentPrescriptionForVisit.doctorName || fetchedClinicSettings?.doctorName || '',
              };
          } else if (fetchedVisit) {
             resetValues.diagnosis = fetchedVisit.diagnosis || fetchedVisit.symptoms || '';
             resetValues.doctorName = fetchedClinicSettings?.doctorName || '';
          }
      }
      
      if (!resetValues.diagnosis && fetchedVisit) {
          resetValues.diagnosis = fetchedVisit.diagnosis || fetchedVisit.symptoms || '';
      }
      form.reset(resetValues);

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
        prescriptionType: data.prescriptionType,
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
      const elementsToHide = document.querySelectorAll('.hide-on-print');
      elementsToHide.forEach(el => (el as HTMLElement).style.display = 'none');
      document.body.classList.add('printing-prescription-active');
      window.print();
      elementsToHide.forEach(el => (el as HTMLElement).style.display = '');
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
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-3">প্রেসক্রিপশন ডেটা লোড হচ্ছে...</p></div>;
  }

  if (!patient && !isLoading) {
    return <div className="text-center py-10 text-destructive">রোগী খুঁজে পাওয়া যায়নি। আইডি পরীক্ষা করুন।</div>;
  }

  return (
    <div className="space-y-6 print:space-y-2">
      <PageHeaderCard
        title="প্রেসক্রিপশন শিট"
        description={pageHeaderDescriptionString}
        className="hide-on-print"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="shadow-lg">
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
                  <FormField
                    control={form.control}
                    name="prescriptionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>প্রেসক্রিপশন এর জন্য</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="ধরন নির্বাচন করুন" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="adult">প্রাপ্তবয়স্ক</SelectItem>
                            <SelectItem value="child">শিশু</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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
          {patient && (
            <Card className="bg-gradient-to-br from-green-100 to-lime-200">
              <CardHeader>
                <CardTitle className="font-headline text-lg text-slate-800">রোগীর তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1 text-slate-700">
                <p><strong>নাম:</strong> {patient.name}</p>
                <p><strong>ফোন:</strong> {patient.phone}</p>
                <p><strong>গ্রাম:</strong> {patient.villageUnion || 'N/A'}</p>
                <p><strong>নিবন্ধিত:</strong> {patient.createdAt ? formatDate(patient.createdAt) : 'N/A'}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="print-only-block print-prescription-container bg-white text-black">
        <div className="print-header">
          <h1 className="font-headline text-2xl font-bold">{clinicSettings?.clinicName || APP_NAME}</h1>
          {clinicSettings?.clinicAddress && <p className="text-sm">{clinicSettings.clinicAddress}</p>}
          {clinicSettings?.clinicContact && <p className="text-sm">যোগাযোগ: {clinicSettings.clinicContact}</p>}
          <h2 className="print-title text-lg font-semibold mt-2 underline">প্রেসক্রিপশন</h2>
        </div>

        <div className="patient-info-grid">
          <div><strong>রোগী:</strong> {patient?.name || 'N/A'}</div>
          <div><strong>বয়স/লিঙ্গ:</strong> {patient?.age || 'N/A'} / {patient?.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'N/A'}</div>
          <div><strong>ডায়েরি নং:</strong> {patient?.diaryNumber || 'N/A'}</div>
          <div><strong>তারিখ:</strong> {format(new Date(form.getValues("items").length > 0 && existingPrescription?.date ? existingPrescription.date : (currentVisit?.visitDate || new Date().toISOString())), "dd MMM, yyyy", { locale: bn })}</div>
        </div>

        <div className="print-section">
          {form.getValues("diagnosis") && (
            <div className="mb-2">
              <strong className="section-title">প্রধান অভিযোগ / রোগ নির্ণয়:</strong>
              <p className="whitespace-pre-line text-sm">{form.getValues("diagnosis")}</p>
            </div>
          )}
        </div>

        <div className="print-section rx-section">
          <div className="flex justify-between items-baseline">
            <strong className="text-xl font-bold section-title">Rx</strong>
            <span className="text-xs">({form.getValues("prescriptionType") === 'child' ? 'শিশু' : 'প্রাপ্তবয়স্ক'})</span>
          </div>
          <table className="medicines-table">
            <thead>
              <tr>
                <th className="w-[35%]">ঔষধের নাম ও শক্তি</th>
                <th className="w-[15%]">মাত্রা</th>
                <th className="w-[15%]">পুনরাবৃত্তি</th>
                <th className="w-[15%]">সময়কাল</th>
                <th className="w-[20%]">নোট/নির্দেশনা</th>
              </tr>
            </thead>
            <tbody>
              {form.getValues("items").filter(item => item.medicineName.trim() !== '').map((item, index) => (
                <tr key={index}>
                  <td>{item.medicineName}</td>
                  <td>{item.dosage}</td>
                  <td>{item.frequency}</td>
                  <td>{item.duration}</td>
                  <td>{item.notes}</td>
                </tr>
              ))}
              {[...Array(Math.max(0, 6 - form.getValues("items").filter(item => item.medicineName.trim() !== '').length))].map((_, i) => (
                <tr key={`empty-${i}`} className="empty-row"><td className="empty-cell">&nbsp;</td><td></td><td></td><td></td><td></td></tr>
              ))}
            </tbody>
          </table>
        </div>

        {form.getValues("advice") && (
          <div className="print-section">
            <strong className="section-title">পরামর্শ:</strong>
            <p className="whitespace-pre-line text-sm">{form.getValues("advice")}</p>
          </div>
        )}

        {form.getValues("followUpDays") && (
          <div className="print-section follow-up">
            <strong>ফলো-আপ:</strong> {form.getValues("followUpDays")?.toLocaleString('bn-BD')} দিন পর।
          </div>
        )}

        <div className="print-footer">
          <div className="signature-area">
            <p className="signature-line"></p>
            <p>{form.getValues("doctorName") || clinicSettings?.doctorName || 'ডাক্তারের নাম'}</p>
            {clinicSettings?.bmRegNo && <p>বিএমডিসি রেজি. নং: {clinicSettings.bmRegNo}</p>}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .print-only-block { display: none; }
        @media print {
          .hide-on-print { display: none !important; }
          .print-only-block { display: block !important; }
          body.printing-prescription-active {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0; padding: 0;
            background-color: #fff !important;
          }
          .print-prescription-container {
            width: 100%;
            margin: 0 auto;
            padding: 0;
            box-sizing: border-box;
            font-family: 'PT Sans', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #000 !important;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .print-header { 
            text-align: center; 
            margin-bottom: 6mm; 
            border-bottom: 1px solid #555; 
            padding-bottom: 4mm;
            padding-top: 4mm;
            background: linear-gradient(to bottom, #f3f4f6, #ffffff) !important;
            border-radius: 8px 8px 0 0;
          }
          .print-header h1 { font-family: 'Poppins', 'PT Sans', sans-serif; margin: 0 0 1mm 0; }
          .print-header p { font-size: 9pt; margin: 0.5mm 0; }
          .print-title { margin-top: 3mm; }

          .patient-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1mm 5mm;
            font-size: 9.5pt;
            padding: 3mm 12mm;
            border-bottom: 1px solid #ccc;
            margin-bottom: 4mm;
          }
          .patient-info-grid div { padding: 0.5mm 0; }

          .print-section { 
            margin-bottom: 4mm;
            padding: 0 12mm;
          }
          .section-title { font-weight: bold; font-size: 11pt; display: block; margin-bottom: 1mm; }
          .rx-section { 
            margin-top: 2mm;
            padding: 2mm;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            margin-left: 10mm;
            margin-right: 10mm;
          }
          .rx-section .section-title { margin-bottom: 0.5mm; }

          .medicines-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 2mm; table-layout: fixed; }
          .medicines-table th, .medicines-table td { border: 1px solid #777; padding: 1.5mm 2mm; text-align: left; vertical-align: top; word-wrap: break-word; }
          .medicines-table th { 
            background-color: #f3f4f6 !important;
            font-weight: bold; 
            font-size: 9.5pt; 
          }
          .medicines-table .empty-row td { height: 1.8em; }
          .medicines-table .empty-cell { border-left: 1px solid #777; border-right: 1px solid #777; }

          .whitespace-pre-line { white-space: pre-line; }
          .follow-up { font-size: 9.5pt; margin-top: 3mm; }

          .print-footer {
            margin-top: 12mm;
            padding: 0 12mm 4mm 12mm;
            position: relative;
            height: 40mm;
          }
          .signature-area {
            text-align: right;
            font-size: 9.5pt;
            position: absolute;
            bottom: 5mm;
            right: 12mm;
          }
          .signature-line {
            display: block;
            width: 150px;
            border-bottom: 1px solid #333;
            margin-bottom: 2mm;
            margin-left: auto;
          }
          .signature-area p { margin: 1mm 0; }
        }
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
      `}
      </style>
    </div>
  );
}
