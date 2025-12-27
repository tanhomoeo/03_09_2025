'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Filter, Grid, List, Star, Brain, Eye, User,
  Wind, Mic, Droplets, Moon, Thermometer, Zap,
  Plus, Minus,
  BarChart3, PieChart, TrendingUp, BookOpen, Save, Share2,
  Download, X, Bone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import dynamic from 'next/dynamic';
import { useDebounce } from '@/hooks/use-debounce';

const ProfessionalRemedyDetails = dynamic(() =>
  import('./ProfessionalRemedyDetails').then((mod) => mod.ProfessionalRemedyDetails),
  {
    loading: () => <div className="flex items-center justify-center p-4">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
    </div>,
    ssr: false 
  }
);

interface Remedy {
  name: string;
  grade: number;
  frequency?: number;
}

interface Symptom {
  id: string;
  category: string;
  description: string;
  remedies: Remedy[];
  children?: Symptom[];
  prevalence?: number;
}

interface ProfessionalRepertoryBrowserProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export const ProfessionalRepertoryBrowser: React.FC<ProfessionalRepertoryBrowserProps> = ({ data }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'analytical'>('list');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'frequency' | 'remedies'>('name');
  const [filterGrade, setFilterGrade] = useState<number[]>([1, 2, 3]);
  const [showFilters, setShowFilters] = useState(false);

  // Process the enhanced database data
  const categories = useMemo(() => {
    if (!data?.categories || !data?.repertory) return [];
    
    return data.categories.map((categoryName: string) => ({
      id: categoryName.toLowerCase().replace(/\s+/g, '-'),
      name: categoryName,
      icon: getCategoryIcon(categoryName),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      symptoms: Object.entries(data.repertory[categoryName] || {}).map(([description, remedies]: [string, any]) => ({
        id: `${categoryName}-${description}`,
        category: categoryName,
        description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remedies: remedies.map((r: any) => ({
          name: r.remedy,
          grade: r.grade || 1,
          frequency: Math.floor(Math.random() * 100) + 1
        })),
        prevalence: Math.floor(Math.random() * 100) + 1
      })),
      totalSymptoms: Object.keys(data.repertory[categoryName] || {}).length
    }));
  }, [data]);

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = categories;

    // Category filter
    if (selectedCategory !== 'all') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered = filtered.filter((cat: any) => cat.id === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered = filtered.map((category: any) => ({
        ...category,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        symptoms: category.symptoms.filter((symptom: any) =>
          symptom.description.toLowerCase().includes(searchLower) ||
          symptom.category.toLowerCase().includes(searchLower)
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })).filter((category: any) => category.symptoms.length > 0);
    }

    // Grade filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filtered = filtered.map((category: any) => ({
      ...category,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      symptoms: category.symptoms.map((symptom: any) => ({
        ...symptom,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remedies: symptom.remedies.filter((remedy: any) => filterGrade.includes(remedy.grade))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })).filter((symptom: any) => symptom.remedies.length > 0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })).filter((category: any) => category.symptoms.length > 0);

    // Sort symptoms
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filtered = filtered.map((category: any) => ({
      ...category,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      symptoms: [...category.symptoms].sort((a: any, b: any) => {
        switch (sortBy) {
          case 'frequency':
            return (b.prevalence || 0) - (a.prevalence || 0);
          case 'remedies':
            return b.remedies.length - a.remedies.length;
          default:
            return a.description.localeCompare(b.description);
        }
      })
    }));

    return filtered;
  }, [categories, selectedCategory, debouncedSearchTerm, filterGrade, sortBy]);

  const toggleSymptomSelection = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const getCategoryIcon = (categoryName: string): React.ReactNode => {
    const icons: { [key: string]: React.ReactNode } = {
      'Mind': <Brain className="h-5 w-5" />,
      'Head': <User className="h-5 w-5" />,
      'Eye': <Eye className="h-5 w-5" />,
      'Respiration': <Wind className="h-5 w-5" />,
      'Cough': <Mic className="h-5 w-5" />,
      'Fever': <Thermometer className="h-5 w-5" />,
      'Skin': <User className="h-5 w-5" />,
      'Sleep': <Moon className="h-5 w-5" />,
      'Gastric': <Droplets className="h-5 w-5" />,
      'Urinary': <Droplets className="h-5 w-5" />,
      'Pain': <Zap className="h-5 w-5" />,
      'Arthritis': <Bone className="h-5 w-5" />
    };
    return icons[categoryName] || <Star className="h-5 w-5" />;
  };

  const getRemedyColor = (grade: number): string => {
    const colors = {
      1: 'bg-gray-500 hover:bg-gray-600',
      2: 'bg-blue-600 hover:bg-blue-700', 
      3: 'bg-red-600 hover:bg-red-700'
    };
    return colors[grade as keyof typeof colors] || colors[1];
  };

  const SymptomCard: React.FC<{ symptom: Symptom }> = ({ symptom }) => {
    const isSelected = selectedSymptoms.includes(symptom.id);

    return (
      <Card className={cn(
        "transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {getCategoryIcon(symptom.category)}
              <span>{symptom.description}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {symptom.remedies.length} remedies
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleSymptomSelection(symptom.id)}
              >
                {isSelected ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {symptom.remedies.slice(0, 8).map((remedy, idx) => (
              <Dialog key={idx}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-6 px-2 text-xs rounded-full",
                      getRemedyColor(remedy.grade)
                    )}
                  >
                    <span className="text-white">{remedy.name}</span>
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                      {remedy.grade}
                    </Badge>
                  </Button>
                </DialogTrigger>
                <ProfessionalRemedyDetails remedyName={remedy.name} />
              </Dialog>
            ))}
            {symptom.remedies.length > 8 && (
              <Badge variant="outline" className="h-6 px-2 text-xs">
                +{symptom.remedies.length - 8} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const AnalyticalView: React.FC = () => {
    const analysisData = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allSymptoms = filteredData.flatMap((cat: any) => cat.symptoms);
      const remedyFrequency: { [key: string]: number } = {};
      const gradeDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0 };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allSymptoms.forEach((symptom: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        symptom.remedies.forEach((remedy: any) => {
          remedyFrequency[remedy.name] = (remedyFrequency[remedy.name] || 0) + 1;
          gradeDistribution[remedy.grade] = (gradeDistribution[remedy.grade] || 0) + 1;
        });
      });
    });

    const topRemedies = Object.entries(remedyFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

      return { topRemedies, gradeDistribution, totalSymptoms: allSymptoms.length };
    }, []);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Remedies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
            {analysisData.topRemedies.map(([remedy, count]) => (
                <div key={remedy} className="flex items-center justify-between">
                  <span className="text-sm">{remedy}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analysisData.gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="flex items-center justify-between">
                  <span className="text-sm">Grade {grade}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Symptoms</span>
                <Badge variant="secondary">{analysisData.totalSymptoms}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Grade Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(analysisData.gradeDistribution).map(([grade, count]) => (
              <div key={grade} className="flex items-center justify-between">
                <span className="text-sm">Grade {grade}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Total Symptoms</span>
              <Badge variant="secondary">{analysisData.totalSymptoms}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Selected Symptoms</span>
              <Badge variant="secondary">{selectedSymptoms.length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                Professional Repertory Browser
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Advanced homeopathic symptom analysis and remedy selection
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Case
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}  
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search symptoms, remedies, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* View mode */}  
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'analytical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('analytical')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters */}  
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Expanded filters */}  
          {showFilters && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Grade Filter</label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(grade => (
                      <Button
                        key={grade}
                        variant={filterGrade.includes(grade) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setFilterGrade(prev => 
                            prev.includes(grade) 
                              ? prev.filter(g => g !== grade)
                              : [...prev, grade]
                          );
                        }}
                      >
                        Grade {grade}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <select
                    value={sortBy}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="name">Name</option>
                    <option value="frequency">Frequency</option>
                    <option value="remedies">Remedy Count</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">All Categories</option>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main content */}  
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories */}  
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid className="h-5 w-5" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-1">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory('all')}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    All Categories
                    <Badge variant="secondary" className="ml-auto">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {categories.reduce((sum: any, cat: any) => sum + cat.totalSymptoms, 0)}
                    </Badge>
                  </Button>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {categories.map((category: any) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.icon}
                      <span className="ml-2">{category.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {category.totalSymptoms}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}  
        <div className="lg:col-span-3">
          {viewMode === 'analytical' ? (
            analyticalView
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Symptoms & Remedies</span>
                  <Badge variant="secondary">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {filteredData.reduce((sum: any, cat: any) => sum + cat.symptoms.length, 0)} symptoms
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className={cn(
                    "gap-4",
                    viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2' : 'space-y-4'
                  )}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {filteredData.map((category: any) =>
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      category.symptoms.map((symptom: any) => (
                        <SymptomCard key={symptom.id} symptom={symptom} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Selected symptoms summary */}  
      {selectedSymptoms.length > 0 && (
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Symptoms Analysis</span>
              <Badge variant="default">{selectedSymptoms.length} selected</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map(symptomId => {
                const symptom = filteredData
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .flatMap((cat: any) => cat.symptoms)
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .find((s: any) => s.id === symptomId);
                return symptom ? (
                  <Badge key={symptomId} variant="secondary" className="text-sm">
                    {symptom.description}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-2"
                      onClick={() => toggleSymptomSelection(symptomId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};