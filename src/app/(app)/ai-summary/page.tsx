
"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog } from "@/components/ui/dialog";
import {
  Bot,
  AlertTriangle,
  LoaderCircle,
  Wand2,
  FileText,
  Brain,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  suggestRemedies,
  type SuggestRemediesOutput,
} from "@/ai/flows/suggest-remedies";
import { SymptomForm, type SymptomFormValues } from "@/components/symptom-form";
import { ResultsDisplay } from "@/components/results-display";
import { RemedyDetailsDialogContent } from "@/components/remedy-details-dialog-content";
import { PageHeaderCard } from "@/components/shared/PageHeaderCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RepertorySuggestionDisplay } from "@/components/repertory-suggestion-display";
import {
  CategorizedSymptomsDisplay,
  LABELS as CATEGORY_LABELS,
} from "@/components/categorized-symptoms-display";

const formSchema = z.object({
  symptoms: z.string().min(10, {
    message: "অনুগ্রহ করে লক্ষণগুলি কমপক্ষে ১০টি অক্ষরে বর্ণনা করুন।",
  }),
});

export default function AiRepertoryPage() {
  const [results, setResults] = useState<SuggestRemediesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRemedy, setSelectedRemedy] = useState<string | null>(null);
  const [isRemedyDetailOpen, setIsRemedyDetailOpen] = useState(false);

  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: "",
    },
  });

  const handleStopVoiceInput = useCallback(() => {
    window.dispatchEvent(new CustomEvent("stop-voice-input"));
  }, []);

  useEffect(() => {
    if (isLoading) {
      handleStopVoiceInput();
    }
  }, [isLoading, handleStopVoiceInput]);

  function handleSubmit(values: SymptomFormValues) {
    setIsLoading(true);
    setResults(null);
    setError(null);
    setSelectedRemedy(null);

    startTransition(async () => {
      try {
        const result = await suggestRemedies({ symptoms: values.symptoms });

        if (!result) {
          throw new Error("AI কোনো সাজেশন দিতে পারেনি।");
        }
        setResults(result);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "সাজেশন আনতে একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আপনার সংযোগ বা API কী পরীক্ষা করে আবার চেষ্টা করুন।";
        setError(errorMessage);
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    });
  }

  const handleRemedyClick = (remedyName: string) => {
    setSelectedRemedy(remedyName);
    setIsRemedyDetailOpen(true);
  };

  return (
    <Dialog open={isRemedyDetailOpen} onOpenChange={setIsRemedyDetailOpen}>
      <div className="space-y-6">
        <PageHeaderCard
          title="রেপার্টরি"
          description="রোগীর লক্ষণসমূহের বিস্তারিত বিবরণ দিন এবং জেমিনি AI-এর মাধ্যমে সম্ভাব্য প্রতিকারগুলো সম্পর্কে জানুন।"
          actions={<Wand2 className="h-8 w-8 text-primary" />}
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
                  এখানে রোগীর পূর্ণাঙ্গ বিবরণ লিখুন।
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

            {results && !isLoading && !error && (
              <div className="space-y-6">
                {results.bestRepertorySuggestion && (
                  <RepertorySuggestionDisplay
                    suggestion={results.bestRepertorySuggestion}
                  />
                )}
                {results.categorizedSymptoms && (
                  <>
                    <h3 className="font-semibold text-foreground/90 mt-4 mb-2">
                      শ্রেণীবদ্ধ লক্ষণসমূহ:
                    </h3>
                    <CategorizedSymptomsDisplay
                      symptoms={results.categorizedSymptoms}
                      labels={CATEGORY_LABELS}
                      showNumbers={true}
                    />
                  </>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 shadow-lg border-border/20 bg-card/50 backdrop-blur-lg p-6 md:p-8 rounded-2xl min-h-[500px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center h-full">
                <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  লক্ষণ বিশ্লেষণ করা হচ্ছে...
                </p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <Alert variant="destructive" className="w-full">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>ত্রুটি</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {!isLoading && !error && !results && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="text-6xl text-muted-foreground/20 mb-4">
                  <Brain />
                </div>
                <p className="text-muted-foreground text-center font-headline text-lg">
                  AI বিশ্লেষণের ফলাফল
                </p>
                <p className="text-muted-foreground/80 text-sm text-center mt-1">
                  ঔষধের পরামর্শ এখানে প্রদর্শিত হবে।
                </p>
              </div>
            )}

            {results && !isLoading && !error && (
              <div className="space-y-6">
                 <h3 className="font-semibold text-foreground/90 text-xl">
                  ঔষধের পরামর্শ:
                </h3>
                <ResultsDisplay
                  results={results}
                  onRemedyClick={handleRemedyClick}
                />
              </div>
            )}
             {!isLoading &&
              !error &&
              results &&
              results.remedies.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <Alert className="w-full">
                    <Bot className="h-4 w-4" />
                    <AlertTitle>কোনো সাজেশন পাওয়া যায়নি</AlertTitle>
                    <AlertDescription>
                      বর্ণিত লক্ষণগুলির জন্য আমরা কোনও নির্দিষ্ট প্রতিকার খুঁজে
                      পাইনি। অনুগ্রহ করে বাক্যটি পুনর্গঠন করে বা আরও বিশদ বিবরণ
                      যোগ করে আবার চেষ্টা করুন।
                    </AlertDescription>
                  </Alert>
                </div>
              )}
          </div>
        </div>
      </div>

      {selectedRemedy && (
        <RemedyDetailsDialogContent remedyName={selectedRemedy} />
      )}
    </Dialog>
  );
}
