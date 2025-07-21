"use client";

import React from "react";
import type { SuggestRemediesOutput } from "@/ai/flows/suggest-remedies";
import { BookText, BrainCircuit, GraduationCap, Pill, BookMarked } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Remedy = SuggestRemediesOutput['remedies'][number];

interface ResultsDisplayProps {
  results: SuggestRemediesOutput;
  onRemedyClick: (remedyName: string) => void;
}

const ScoreCircle: React.FC<{ score: number | undefined; size?: 'small' | 'large' }> = ({ score, size = 'large' }) => {
    const validScore = isNaN(score ?? NaN) ? 75 : Math.max(0, Math.min(100, score ?? 0));
    const radius = size === 'large' ? 18 : 12;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (validScore / 100) * circumference;

    let colorClass = "text-green-500";
    if (validScore < 80) colorClass = "text-yellow-500";
    if (validScore < 60) colorClass = "text-red-500";
  
    const dimensions = size === 'large' ? 'h-12 w-12' : 'h-8 w-8';
    const textClass = size === 'large' ? 'text-base' : 'text-xs';

    return (
        <div className={cn("relative flex-shrink-0", dimensions)}>
            <svg className="h-full w-full" viewBox="0 0 40 40">
                <circle
                    className="text-gray-200/80 dark:text-gray-700/80"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="20"
                    cy="20"
                />
                <circle
                    className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${colorClass}`}
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="20"
                    cy="20"
                />
            </svg>
            <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold ${textClass} ${colorClass}`}>
                {validScore}
            </span>
        </div>
    );
};


const getSourceInfo = (source: string): { icon: React.ReactNode; title: string; } => {
    switch (source) {
        case 'H': return { 
            icon: <BookText className="w-4 h-4 text-green-700" />, 
            title: "Hahnemann",
        };
        case 'B': return { 
            icon: <GraduationCap className="w-4 h-4 text-blue-700" />, 
            title: "Boericke",
        };
        case 'K': return { 
            icon: <BookMarked className="w-4 h-4 text-purple-700" />, 
            title: "Kent",
        };
        case 'AI': return { 
            icon: <BrainCircuit className="w-4 h-4 text-sky-600" />, 
            title: "AI",
        };
        default: return { 
            icon: <Pill className="w-4 h-4 text-gray-500" />, 
            title: "Unknown",
        };
    }
};

const RemedyItem: React.FC<{ remedy: Remedy; onRemedyClick: (name: string) => void }> = ({ remedy, onRemedyClick }) => {
    const { icon, title } = getSourceInfo(remedy.source);
    return (
      <Card className="shadow-md hover:shadow-lg hover:-translate-y-px transition-all duration-300 rounded-xl bg-card/60 backdrop-blur-lg border-l-4 border-l-primary/30">
        <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <Button variant="link" onClick={() => onRemedyClick(remedy.name)} className="p-0 h-auto text-lg font-bold text-foreground self-start mb-2 hover:text-primary text-left justify-start leading-tight whitespace-normal">
                       {remedy.name}
                    </Button>
                    <p className="text-foreground/80 text-sm leading-relaxed text-pretty">{remedy.description}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <ScoreCircle score={remedy.score} />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                       {icon} <span>{title}</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-border/50 pt-3 mt-4 text-xs">
                <h4 className="font-semibold text-foreground/90 mb-2">বিস্তারিত যুক্তি:</h4>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{remedy.justification}</p>
            </div>
        </CardContent>
      </Card>
    );
};

export function ResultsDisplay({ results, onRemedyClick }: ResultsDisplayProps) {
  return (
    <div className="space-y-4 h-full">
        {results.remedies.map((remedy, index) => (
            <RemedyItem key={`${remedy.name}-${index}`} remedy={remedy} onRemedyClick={onRemedyClick} />
        ))}
    </div>
  );
}
