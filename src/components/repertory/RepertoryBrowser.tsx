
'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, ChevronRight, Dot, PlusCircle } from 'lucide-react';
import type { Chapter, Rubric, Remedy } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface RepertoryBrowserProps {
  chapters: Chapter[];
}

const gradeColorClasses = {
  3: 'bg-red-500 text-white',
  2: 'bg-blue-500 text-white',
  1: 'bg-gray-500 text-white',
};

const RubricItem: React.FC<{ rubric: Rubric; level?: number }> = ({ rubric, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level < 1); // Auto-open first few levels

  const hasChildren = rubric.children && rubric.children.length > 0;
  const remedyCount = (rubric.remedies || []).length;

  return (
    <div style={{ paddingLeft: `${level * 1}rem` }}>
      <div
        className={cn(
          "flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer",
          isOpen && "bg-muted/40"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
            )
          ) : (
            <Dot className="h-4 w-4 mr-1 text-muted-foreground flex-shrink-0" />
          )}
          <span className="font-medium text-sm">{rubric.name}</span>
        </div>
        <div className="flex items-center gap-2">
            {remedyCount > 0 && <Badge variant="secondary">{remedyCount}</Badge>}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); /* Add to case logic here */ }}>
                <PlusCircle className="h-4 w-4 text-primary" />
            </Button>
        </div>
      </div>
      {isOpen && (
        <div className="mt-1">
          {hasChildren && rubric.children.map(child => (
            <RubricItem key={child.id} rubric={child} level={level + 1} />
          ))}
          {rubric.remedies && rubric.remedies.length > 0 && (
             <div className="flex flex-wrap gap-1 p-2 border-l-2 ml-3 mt-1">
                 {rubric.remedies.map(remedy => (
                     <div key={remedy.name} className="flex items-center gap-1.5 text-xs bg-card p-1 px-2 rounded-full border shadow-sm">
                         <span>{remedy.name}</span>
                         <span className={cn("flex items-center justify-center h-4 w-4 rounded-full text-xs font-bold", gradeColorClasses[remedy.grade])}>
                             {remedy.grade}
                         </span>
                     </div>
                 ))}
             </div>
          )}
        </div>
      )}
    </div>
  );
};

const searchInRubrics = (rubrics: Rubric[], searchTerm: string): Rubric[] => {
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  const results: Rubric[] = [];

  const search = (rubric: Rubric) => {
    const matchedChildren = searchInRubrics(rubric.children || [], searchTerm);
    
    if (rubric.name.toLowerCase().includes(lowerCaseSearchTerm) || matchedChildren.length > 0) {
      results.push({ ...rubric, children: matchedChildren });
    }
  };

  rubrics.forEach(search);
  return results;
};


export const RepertoryBrowser: React.FC<RepertoryBrowserProps> = ({ chapters }) => {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(chapters[0] || null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRubrics = useMemo(() => {
    if (searchTerm) {
      return searchInRubrics(selectedChapter?.rubrics || [], searchTerm);
    }
    return selectedChapter?.rubrics || [];
  }, [searchTerm, selectedChapter]);

  const handleChapterSelect = useCallback((chapter: Chapter) => {
    setSelectedChapter(chapter);
    setSearchTerm('');
  }, []);

  return (
    <Card className="h-full w-full grid grid-cols-12 overflow-hidden shadow-lg bg-card/70 backdrop-blur-lg">
      <div className="col-span-3 border-r h-full flex flex-col">
        <div className="p-3 border-b">
            <h3 className="font-headline text-lg text-foreground">অধ্যায়</h3>
        </div>
        <ScrollArea className="flex-grow">
            <div className="p-2">
                {chapters.map(chapter => (
                    <Button
                    key={chapter.id}
                    variant={selectedChapter?.id === chapter.id ? "secondary" : "ghost"}
                    className="w-full justify-start mb-1"
                    onClick={() => handleChapterSelect(chapter)}
                    >
                    {chapter.name}
                    </Button>
                ))}
            </div>
        </ScrollArea>
      </div>

      <div className="col-span-9 h-full flex flex-col">
        <div className="p-3 border-b flex items-center gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={`"${selectedChapter?.name || ''}" অধ্যায়ে অনুসন্ধান করুন...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          <CardContent className="p-4">
            {filteredRubrics.length > 0 ? (
                filteredRubrics.map(rubric => <RubricItem key={rubric.id} rubric={rubric} />)
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                    {searchTerm ? `"${searchTerm}" এর জন্য কোনো ফলাফল পাওয়া যায়নি।` : "কোনো রুব্রিক পাওয়া যায়নি।"}
                </div>
            )}
          </CardContent>
        </ScrollArea>
      </div>
    </Card>
  );
};
