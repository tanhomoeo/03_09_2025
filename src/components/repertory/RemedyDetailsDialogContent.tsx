'use client';

import { useEffect, useState } from 'react';
import type { RemedyDetailsOutput } from '@/ai/flows/remedy-details';
import { RemedyDetailsDisplay } from '@/components/repertory/RemedyDetailsDisplay';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RemedyDetailsDialogContentProps {
  remedyName: string;
}

export function RemedyDetailsDialogContent({
  remedyName,
}: RemedyDetailsDialogContentProps) {
  const [details, setDetails] = useState<RemedyDetailsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!remedyName) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      setDetails(null);
      try {
        const res = await fetch('/api/ai/remedy-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ remedyName }),
        });
        const result = (await res.json()) as
          | RemedyDetailsOutput
          | { error?: string };
        if (!res.ok || (result as any)?.error) {
          throw new Error(
            ((result as any)?.error as string) ||
              'No details found for this remedy.',
          );
        }
        setDetails(result as RemedyDetailsOutput);
      } catch (e) {
        console.error('Failed to fetch remedy details:', e);
        const errorMessage =
          e instanceof Error
            ? e.message
            : 'An error occurred while fetching remedy details. Please try again.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [remedyName]);

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh]">
      <ScrollArea className="max-h-[85vh] pr-6">
        <DialogHeader className="pr-6">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Materia Medica
          </DialogTitle>
          <DialogDescription>
            &quot;{remedyName}&quot; ঔষধের বিস্তারিত প্রোফাইল।
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 pr-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-10">
              <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">বিস্তারিত লোড হচ্ছে...</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>ত্রুটি</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {details && <RemedyDetailsDisplay details={details} />}
        </div>
      </ScrollArea>
    </DialogContent>
  );
}
