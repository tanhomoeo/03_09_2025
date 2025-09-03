'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Wand2,
  ListChecks,
  Pill,
  Copy,
} from 'lucide-react';
import type { Patient, Visit } from '@/lib/types';
import type { HomeopathicAssistantOutput } from '@/ai/flows/homeopathic-assistant-flow';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface DiagnosisAssistantProps {
  patient: Patient | null;
  visit: Visit | null;
  onKeySymptomsSelect: (symptoms: string) => void;
}

export function DiagnosisAssistant({
  patient,
  visit,
  onKeySymptomsSelect,
}: DiagnosisAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<HomeopathicAssistantOutput | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!patient) {
      toast({
        title: 'প্রয়োজনীয় তথ্য নেই',
        description: 'বিশ্লেষণ শুরু করার জন্য রোগীর তথ্য প্রয়োজন।',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    // Combine all patient data into a single string for the AI
    const caseDataParts = [
      visit?.symptoms && `বর্তমান ভিজিটের প্রধান সমস্যা: ${visit.symptoms}`,
      `রোগীর নাম: ${patient.name}, বয়স: ${patient.age || 'N/A'}, লিঙ্গ: ${patient.gender || 'N/A'}`,
      // Use the structured case notes if available, otherwise use the raw text
      patient.categorizedCaseNotes
        ? `রোগীর বিস্তারিত ইতিহাস (AI দ্বারা শ্রেণীবদ্ধ): ${JSON.stringify(patient.categorizedCaseNotes, null, 2)}`
        : patient.caseNotes && `রোগীর ইতিহাস: ${patient.caseNotes}`,
      // Include basic demographic information available in current Patient type
      patient.occupation && `পেশা: ${patient.occupation}`,
      patient.district && `জেলা: ${patient.district}`,
      patient.thanaUpazila && `থানা/উপজেলা: ${patient.thanaUpazila}`,
      patient.villageUnion && `গ্রাম/ইউনিয়ন: ${patient.villageUnion}`,
      patient.guardianName && `অভিভাবকের নাম: ${patient.guardianName}`,
      patient.guardianRelation &&
        `অভিভাবকের সম্পর্ক: ${patient.guardianRelation}`,
    ];
    const fullCaseData = caseDataParts.filter(Boolean).join('\n');

    try {
      const res = await fetch('/api/ai/homeopathic-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseData: fullCaseData }),
      });
      const result = (await res.json()) as
        | HomeopathicAssistantOutput
        | { error?: string };
      if (!res.ok || (result as any)?.error) {
        throw new Error(
          ((result as any)?.error as string) || 'AI কোনো উত্তর দেয়নি।',
        );
      }
      setAnalysisResult(result as HomeopathicAssistantOutput);
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : 'AI বিশ্লেষণ করার সময় একটি অজানা ত্রুটি হয়েছে।';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSymptoms = () => {
    if (analysisResult?.keySymptoms) {
      const symptomsText = analysisResult.keySymptoms.join('; ');
      onKeySymptomsSelect(symptomsText);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: `${type} কপি হয়েছে`,
        description: `"${text}" ক্লিপবোর্ডে কপি করা হয়েছে।`,
      });
    });
  };

  return (
    <Card className="shadow-md bg-gradient-to-br from-purple-100 to-indigo-200 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center text-slate-800">
          <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
          হোমিওপ্যাথিক AI সহকারী
        </CardTitle>
        <CardDescription className="text-slate-600">
          রোগীর সম্পূর্ণ কেস বিশ্লেষণ করে প্রধান লক্ষণ ও সম্ভাব্য ঔষধ খুঁজুন।
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleAnalyze}
          disabled={isLoading || !patient}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'বিশ্লেষণ চলছে...' : 'AI দ্বারা বিশ্লেষণ করুন'}
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>ত্রুটি</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <h4 className="font-semibold text-md mb-2 flex items-center">
                <ListChecks className="mr-2 h-5 w-5 text-blue-600" />
                প্রধান লক্ষণসমূহ
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm bg-muted/50 p-3 rounded-md">
                {analysisResult.keySymptoms.map((symptom, i) => (
                  <li key={`symptom-${i}`}>{symptom}</li>
                ))}
              </ul>
              <Button
                onClick={handleUseSymptoms}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Copy className="mr-2 h-4 w-4" /> এই লক্ষণগুলো ব্যবহার করুন
              </Button>
            </div>
            <div>
              <h4 className="font-semibold text-md mb-2 flex items-center">
                <Pill className="mr-2 h-5 w-5 text-green-600" />
                সম্ভাব্য ঔষধ
              </h4>
              <p className="text-xs text-destructive font-medium mb-2">
                সতর্কীকরণ: এটি শুধুমাত্র AI দ্বারা প্রস্তাবিত একটি তালিকা,
                চূড়ান্ত প্রেসক্রিপশন নয়।
              </p>
              <div className="space-y-2">
                {analysisResult.remedySuggestions.map((remedy, i) => (
                  <div
                    key={`remedy-${i}`}
                    className="text-sm border p-2 rounded-md bg-white/30"
                  >
                    <div className="font-bold flex justify-between items-center text-slate-700">
                      <span>
                        {remedy.remedyName} {remedy.potency}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyToClipboard(remedy.remedyName, 'ঔষধের নাম')
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-slate-600 text-xs">
                      {remedy.justification}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
