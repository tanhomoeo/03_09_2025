
'use client';
import React from 'react';
import {
  MapPin,
  Sparkle,
  HeartPulse,
  GitCompareArrows,
  Puzzle,
  Brain,
  History,
  AlertTriangle,
} from 'lucide-react';
import type { ComplaintAnalyzerOutput } from '@/ai/flows/complaint-analyzer-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type CategoryKey = keyof ComplaintAnalyzerOutput;

const CATEGORY_META: Record<
  CategoryKey,
  {
    title: string;
    icon: React.ElementType;
    color: string; // Tailwind class for background
    textColor: string;
  }
> = {
  location: { title: 'অবস্থান', icon: MapPin, color: 'bg-blue-100 dark:bg-blue-900/40', textColor: 'text-blue-800 dark:text-blue-300' },
  causation: { title: 'কারণ', icon: Sparkle, color: 'bg-green-100 dark:bg-green-900/40', textColor: 'text-green-800 dark:text-green-300' },
  sensation: { title: 'অনুভূতি', icon: HeartPulse, color: 'bg-purple-100 dark:bg-purple-900/40', textColor: 'text-purple-800 dark:text-purple-300' },
  modalities: { title: 'হ্রাস/বৃদ্ধি', icon: GitCompareArrows, color: 'bg-yellow-100 dark:bg-yellow-900/40', textColor: 'text-yellow-800 dark:text-yellow-300' },
  concomitant: { title: 'সহগামী লক্ষণ', icon: Puzzle, color: 'bg-orange-100 dark:bg-orange-900/40', textColor: 'text-orange-800 dark:text-orange-300' },
  generalities: { title: 'সামগ্রিক বৈশিষ্ট্য', icon: Brain, color: 'bg-amber-100 dark:bg-amber-900/40', textColor: 'text-amber-800 dark:text-amber-300' },
  pastHistory: { title: 'অতীত ইতিহাস', icon: History, color: 'bg-gray-100 dark:bg-gray-900/40', textColor: 'text-gray-800 dark:text-gray-300' },
};

const LABEL_MAP: Record<string, string> = {
  general: 'সাধারণ',
  srp: 'Peculiarity (SRP)',
  aggravation: 'বৃদ্ধি (Aggravation)',
  amelioration: 'উপশম (Amelioration)',
  physical: 'শারীরিক (Physical)',
  mental: 'মানসিক (Mental)',
  disease: 'রোগের ইতিহাস',
  personal: 'ব্যক্তিগত ইতিহাস',
  family: 'পারিবারিক ইতিহাস',
  treatment: 'চিকিৎসার ইতিহাস',
};

interface AnalysisResultDisplayProps {
  result: ComplaintAnalyzerOutput;
}

export function AnalysisResultDisplay({ result }: AnalysisResultDisplayProps) {

  return (
    <div className="space-y-4">
      {Object.entries(result).map(([category, data]) => {
        const categoryKey = category as CategoryKey;
        const meta = CATEGORY_META[categoryKey];
        if (!meta) return null;

        const hasContent = Object.values(data).some(value => value && String(value).trim() !== '');
        if (!hasContent) return null;

        return (
          <Card key={categoryKey} className={cn('overflow-hidden shadow-md border-border/30', meta.color)}>
            <CardHeader className={cn("p-3 border-b border-black/10 dark:border-white/10")}>
              <CardTitle className={cn("flex items-center gap-2 text-md font-bold", meta.textColor)}>
                <meta.icon className="h-5 w-5" />
                {meta.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm space-y-2 text-foreground/90">
              {Object.entries(data).map(([key, value]) => {
                if (!value || typeof value !== 'string' || !value.trim()) return null;

                const isSrp = key === 'srp';
                return (
                  <div
                    key={key}
                    className={cn(
                      "p-2 rounded-md",
                      isSrp ? 'bg-red-100/60 dark:bg-red-900/30 border border-red-500/50' : 'bg-background/30'
                    )}
                  >
                    <strong className={cn("block mb-0.5", isSrp ? 'font-bold text-red-700 dark:text-red-300 flex items-center gap-1.5' : 'font-semibold text-muted-foreground')}>
                       {isSrp && <AlertTriangle className="h-4 w-4" />}
                       {LABEL_MAP[key] || key}
                    </strong>
                    <p className={cn(isSrp ? 'font-semibold' : '')}>{value}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
