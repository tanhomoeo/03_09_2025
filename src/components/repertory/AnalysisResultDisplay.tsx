'use client';
import React from 'react';
import {
  MapPin,
  Sparkle,
  HeartPulse,
  Link as LinkIcon,
  Brain,
  Pill,
  Lightbulb,
  Beaker,
  ShieldAlert,
} from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const CATEGORY_META = {
  Locations: {
    title: 'স্থান (Locations)',
    icon: MapPin,
    color: 'blue',
  },
  Causations: {
    title: 'কারণ (Causations)',
    icon: Sparkle,
    color: 'green',
  },
  Sensations: {
    title: 'অনুভূতি (Sensations)',
    icon: HeartPulse,
    color: 'purple',
  },
  Concomitants: {
    title: 'সহগামী লক্ষণ (Concomitants)',
    icon: LinkIcon,
    color: 'orange',
  },
  Mental: {
    title: 'মানসিক অবস্থা (Mental)',
    icon: Brain,
    color: 'amber',
  },
} as const;

type CategoryKey = keyof typeof CATEGORY_META;

interface AnalysisResultDisplayProps {
  result: AnalysisResult;
}

const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ result }) => {
  const { categorizedSymptoms, remedySuggestions } = result;
  const suggestion = remedySuggestions?.[0];

  const renderSymptomCategory = (category: CategoryKey) => {
    const symptoms = categorizedSymptoms[category];
    const meta = CATEGORY_META[category];
    if (!symptoms || symptoms.length === 0) return null;

    return (
      <Card
        key={category}
        className={`bg-${meta.color}-50/50 dark:bg-${meta.color}-900/10 border-${meta.color}-200 dark:border-${meta.color}-800/50 shadow-sm transition-all hover:shadow-md hover:border-${meta.color}-300 dark:hover:border-${meta.color}-700`}
      >
        <CardHeader className="p-3">
          <CardTitle
            className={`flex items-center text-sm font-semibold text-${meta.color}-700 dark:text-${meta.color}-300`}
          >
            <meta.icon className="h-4 w-4 mr-2" />
            {meta.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 text-sm">
          <ul className="list-disc list-inside space-y-1">
            {symptoms.map((symptom, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {symptom}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 rounded-lg bg-gray-50/80 dark:bg-gray-900/20 p-4 border border-gray-200 dark:border-gray-800 shadow-inner">
      <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-200">
        AI সহকারী দ্বারা বিশ্লেষণ
      </h2>

      <div>
        <h3 className="font-semibold text-lg mb-3 text-gray-700 dark:text-gray-300">শ্রেণীবদ্ধ লক্ষণসমূহ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.keys(categorizedSymptoms).map((key) => renderSymptomCategory(key as CategoryKey))}
        </div>
      </div>

      {suggestion && (
        <div>
          <h3 className="font-semibold text-lg mb-3 text-gray-700 dark:text-gray-300 pt-4 border-t border-gray-200 dark:border-gray-700/50">প্রস্তাবিত ঔষধ</h3>
          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/40 dark:to-gray-900/30 shadow-lg border-gray-200 dark:border-gray-700/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Pill className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">
                  {suggestion.remedyName}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400">
                <h4 className="font-semibold flex items-center text-blue-800 dark:text-blue-300">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  নির্বাচনের কারণ (Reasoning)
                </h4>
                <p className="mt-1 text-gray-700 dark:text-gray-300 text-sm">
                  {suggestion.reasoning}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400">
                     <h4 className="font-semibold flex items-center text-green-800 dark:text-green-300">
                        <Beaker className="h-5 w-5 mr-2" />
                        প্রস্তাবিত মাত্রা (Dosage)
                    </h4>
                     <div className="mt-2 text-sm space-y-2">
                        <p><strong>Centesimal:</strong> <Badge variant="outline">{suggestion.dosage.centesimal}</Badge></p>
                        <p><strong>Millesimal:</strong> <Badge variant="outline">{suggestion.dosage.millesimal}</Badge></p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400">
                     <h4 className="font-semibold flex items-center text-yellow-800 dark:text-yellow-300">
                        <ShieldAlert className="h-5 w-5 mr-2" />
                        সতর্কতা (Precautions)
                    </h4>
                     <p className="mt-1 text-gray-700 dark:text-gray-300 text-sm">
                       {suggestion.precautions}
                     </p>
                  </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnalysisResultDisplay;
