'use client';
import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
    Search, ChevronDown, ChevronRight, Dot, PlusCircle, Languages,
    BrainCircuit, Star, User, Eye, Ear, Wind, Smile, Bone, Mic, Droplet, Droplets, UserRound, AirVent, Heart, Hand, Moon, Snowflake, Thermometer, Loader2
} from 'lucide-react';
import type { Chapter, Rubric, Remedy } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Dialog } from '../ui/dialog';
import { useDebounce } from '@/hooks/use-debounce';

const RemedyDetailsDialogContent = dynamic(() =>
  import('@/components/remedy-details-dialog-content').then((mod) => mod.RemedyDetailsDialogContent),
  {
    loading: () => <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>,
    ssr: false 
  }
);


type Language = 'bn' | 'en';

const gradeColorClasses: { [key: number]: string } = {
  3: 'bg-red-600 hover:bg-red-700 text-white border-red-700',
  2: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700',
  1: 'bg-gray-700 hover:bg-gray-800 text-white border-gray-800',
};

const CHAPTER_ICONS: { [key: string]: React.ElementType } = {
  mind: BrainCircuit,
  vertigo: Star,
  head: User,
  eye: Eye,
  vision: Eye,
  ear: Ear,
  hearing: Ear,
  nose: Wind,
  face: Smile,
  mouth: Smile,
  teeth: Bone,
  throat: Mic,
  'external throat': Mic,
  stomach: Droplet,
  abdomen: Droplet,
  rectum: Dot,
  stool: Dot,
  'urinary organs': Droplet,
  bladder: Droplet,
  kidneys: Droplet,
  prostate: Droplet,
  urethra: Droplet,
  urine: Droplets,
  'male genitalia': User,
  'female genitalia': UserRound,
  larynx: AirVent,
  trachea: AirVent,
  respiration: Wind,
  cough: Mic,
  expectoration: Mic,
  chest: Heart,
  back: User,
  extremities: Hand,
  sleep: Moon,
  chill: Snowflake,
  fever: Thermometer,
  perspiration: Droplets,
  skin: User,
  generals: User,
  generalities: User,
};

const getChapterIcon = (chapterNameEn: string): React.ReactNode => {
    if (!chapterNameEn) {
        return <Dot className="h-5 w-5 mr-3 flex-shrink-0" />;
    }
    const lowerCaseName = chapterNameEn.toLowerCase();
    
    for (const key in CHAPTER_ICONS) {
        if (lowerCaseName.includes(key)) {
            const IconComponent = CHAPTER_ICONS[key];
            return <IconComponent className="h-5 w-5 mr-3 flex-shrink-0" />;
        }
    }

    return <Dot className="h-5 w-5 mr-3 flex-shrink-0" />;
};

// Optimization: Memoized Remedy Button to prevent unnecessary re-renders
const RemedyButton = React.memo<{ remedy: Remedy; onClick: (r: Remedy) => void }>(({ remedy, onClick }) => (
    <button
        className={cn("flex items-center gap-1.5 text-xs bg-card p-1 px-2.5 rounded-full border shadow-sm transition-transform hover:scale-105", gradeColorClasses[remedy.grade] || 'bg-gray-500 text-white')}
        onClick={() => onClick(remedy)}
    >
        <span>{remedy.name}</span>
        <span className="font-bold">{remedy.grade}</span>
    </button>
));
RemedyButton.displayName = 'RemedyButton';


interface RubricItemProps {
  rubric: Rubric;
  level?: number;
  lang: Language;
  onRemedyClick: (r: Remedy) => void;
}

// Optimization: Separated inner component to handle recursion properly with memoization
function RubricItemInner({ rubric, level = 0, lang, onRemedyClick }: RubricItemProps) {
  const [isOpen, setIsOpen] = useState(level < 1); // Auto-open first few levels

  const hasChildren = rubric.children && rubric.children.length > 0;
  const remedyCount = (rubric.remedies || []).length;
  const rubricName = rubric.name[lang] || rubric.name.en;

  return (
    <div style={{ paddingLeft: `${level * 1}rem` }}>
      <div
        className={cn(
          "flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer",
          isOpen && "bg-muted/40"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center min-w-0">
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
            )
          ) : (
            <Dot className="h-4 w-4 mr-1 text-muted-foreground flex-shrink-0" />
          )}
          <span className="font-medium text-sm truncate" title={rubricName}>{rubricName}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            {remedyCount > 0 && <Badge variant="secondary">{remedyCount.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</Badge>}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); /* Add to case logic here */ }}>
                <PlusCircle className="h-4 w-4 text-primary" />
            </Button>
        </div>
      </div>
      {isOpen && (
        <div className="mt-1">
          {hasChildren && rubric.children.map(child => (
            <MemoizedRubricItem key={child.id} rubric={child} level={level + 1} lang={lang} onRemedyClick={onRemedyClick} />
          ))}
          {rubric.remedies && rubric.remedies.length > 0 && (
             <div className="flex flex-wrap gap-1.5 p-2 border-l-2 ml-3 mt-1">
                 {rubric.remedies.map(remedy => (
                    <RemedyButton key={remedy.name} remedy={remedy} onClick={onRemedyClick} />
                 ))}
             </div>
          )}
        </div>
      )}
    </div>
  );
};

// Optimization: Memoize RubricItem to prevent re-renders when parent (Browser) renders but props haven't changed
const MemoizedRubricItem = React.memo(RubricItemInner);
MemoizedRubricItem.displayName = 'MemoizedRubricItem';

interface RepertoryBrowserProps {
  chapters: Chapter[];
}

const searchInRubrics = (rubrics: Rubric[] | undefined, searchTerm: string, lang: Language): Rubric[] => {
  if (!rubrics) return [];
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  const results: Rubric[] = [];

  const search = (rubric: Rubric) => {
    const matchedChildren = searchInRubrics(rubric.children, searchTerm, lang);
    const rubricName = rubric.name[lang] || rubric.name.en;
    
    if (rubricName.toLowerCase().includes(lowerCaseSearchTerm) || matchedChildren.length > 0) {
      results.push({ ...rubric, children: matchedChildren });
    }
  };

  rubrics.forEach(search);
  return results;
};


export const RepertoryBrowser: React.FC<RepertoryBrowserProps> = ({ chapters = [] }) => {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(chapters.length > 0 ? chapters[0] : null);
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState<Language>('bn');
  const [selectedRemedy, setSelectedRemedy] = useState<Remedy | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const filteredRubrics = useMemo(() => {
    if (!selectedChapter) return [];
    if (debouncedSearchTerm) {
      return searchInRubrics(selectedChapter.rubrics, debouncedSearchTerm, language);
    }
    return selectedChapter.rubrics || [];
  }, [debouncedSearchTerm, selectedChapter, language]);

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setSearchTerm('');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'bn' ? 'en' : 'bn');
  };

  // Optimization: Stable handler for remedy clicks to allow efficient memoization
  const handleRemedyClick = useCallback((remedy: Remedy) => {
    setSelectedRemedy(remedy);
  }, []);

  const chapterName = selectedChapter?.name?.[language] || selectedChapter?.name?.en;

  return (
    <Card className="h-full w-full grid grid-cols-12 overflow-hidden shadow-lg bg-card/70 backdrop-blur-lg">
      <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r h-full flex flex-col">
        <div className="p-3 border-b">
            <h3 className="font-headline text-lg text-foreground">{language === 'bn' ? 'অধ্যায়সমূহ' : 'Chapters'}</h3>
        </div>
        <ScrollArea className="flex-grow">
            <div className="p-2">
                {(chapters || []).map(chapter => {
                    if (!chapter.name) return null;
                    return (
                        <Button
                        key={chapter.id}
                        variant={selectedChapter?.id === chapter.id ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start mb-1 text-left h-auto py-2.5",
                          selectedChapter?.id === chapter.id && "bg-primary/10 text-primary"
                        )}
                        onClick={() => handleChapterSelect(chapter)}
                        >
                          <div className={cn("transition-colors", selectedChapter?.id === chapter.id ? "text-primary" : "text-muted-foreground")}>
                            {getChapterIcon(chapter.name.en)}
                          </div>
                          <span className="font-medium text-sm">{chapter.name[language] || chapter.name.en}</span>
                          <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground/50"/>
                        </Button>
                    );
                })}
            </div>
        </ScrollArea>
      </div>

      <div className="col-span-12 md:col-span-8 lg:col-span-9 h-full flex flex-col">
        <div className="p-3 border-b flex items-center gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={language === 'bn' ? `"${chapterName || ''}" অধ্যায়ে অনুসন্ধান করুন...` : `Search in "${chapterName || ''}"...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
              disabled={!selectedChapter}
            />
          </div>
          <Button variant="outline" size="icon" onClick={toggleLanguage} title={language === 'bn' ? 'Switch to English' : 'বাংলাতে পরিবর্তন করুন'}>
              <Languages className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-grow">
          <CardContent className="p-4">
            {filteredRubrics.length > 0 ? (
                filteredRubrics.map(rubric => (
                    <MemoizedRubricItem
                        key={rubric.id}
                        rubric={rubric}
                        lang={language}
                        onRemedyClick={handleRemedyClick}
                    />
                ))
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                    {searchTerm ? 
                        (language === 'bn' ? `"${searchTerm}" এর জন্য কোনো ফলাফল পাওয়া যায়নি।` : `No results found for "${searchTerm}".`) :
                        (language === 'bn' ? 'কোনো রুব্রিক পাওয়া যায়নি।' : 'No rubrics found.')
                    }
                </div>
            )}
          </CardContent>
        </ScrollArea>
      </div>

      {/* Optimization: Single Dialog instance instead of N instances */}
      <Dialog open={!!selectedRemedy} onOpenChange={(open) => !open && setSelectedRemedy(null)}>
        {/* We need to pass through the content because RemedyDetailsDialogContent renders DialogContent */}
        {selectedRemedy && <RemedyDetailsDialogContent remedyName={selectedRemedy.name} />}
      </Dialog>
    </Card>
  );
};
