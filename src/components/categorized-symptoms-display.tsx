
'use client';

import React from 'react';
import { Brain, Stethoscope, Sparkle, Dna, Activity, Syringe, HeartPulse } from 'lucide-react';
import type { CategorizedCaseNotes } from '@/lib/types';

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
    title: "রোগ শুরু হওয়ার কারণ (Exciting Cause)",
    icon: Sparkle,
    subs: {
      weather: "আবহাওয়ার কারণে",
      diet: "খাদ্যাভ্যাসের কারণে",
      mentalTrauma: "মানসিক আঘাতের কারণে",
      accidentOrInfection: "দুর্ঘটনা বা সংক্রমণের কারণে"
    }
  },
  maintainingCause: {
    title: "রোগ স্থায়ী হওয়ার কারণ (Maintaining Cause)",
    icon: Activity,
    subs: {
      lifestyle: "অনিয়মিত জীবনযাপন",
      mentalStress: "অতিরিক্ত মানসিক চাপ",
      habits: "অভ্যাসগত কারণ"
    }
  },
  familyAndHereditaryHistory: {
    title: "পারিবারিক বা বংশগত ইতিহাস (Miasm)",
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
}

export const CategorizedSymptomsDisplay: React.FC<CategorizedSymptomsDisplayProps> = ({ symptoms, labels, showNumbers = false }) => {
  return (
    <div className="space-y-4">
      {Object.entries(labels).map(([categoryKey, categoryInfo], index) => {
        const subcategories = symptoms[categoryKey as keyof CategorizedCaseNotes];
        const hasContent = subcategories && Object.values(subcategories).some(value => typeof value === 'string' && value.trim() !== '');

        if (!hasContent) return null;

        const CategoryIcon = categoryInfo.icon;

        return (
          <div key={categoryKey} className="rounded-lg border bg-card/50 p-3">
            <h4 className="font-bold text-sm text-foreground mb-2 flex items-center">
              {showNumbers && <span className="mr-2 text-primary font-mono">{index + 1}.</span>}
              <CategoryIcon className="w-4 h-4 mr-2 text-primary"/>
              {categoryInfo.title}
            </h4>
            <div className="space-y-1 text-xs text-muted-foreground pl-2 border-l-2 ml-2">
              {Object.entries(subcategories!).map(([subKey, value]) => {
                if (typeof value === 'string' && value.trim() !== '') {
                  return (
                    <p key={subKey}>
                      <strong className="font-semibold text-foreground/80">{categoryInfo.subs[subKey] || subKey}:</strong> {value}
                    </p>
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
