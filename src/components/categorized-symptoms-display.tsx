
'use client';

import React from 'react';
import { Brain, Stethoscope, Sparkle, Dna, Activity, Syringe, HeartPulse } from 'lucide-react';
import type { CategorizedCaseNotes } from '@/lib/types';
import { cn } from '@/lib/utils';

export const LABELS: Record<string, { title: string; subs: Record<string, string>; icon: React.ElementType }> = {
  physicalSymptoms: {
    title: "বর্তমান শারীরিক উপসর্গ",
    icon: Stethoscope,
    subs: {
      general: "সাধারণ উপসর্গ",
      gastrointestinal: "পায়খানা সংক্রান্ত সমস্যা",
      urinary: "প্রস্রাব সংক্রান্ত সমস্যা",
      femaleSpecific: "মেয়েলী সমস্যা",
      modalities: "লক্ষণের হ্রাস-বৃদ্ধি",
      locationAndNature: "লক্ষণের অবস্থান ও প্রকৃতি"
    }
  },
  mentalAndEmotionalSymptoms: {
    title: "বর্তমান মানসিক ও আবেগজনিত উপসর্গ",
    icon: Brain,
    subs: {
      fear: "ভয়",
      sadnessAndDepression: "দুঃখ, হতাশা",
      angerAndMoodSwings: "রাগ, মেজাজের পরিবর্তন",
      loneliness: "একাকীত্ব"
    }
  },
  excitingCause: {
    title: "রোগ শুরু হওয়ার কারণ",
    icon: Sparkle,
    subs: {
      weather: "আবহাওয়ার কারণে",
      diet: "খাদ্যাভ্যাসের কারণে",
      mentalTrauma: "মানসিক আঘাতের কারণে",
      accidentOrInfection: "দুর্ঘটনা বা সংক্রমণের কারণে"
    }
  },
  maintainingCause: {
    title: "রোগ স্থায়ী হওয়ার কারণ",
    icon: Activity,
    subs: {
      lifestyle: "অনিয়মিত জীবনযাপন",
      mentalStress: "অতিরিক্ত মানসিক চাপ",
      habits: "অভ্যাসগত কারণ"
    }
  },
  familyAndHereditaryHistory: {
    title: "পারিবারিক বা বংশগত ইতিহাস",
    icon: Dna,
    subs: {
      diabetes: "ডায়াবেটিস",
      highBloodPressure: "উচ্চ রক্তচাপ",
      cancer: "ক্যান্সার",
      allergies: "অ্যালার্জি"
    }
  },
  pastMedicalHistory: {
    title: "রোগীর পূর্বের রোগের ইতিহাস",
    icon: HeartPulse,
    subs: {
      majorIllnesses: "বড় কোনো পূর্বের রোগ",
      operationsOrTrauma: "অপারেশন বা ট্রমা",
      chronicIssues: "দীর্ঘমেয়াদি সমস্যা"
    }
  },
  pastTreatmentHistory: {
    title: "ওষুধের/চিকিৎসার ইতিহাস",
    icon: Syringe,
    subs: {
      previousMedication: "পূর্বে কোন ওষুধ নিয়েছে",
      treatmentSystems: "পূর্বে কোন চিকিৎসা পদ্ধতি নিয়েছেন",
      otherTreatments: "অন্য কোনো চিকিৎসা পদ্ধতি"
    }
  }
};

interface CategorizedSymptomsDisplayProps {
  symptoms: CategorizedCaseNotes;
  labels: typeof LABELS;
  showNumbers?: boolean;
  highlightedSymptoms?: string[];
}

export const CategorizedSymptomsDisplay: React.FC<CategorizedSymptomsDisplayProps> = ({ symptoms, labels, showNumbers = false, highlightedSymptoms = [] }) => {
  const categoryGradients = [
    'from-sky-100 to-blue-100 dark:from-sky-900/40 dark:to-blue-900/40',
    'from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40',
    'from-teal-100 to-green-100 dark:from-teal-900/40 dark:to-green-900/40',
    'from-lime-100 to-yellow-100 dark:from-lime-900/40 dark:to-yellow-900/40',
    'from-purple-100 to-fuchsia-100 dark:from-purple-900/40 dark:to-fuchsia-900/40',
    'from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40',
    'from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40',
  ];

  const isHighlighted = (text: string) => {
    if (!text) return false;
    return highlightedSymptoms.some(highlight => text.includes(highlight) || highlight.includes(text));
  };

  return (
    <div className="space-y-4">
      {Object.entries(labels).map(([categoryKey, categoryInfo], index) => {
        const subcategories = symptoms[categoryKey as keyof CategorizedCaseNotes];
        const hasContent = subcategories && Object.values(subcategories).some(value => typeof value === 'string' && value.trim() !== '');

        if (!hasContent) return null;

        const CategoryIcon = categoryInfo.icon;

        return (
          <div key={categoryKey} className="rounded-lg border bg-card/40 shadow-sm overflow-hidden">
            <div className={cn("p-3 bg-gradient-to-r", categoryGradients[index % categoryGradients.length])}>
                <h4 className="font-bold text-base text-slate-700 dark:text-slate-200 flex items-center">
                    {showNumbers && <span className="mr-2 text-primary/70 dark:text-primary-foreground/70 font-mono text-lg">{index + 1}.</span>}
                    <CategoryIcon className="w-5 h-5 mr-2 text-primary/80 dark:text-primary-foreground/80"/>
                    {categoryInfo.title}
                </h4>
            </div>
            <div className="p-4 space-y-2 text-sm">
              {Object.entries(subcategories!).map(([subKey, value]) => {
                if (typeof value === 'string' && value.trim() !== '') {
                  const highlight = isHighlighted(value);
                  return (
                    <div key={subKey} className={cn("grid grid-cols-3 gap-2 p-1 rounded-md", highlight && "bg-yellow-200/50 dark:bg-yellow-800/30")}>
                      <strong className="font-semibold text-foreground/80 col-span-1">{categoryInfo.subs[subKey] || subKey}:</strong> 
                      <p className="text-foreground/90 col-span-2">{value}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
