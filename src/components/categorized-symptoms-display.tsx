
'use client';
import React from 'react';
import type {CategorizedCaseNotes} from '@/lib/types';
import {
  BookOpen,
  Brain,
  Heart,
  Zap,
  History,
  Shield,
  Users,
} from 'lucide-react';
import {cn} from '@/lib/utils';

export const LABELS: {
  [key in keyof CategorizedCaseNotes]-?: {
    title: string;
    icon: React.ElementType;
  };
} = {
  physicalSymptoms: {title: 'শারীরিক উপসর্গ', icon: Heart},
  mentalAndEmotionalSymptoms: {
    title: 'মানসিক ও আবেগজনিত উপসর্গ',
    icon: Brain,
  },
  excitingCause: {title: 'রোগ শুরু হওয়ার কারণ', icon: Zap},
  maintainingCause: {
    title: 'রোগ স্থায়ী হওয়ার কারণ',
    icon: Shield,
  },
  familyAndHereditaryHistory: {
    title: 'পারিবারিক ও বংশগত ইতিহাস',
    icon: Users,
  },
  pastMedicalHistory: {title: 'পূর্বের রোগের ইতিহাস', icon: History},
  pastTreatmentHistory: {title: 'পূর্বের চিকিৎসার ইতিহাস', icon: BookOpen},
};

interface CategorizedSymptomsDisplayProps {
  symptoms: CategorizedCaseNotes;
  showNumbers?: boolean;
  className?: string;
}

export function CategorizedSymptomsDisplay({
  symptoms,
  showNumbers = false,
  className,
}: CategorizedSymptomsDisplayProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Object.entries(symptoms).map(([key, value], index) => {
        const typedKey = key as keyof CategorizedCaseNotes;
        const labelInfo = LABELS[typedKey];
        
        if (!value || !labelInfo) return null;

        const { title, icon: Icon } = labelInfo;

        return (
          <div key={key}>
            <h4 className="font-semibold text-base mb-1 flex items-center gap-2">
              {showNumbers && (
                <span className="text-primary font-bold">{index + 1}.</span>
              )}
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span>{title}</span>
            </h4>
            <p className="text-sm text-muted-foreground pl-6 whitespace-pre-line">
              {value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
