
"use client";

import { useState, useCallback, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlertTriangle,
  LoaderCircle,
  Wand2,
  FileText,
  Brain,
  Lightbulb,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  suggestRemedies,
  type SuggestRemediesOutput,
} from "@/ai/flows/suggest-remedies";
import { SymptomForm, type SymptomFormValues } from "@/components/symptom-form";
import { PageHeaderCard } from "@/components/shared/PageHeaderCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CategorizedSymptomsDisplay, LABELS as CATEGORY_LABELS } from "@/components/repertory/CategorizedSymptomsDisplay";
import { RemedySuggestionsDisplay } from "@/components/repertory/RemedySuggestionsDisplay";
import { RepertorySuggestionDisplay } from "@/components/repertory/RepertorySuggestionDisplay";

const formSchema = z.object({
  symptoms: z.string().min(10, {
    message: "অনুগ্রহ করে লক্ষণগুলি কমপক্ষে ১০টি অক্ষরে বর্ণনা করুন।",
  }),
});

export default function AiRepertoryPage() {
  const [results, setResults] = useState<SuggestRemediesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: "",
    },
  });

  const handleStopVoiceInput = useCallback(() => {
    window.dispatchEvent(new CustomEvent("stop-voice-input"));
  }, []);

  const handleSubmit = (values: SymptomFormValues) => {
    setIsLoading(true);
    setResults(null);
    setError(null);
    handleStopVoiceInput();

    startTransition(async () => {
      try {
        const result = await suggestRemedies({
          symptoms: values.symptoms,
        });

        if (!result) {
          throw new Error("AI কোনো বিশ্লেষণ দিতে পারেনি।");
        }
        setResults(result);
      } catch (e: unknown) {
        const errorMessage =
          e instanceof Error
            ? e.message
            : "বিশ্লেষণ আনতে একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আপনার সংযোগ বা API কী পরীক্ষা করে আবার চেষ্টা করুন।";
        setError(errorMessage);
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="AI রেপার্টরি ও ঔষধ নির্বাচন"
        description="রোগীর লক্ষণসমূহের বিস্তারিত বিবরণ দিন এবং Gemini AI-এর মাধ্যমে সেগুলোকে শ্রেণীবদ্ধ করুন, প্রধান লক্ষণগুলো চিহ্নিত করুন এবং মেটেরিয়া মেডিকা ভিত্তিক ঔষধের প্রস্তাবনা পান।"
        actions={<Wand2 className="h-8 w-8 text-primary" />}
        className="bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-purple-900/30 dark:to-indigo-900/30"
        titleClassName="text-blue-900 dark:text-blue-300 drop-shadow-sm"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg border-border/20 bg-card/50 backdrop-blur-lg p-4 sm:p-6 rounded-2xl">
            <CardHeader className="p-2 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg md:text-xl font-bold text-foreground font-headline">
                <FileText className="w-6 h-6 text-primary" />
                <span>রোগীর লক্ষণ বিবরণ</span>
              </CardTitle>
              <CardDescription className="pt-1 pl-9 text-sm">
                এখানে রোগীর পূর্ণাঙ্গ বিবরণ লিখুন। AI স্বয়ংক্রিয়ভাবে বিশ্লেষণ
                করবে।
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <SymptomForm
                form={form}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center min-h-[500px]">
              <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                লক্ষণ বিশ্লেষণ এবং ঔষধের প্রস্তাবনা তৈরি করা হচ্ছে...
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Alert variant="destructive" className="w-full">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>ত্রুটি</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {!isLoading && !error && !results && (
            <Card className="shadow-lg border-border/20 bg-card/50 backdrop-blur-lg p-6 md:p-8 rounded-2xl min-h-[500px]">
              <CardHeader className="p-0 mb-4">
                <h3 className="font-semibold text-foreground/90 text-xl">
                  AI দ্বারা বিশ্লেষণ এবং প্রস্তাবনা
                </h3>
              </CardHeader>
              <CardContent className="p-0">
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <div className="text-6xl text-muted-foreground/20 mb-4">
                      <Brain />
                    </div>
                    <p className="text-muted-foreground text-center font-headline text-lg">
                      AI বিশ্লেষণের ফলাফল
                    </p>
                    <p className="text-muted-foreground/80 text-sm text-center mt-1">
                      বিশ্লেষণের ফলাফল এখানে প্রদর্শিত হবে।
                    </p>
                  </div>
              </CardContent>
            </Card>
          )}

          {results && !isLoading && !error && (
            <>
              {results.bestRepertorySuggestion && (
                <RepertorySuggestionDisplay suggestion={results.bestRepertorySuggestion} />
              )}
              {results.remedies && results.remedies.length > 0 && (
                <RemedySuggestionsDisplay remedies={results.remedies} />
              )}
              {results.categorizedSymptoms && (
                <Card className="shadow-lg border-border/20 bg-card/50 backdrop-blur-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl flex items-center gap-2">
                           <Lightbulb className="w-6 h-6 text-primary"/>
                           বিশ্লেষিত লক্ষণসমূহ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CategorizedSymptomsDisplay
                            symptoms={results.categorizedSymptoms}
                            labels={CATEGORY_LABELS}
                        />
                    </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
