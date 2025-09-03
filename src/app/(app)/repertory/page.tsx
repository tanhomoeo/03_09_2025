'use client';
import React, { useState, useEffect } from 'react';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import { BookMarked, Loader2 } from 'lucide-react';
import { RepertoryBrowser } from '@/components/repertory/RepertoryBrowser';
import dynamic from 'next/dynamic';
const MateriaMedicaSearch = dynamic(
  () =>
    import('@/components/repertory/MateriaMedicaSearch').then(
      (m) => m.MateriaMedicaSearch,
    ),
  { ssr: false },
);
import type { Chapter } from '@/lib/types';

export default function RepertoryBrowserPage() {
  const [repertoryData, setRepertoryData] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepertoryData = async () => {
      try {
        const response = await fetch('/data/repertory.json');
        if (!response.ok) {
          throw new Error(
            `Failed to load repertory data: ${response.statusText}`,
          );
        }
        const data = await response.json();
        // The new data file is an array at its root, not an object with a 'chapters' property.
        setRepertoryData(Array.isArray(data) ? data : []);
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
        title="রেপার্টরি ব্রাউজার"
        description="অধ্যায়, রুব্রিক এবং প্রতিকার ব্রাউজ এবং অনুসন্ধান করুন।"
        actions={<BookMarked className="h-8 w-8 text-primary" />}
        className="bg-gradient-to-br from-cyan-100 to-sky-200 dark:from-cyan-900/30 dark:to-sky-900/30 flex-shrink-0"
      />

      <div className="flex-grow min-h-0 grid grid-rows-2 gap-6">
        <div className="min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">
                রেপার্টরি লোড হচ্ছে...
              </p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-destructive">
              <p>Error loading data: {error}</p>
            </div>
          ) : (
            <RepertoryBrowser chapters={repertoryData} />
          )}
        </div>
        <div>
          <MateriaMedicaSearch />
        </div>
      </div>
    </div>
  );
}
