
'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
    Search, ChevronDown, ChevronRight, Dot, PlusCircle, Languages,
    Brain, User, Star, Eye, Ear, Smile, Wind, Droplet, Lung, Heart, Hand, Moon, Snowflake, Thermometer, Droplets, Bone,
    AirVent, MicVocal, UserRound
} from 'lucide-react';
import type { Chapter, Rubric, Remedy } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Dialog, DialogTrigger } from '../ui/dialog';
import { RemedyDetailsDialogContent } from './RemedyDetailsDialogContent';


type Language = 'bn' | 'en';

const gradeColorClasses: { [key: number]: string } = {
  3: 'bg-red-600 hover:bg-red-700 text-white border-red-700',
  2: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700',
  1: 'bg-gray-700 hover:bg-gray-800 text-white border-gray-800',
};

const getChapterIcon = (chapterNameEn: string): React.ReactNode => {
    const lowerCaseName = chapterNameEn.toLowerCase();
    
    const iconMap: { [key: string]: React.ElementType } = {
        mind: Brain,
        head: User,
        vertigo: Star,
        eyes: Eye,
        vision: Eye,
        ears: Ear,
        hearing: Ear,
        nose: Wind,
        face: Smile,
        mouth: Smile,
        teeth: Bone,
        throat: MicVocal,
        'external throat': MicVocal,
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
        'female genitalia': User,
        'larynx and trachea': AirVent,
        respiration: Lung,
        cough: MicVocal,
        expectoration: MicVocal,
        chest: Heart,
        back: User,
        extremities: Hand,
        sleep: Moon,
        chill: Snowflake,
        fever: Thermometer,
        perspiration: Droplets,
        skin: User,
        generalities: User,
    };

    for (const key in iconMap) {
        if (lowerCaseName.includes(key)) {
            const IconComponent = iconMap[key];
            return <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />;
        }
    }

    return <Dot className="h-4 w-4 mr-2 flex-shrink-0" />;
};

const RemedyItem: React.FC<{ remedy: Remedy }> = ({ remedy }) => (
    <Dialog>
        <DialogTrigger asChild>
             <button className={cn("flex items-center gap-1.5 text-xs bg-card p-1 px-2.5 rounded-full border shadow-sm transition-transform hover:scale-105", gradeColorClasses[remedy.grade] || 'bg-gray-500 text-white')}>
                <span>{remedy.name}</span>
                <span className="font-bold">{remedy.grade}</span>
            </button>
        </DialogTrigger>
        <RemedyDetailsDialogContent remedyName={remedy.name} />
    </Dialog>
);


const RubricItem: React.FC<{ rubric: Rubric; level?: number; lang: Language }> = ({ rubric, level = 0, lang }) => {
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
            <RubricItem key={child.id} rubric={child} level={level + 1} lang={lang} />
          ))}
          {rubric.remedies && rubric.remedies.length > 0 && (
             <div className="flex flex-wrap gap-1.5 p-2 border-l-2 ml-3 mt-1">
                 {rubric.remedies.map(remedy => (
                    <RemedyItem key={remedy.name} remedy={remedy} />
                 ))}
             </div>
          )}
        </div>
      )}
    </div>
  );
};

interface RepertoryBrowserProps {
  chapters: Chapter[];
}

const searchInRubrics = (rubrics: Rubric[], searchTerm: string, lang: Language): Rubric[] => {
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  const results: Rubric[] = [];

  const search = (rubric: Rubric) => {
    const matchedChildren = searchInRubrics(rubric.children || [], searchTerm, lang);
    const rubricName = rubric.name[lang] || rubric.name.en;
    
    if (rubricName.toLowerCase().includes(lowerCaseSearchTerm) || matchedChildren.length > 0) {
      results.push({ ...rubric, children: matchedChildren });
    }
  };

  rubrics.forEach(search);
  return results;
};


export const RepertoryBrowser: React.FC<RepertoryBrowserProps> = ({ chapters = [] }) => {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState<Language>('bn');
  
  useEffect(() => {
    if (chapters && chapters.length > 0 && !selectedChapter) {
        setSelectedChapter(chapters[0]);
    }
  }, [chapters, selectedChapter]);

  const filteredRubrics = useMemo(() => {
    if (!selectedChapter) return [];
    if (searchTerm) {
      return searchInRubrics(selectedChapter.rubrics || [], searchTerm, language);
    }
    return selectedChapter.rubrics || [];
  }, [searchTerm, selectedChapter, language]);

  const handleChapterSelect = useCallback((chapter: Chapter) => {
    setSelectedChapter(chapter);
    setSearchTerm('');
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'bn' ? 'en' : 'bn');
  };

  const chapterName = selectedChapter?.name[language] || selectedChapter?.name.en;

  return (
    <Card className="h-full w-full grid grid-cols-12 overflow-hidden shadow-lg bg-card/70 backdrop-blur-lg">
      <div className="col-span-3 border-r h-full flex flex-col">
        <div className="p-3 border-b">
            <h3 className="font-headline text-lg text-foreground">{language === 'bn' ? 'অধ্যায়' : 'Chapters'}</h3>
        </div>
        <ScrollArea className="flex-grow">
            <div className="p-2">
                {(chapters || []).map(chapter => (
                    <Button
                    key={chapter.id}
                    variant={selectedChapter?.id === chapter.id ? "secondary" : "ghost"}
                    className="w-full justify-start mb-1 text-left h-auto py-2"
                    onClick={() => handleChapterSelect(chapter)}
                    >
                    {getChapterIcon(chapter.name.en)}
                    {chapter.name[language] || chapter.name.en}
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
                filteredRubrics.map(rubric => <RubricItem key={rubric.id} rubric={rubric} lang={language} />)
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
    </Card>
  );
};
