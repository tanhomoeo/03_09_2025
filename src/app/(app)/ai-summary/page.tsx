
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquareText, Wand2, AlertCircle, List, Pill, User, ChevronsUpDown, Check } from 'lucide-react';
import { analyzeComplaint, type ComplaintAnalyzerInput, type ComplaintAnalyzerOutput } from '@/ai/flows/complaint-analyzer-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getPatients, getVisitsByPatientId, formatDate, getVisitsWithinDateRange } from '@/lib/firestoreService';
import type { Patient, Visit } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { startOfDay, endOfDay } from 'date-fns';

export default function AiSummaryPage() {
  const [complaintText, setComplaintText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ComplaintAnalyzerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const complaintTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientListOpen, setIsPatientListOpen] = useState(false);

  useEffect(() => {
    const loadTodaysPatients = async () => {
      try {
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());
        
        const [todaysVisits, allPatients] = await Promise.all([
            getVisitsWithinDateRange(todayStart, todayEnd),
            getPatients()
        ]);

        const todaysPatientIds = new Set(todaysVisits.map(v => v.patientId));
        const todaysPatientList = allPatients.filter(p => todaysPatientIds.has(p.id));
        
        setPatients(todaysPatientList.sort((a, b) => a.name.localeCompare(b.name, 'bn')));
      } catch (e) {
        console.error("Failed to load today's patients for AI summary:", e);
        setError("আজকের রোগীদের তালিকা লোড করতে একটি সমস্যা হয়েছে।");
      }
    };
    loadTodaysPatients();
  }, []);

  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPatientListOpen(false);
    setIsFetchingDetails(true);
    setComplaintText('');
    setError(null);
    setAnalysisResult(null);

    try {
      const visits = await getVisitsByPatientId(patient.id);
      const complaintParts: string[] = [];

      if (patient.chiefComplaints) complaintParts.push(`বর্তমান প্রধান সমস্যা:\n${patient.chiefComplaints}`);
      if (patient.patientHistory) complaintParts.push(`রোগীর পূর্ব ইতিহাস:\n${patient.patientHistory}`);
      if (patient.familyHistory) complaintParts.push(`পারিবারিক রোগের ইতিহাস:\n${patient.familyHistory}`);
      if (patient.mentalState) complaintParts.push(`বর্তমান মানসিক অবস্থা:\n${patient.mentalState}`);

      if (visits.length > 0) {
        const visitSymptoms = visits
          .map((v, i) => `ভিজিট #${visits.length - i} (${formatDate(v.visitDate)}):\n${v.symptoms || 'N/A'}`)
          .join('\n\n');
        complaintParts.push(`পূর্ববর্তী ভিজিটের লক্ষণসমূহ:\n${visitSymptoms}`);
      }

      const fullComplaint = complaintParts.join('\n\n---\n\n');
      setComplaintText(fullComplaint || "এই রোগীর জন্য কোনো অভিযোগ ডাটাবেসে পাওয়া যায়নি।");
    } catch (e) {
      setError("রোগীর বিস্তারিত তথ্য আনতে সমস্যা হয়েছে।");
      console.error(e);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleAnalyzeComplaint = async () => {
    if (!complaintText.trim()) {
      setError("অনুগ্রহ করে রোগীর অভিযোগ লিখুন।");
      complaintTextAreaRef.current?.focus();
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const input: ComplaintAnalyzerInput = { complaintText };
      const result = await analyzeComplaint(input);
      setAnalysisResult(result);
    } catch (err: any) {
      let errorMessage = "অভিযোগ বিশ্লেষণ করার সময় একটি ত্রুটি হয়েছে।";
      if (err.message) {
           errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="AI দ্বারা অভিযোগ বিশ্লেষণ"
        description="রোগীর অভিযোগ ইনপুট করুন এবং AI দ্বারা তৈরি সারাংশ ও সম্ভাব্য ঔষধের তালিকা পান।"
        actions={<Wand2 className="h-8 w-8 text-primary" />}
      />

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center">
                <User className="mr-3 h-6 w-6 text-primary" />
                আজকের রোগী নির্বাচন করুন
            </CardTitle>
            <CardDescription>
              আজকের ভিজিটের তালিকা থেকে একজন রোগী নির্বাচন করুন। এটি স্বয়ংক্রিয়ভাবে তার সকল অভিযোগ লোড করবে।
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Popover open={isPatientListOpen} onOpenChange={setIsPatientListOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isPatientListOpen}
                        className="w-full md:w-[300px] justify-between"
                    >
                        {selectedPatient ? selectedPatient.name : "একজন রোগী নির্বাচন করুন..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput placeholder="রোগীর নাম দিয়ে খুঁজুন..." />
                        <CommandEmpty>আজকের জন্য কোনো রোগী পাওয়া যায়নি।</CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className="h-64">
                            {patients.map((patient) => (
                                <CommandItem
                                    key={patient.id}
                                    value={patient.name}
                                    onSelect={() => handleSelectPatient(patient)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedPatient?.id === patient.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {patient.name}
                                </CommandItem>
                            ))}
                          </ScrollArea>
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center">
            <MessageSquareText className="mr-3 h-6 w-6 text-primary" />
            রোগীর অভিযোগ
          </CardTitle>
          <CardDescription>
            রোগীর সম্পূর্ণ অভিযোগ এখানে বাংলা ভাষায় লিখুন অথবা ভয়েস ইনপুট ব্যবহার করুন। AI এটি বিশ্লেষণ করে গুরুত্বপূর্ণ পয়েন্ট এবং সম্ভাব্য ঔষধের তালিকা দেবে। অনুগ্রহ করে কমপক্ষে ১০ শব্দের অভিযোগ লিখুন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <div className="relative">
                {isFetchingDetails && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 rounded-md">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground mt-2">রোগীর তথ্য লোড হচ্ছে...</p>
                    </div>
                )}
                 <Textarea
                    id="aiSummaryComplaintText"
                    ref={complaintTextAreaRef}
                    placeholder="রোগীর সম্পূর্ণ অভিযোগ এখানে বাংলা ভাষায় লিখুন..."
                    rows={8}
                    className="w-full rounded-md border border-input bg-card shadow-inner focus:ring-1 focus:ring-ring focus:border-primary min-h-[150px] px-3 py-2 text-base placeholder-muted-foreground resize-y"
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    aria-label="রোগীর অভিযোগ"
                    disabled={isFetchingDetails}
                  />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAnalyzeComplaint} disabled={isLoading || isFetchingDetails} className="min-w-[180px]">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                অভিযোগ বিশ্লেষণ করুন
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>ত্রুটি</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="mt-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground mt-2">AI আপনার অভিযোগ বিশ্লেষণ করছে...</p>
            </div>
          )}

          {analysisResult && !isLoading && (
            <div className="mt-8 space-y-6">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="font-headline text-md flex items-center">
                    <List className="mr-2 h-5 w-5 text-blue-600" />
                    অভিযোগের গুরুত্বপূর্ণ পয়েন্টসমূহ:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisResult.summaryPoints && analysisResult.summaryPoints.length > 0 ? (
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {analysisResult.summaryPoints.map((point, index) => (
                        <li key={`summary-${index}`}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">AI কোনো সারাংশ পয়েন্ট তৈরি করতে পারেনি। অনুগ্রহ করে অভিযোগটি আরও বিস্তারিতভাবে লিখুন।</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="font-headline text-md flex items-center">
                    <Pill className="mr-2 h-5 w-5 text-green-600" />
                    সম্ভাব্য হোমিওপ্যাথিক ঔষধের তালিকা:
                  </CardTitle>
                  <CardDescription className="text-xs text-destructive font-medium">
                    সতর্কীকরণ: এটি শুধুমাত্র AI দ্বারা প্রস্তাবিত একটি তালিকা, চূড়ান্ত প্রেসক্রিপশন নয়। যে কোনো ঔষধ সেবনের পূর্বে অবশ্যই একজন অভিজ্ঞ ও রেজিস্টার্ড চিকিৎসকের পরামর্শ নিন।
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult.medicineSuggestions && analysisResult.medicineSuggestions.length > 0 ? (
                    <ul className="list-decimal space-y-1 pl-5 text-sm">
                      {analysisResult.medicineSuggestions.map((suggestion, index) => (
                        <li key={`med-${index}`}>{suggestion}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">AI কোনো ঔষধের প্রস্তাব দিতে পারেনি। অভিযোগটি আরও স্পষ্ট করার চেষ্টা করুন।</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
