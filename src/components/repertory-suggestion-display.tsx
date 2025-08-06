
'use client';

import { Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RepertorySuggestionDisplayProps {
  suggestion: string;
}

export function RepertorySuggestionDisplay({ suggestion }: RepertorySuggestionDisplayProps) {
  return (
    <Alert className="mb-6 bg-yellow-50/70 border-yellow-200/80 text-yellow-900 shadow-inner">
      <Lightbulb className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="font-bold text-yellow-800">রেপার্টরির পরামর্শ</AlertTitle>
      <AlertDescription className="text-yellow-700">
        {suggestion}
      </AlertDescription>
    </Alert>
  );
}
