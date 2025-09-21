'use client';
import React, { useState, useEffect } from 'react';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import { BookMarked, Loader2, Stethoscope, Search, Database, Brain, Heart, Zap } from 'lucide-react';
import { ProfessionalRepertoryBrowser } from '@/components/repertory/ProfessionalRepertoryBrowser';
import dynamic from 'next/dynamic';

const MateriaMedicaSearch = dynamic(
  () =>
    import('@/components/repertory/MateriaMedicaSearch').then(
      (m) => m.MateriaMedicaSearch,
    ),
  { ssr: false },
);

export default function RepertoryBrowserPage() {
  const [repertoryData, setRepertoryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepertoryData = async () => {
      try {
        // Try to load the enhanced database first
        const response = await fetch('/data/philosophers/enhanced-repertory-database.json');
        if (!response.ok) {
          // Fallback to original repertory data
          const fallbackResponse = await fetch('/data/repertory.json');
          if (!fallbackResponse.ok) {
            throw new Error(
              `Failed to load repertory data: ${fallbackResponse.statusText}`,
            );
          }
          const fallbackData = await fallbackResponse.json();
          setRepertoryData(fallbackData);
        } else {
          const data = await response.json();
          setRepertoryData(data);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'An unknown error occurred.';
        console.error(err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepertoryData();
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col content-auto">
      <PageHeaderCard
        title="Professional Repertory Browser"
        description="Advanced homeopathic repertory with comprehensive symptom analysis, remedy comparison, and case management tools inspired by professional homeopathic software like Radar Opus."
        actions={
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-500" />
            <Heart className="h-8 w-8 text-red-500" />
            <Zap className="h-8 w-8 text-yellow-500" />
            <Database className="h-8 w-8 text-blue-500" />
          </div>
        }
        className="bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 dark:from-blue-900/30 dark:via-purple-900/20 dark:to-indigo-900/30 flex-shrink-0"
      />

      <div className="flex-grow min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">
              Loading professional repertory database...
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-destructive">
            <p>Error loading data: {error}</p>
          </div>
        ) : (
          <ProfessionalRepertoryBrowser data={repertoryData} />
        )}
      </div>
      
      <div className="mt-6">
        <MateriaMedicaSearch />
      </div>
    </div>
  );
}