
'use client';

import { Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RepertorySuggestionDisplayProps {
  suggestion: string;
}

export function RepertorySuggestionDisplay({ suggestion }: RepertorySuggestionDisplayProps) {
  return (
    <Alert className="mb-6 bg-blue-100/70 border-blue-300/80 text-blue-900 dark:bg-blue-900/30 dark:border-blue-700/50 dark:text-blue-200 shadow-md">
      <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="font-bold text-lg text-blue-800 dark:text-blue-300">রেপার্টরির পরামর্শ</AlertTitle>
      <AlertDescription className="text-blue-800/90 dark:text-blue-300/90 pt-1">
        {suggestion}
      </AlertDescription>
    </Alert>
  );
}
