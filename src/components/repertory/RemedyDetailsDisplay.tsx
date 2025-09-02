'use client';

import type { RemedyDetailsOutput } from '@/ai/flows/remedy-details';
import { Badge } from '@/components/ui/badge';
import { Pill, AlertTriangle, ChevronsUp, ChevronsDown, ListChecks } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function RemedyDetailsDisplay({ details }: { details: RemedyDetailsOutput }) {
  if (!details) {
    return (
      <div className="p-10 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-destructive" />
        <p className="text-lg font-semibold">কোনো তথ্য পাওয়া যায়নি</p>
        <p className="text-sm text-muted-foreground">অনুগ্রহ করে ঔষধের বানান পরীক্ষা করে আবার চেষ্টা করুন।</p>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                <Pill className="w-6 h-6" />
            </div>
            <div>
                <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl">{details.name}</CardTitle>
                    <Badge variant="outline">{details.source}</Badge>
                </div>
                <CardDescription className="mt-1">{details.description}</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            মূল লক্ষণসমূহ
          </h3>
          <ul className="space-y-2 text-muted-foreground pl-5">
            {details.keySymptoms.map((symptom, index) => (
              <li key={index} className="flex items-start gap-3">
                  <span className="text-primary mt-1.5">&bull;</span>
                  <span>{symptom}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <h3 className="font-semibold text-md mb-2 flex items-center gap-2 text-destructive">
              <ChevronsUp className="w-5 h-5" />
              বৃদ্ধি (Worse)
            </h3>
            <p className="text-muted-foreground">{details.modalities.worse}</p>
          </div>
          <div>
            <h3 className="font-semibold text-md mb-2 flex items-center gap-2 text-primary">
              <ChevronsDown className="w-5 h-5" />
              উপশম (Better)
            </h3>
            <p className="text-muted-foreground">{details.modalities.better}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
