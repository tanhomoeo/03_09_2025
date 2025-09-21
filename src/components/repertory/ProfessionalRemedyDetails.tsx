'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pill, Heart, Brain, Eye, User, Wind, Thermometer, 
  Star, TrendingUp, BarChart3, Info, BookOpen,
  ArrowLeft, Share2, Download, Plus, Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RemedyDetails {
  name: string;
  abbreviation: string;
  commonName?: string;
  description: string;
  sphere: string;
  constitution?: string;
  keySymptoms: string[];
  mentalSymptoms: string[];
  physicalSymptoms: string[];
  modalities: {
    worse: string[];
    better: string[];
  };
  relationships: {
    complementary?: string[];
    follows_well?: string[];
    antidote?: string[];
  };
  potencies: string[];
  source: string;
  toxicity?: string;
  proving?: string;
}

interface ProfessionalRemedyDetailsProps {
  remedyName: string;
  onClose?: () => void;
}

export const ProfessionalRemedyDetails: React.FC<ProfessionalRemedyDetailsProps> = ({ 
  remedyName, 
  onClose 
}) => {
  const [remedyData, setRemedyData] = useState<RemedyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchRemedyData = async () => {
      try {
        // Simulate API call - in real app, this would fetch from your database
        const mockData: RemedyDetails = {
          name: remedyName,
          abbreviation: remedyName.split(' ').map(word => word[0]).join('').toUpperCase(),
          commonName: getCommonName(remedyName),
          description: getRemedyDescription(remedyName),
          sphere: getRemedySphere(remedyName),
          constitution: getConstitution(remedyName),
          keySymptoms: getKeySymptoms(remedyName),
          mentalSymptoms: getMentalSymptoms(remedyName),
          physicalSymptoms: getPhysicalSymptoms(remedyName),
          modalities: getModalities(remedyName),
          relationships: getRelationships(remedyName),
          potencies: getPotencies(remedyName),
          source: getSource(remedyName),
          toxicity: getToxicity(remedyName),
          proving: getProvingInfo(remedyName)
        };
        
        setRemedyData(mockData);
      } catch (error) {
        console.error('Error fetching remedy data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRemedyData();
  }, [remedyName]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!remedyData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          No data available for {remedyName}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Pill className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{remedyData.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{remedyData.abbreviation}</Badge>
                {remedyData.commonName && (
                  <Badge variant="outline">{remedyData.commonName}</Badge>
                )}
                <Badge variant="default">{remedyData.source}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Overview Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Overview
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {remedyData.description}
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Sphere of Action</h4>
              <p className="text-sm text-muted-foreground">{remedyData.sphere}</p>
            </div>
            {remedyData.constitution && (
              <div>
                <h4 className="font-medium mb-2">Constitution</h4>
                <p className="text-sm text-muted-foreground">{remedyData.constitution}</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Symptoms
            </TabsTrigger>
            <TabsTrigger value="modalities" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Modalities
            </TabsTrigger>
            <TabsTrigger value="relationships" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Relationships
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Key Symptoms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {remedyData.keySymptoms.map((symptom, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{symptom}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Mental Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {remedyData.mentalSymptoms.map((symptom, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    Physical Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {remedyData.physicalSymptoms.map((symptom, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="symptoms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Symptom Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-purple-600">Mental & Emotional</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {remedyData.mentalSymptoms.map((symptom, index) => (
                        <Badge key={index} variant="secondary" className="justify-start">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">Physical</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {remedyData.physicalSymptoms.map((symptom, index) => (
                        <Badge key={index} variant="outline" className="justify-start">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modalities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <TrendingUp className="h-5 w-5" />
                    Worse By (Aggravation)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {remedyData.modalities.worse.map((modality, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">{modality}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="h-5 w-5 rotate-180" />
                    Better By (Amelioration)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {remedyData.modalities.better.map((modality, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{modality}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="relationships" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {remedyData.relationships.complementary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <Heart className="h-5 w-5" />
                      Complementary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {remedyData.relationships.complementary.map((remedy, index) => (
                        <Badge key={index} variant="secondary">
                          {remedy}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {remedyData.relationships.follows_well && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="h-5 w-5" />
                      Follows Well
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {remedyData.relationships.follows_well.map((remedy, index) => (
                        <Badge key={index} variant="outline">
                          {remedy}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {remedyData.relationships.antidote && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Heart className="h-5 w-5" />
                      Antidotes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {remedyData.relationships.antidote.map((remedy, index) => (
                        <Badge key={index} variant="destructive">
                          {remedy}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Available Potencies</h4>
              <div className="flex flex-wrap gap-1">
                {remedyData.potencies.map((potency, index) => (
                  <Badge key={index} variant="outline">{potency}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Source</h4>
              <Badge variant="secondary">{remedyData.source}</Badge>
            </div>
            {remedyData.toxicity && (
              <div>
                <h4 className="font-medium mb-2">Toxicity</h4>
                <Badge variant="destructive">{remedyData.toxicity}</Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mock data functions - in a real app, these would come from your database
const getCommonName = (remedyName: string): string => {
  const commonNames: { [key: string]: string } = {
    'Arsenicum album': 'Arsenic',
    'Belladonna': 'Deadly Nightshade',
    'Nux vomica': 'Poison Nut',
    'Pulsatilla nigricans': 'Wind Flower',
    'Sulphur': 'Brimstone',
    'Calcarea carbonica': 'Carbonate of Lime'
  };
  return commonNames[remedyName] || '';
};

const getRemedyDescription = (remedyName: string): string => {
  const descriptions: { [key: string]: string } = {
    'Arsenicum album': 'A profound acting remedy on every organ and tissue. Its clear-cut characteristic symptoms and correspondence to many severe types of disease make it a frequently indicated remedy.',
    'Belladonna': 'A remedy that affects the nervous system, producing active congestion, throbbing pain, and fever.',
    'Nux vomica': 'The greatest of polychrests, because the bulk of its symptoms correspond in similarity with those of many chronic diseases.',
    'Pulsatilla nigricans': 'A remedy of great variety of symptoms, often contradictory, with changeableness being the key characteristic.'
  };
  return descriptions[remedyName] || 'Comprehensive homeopathic remedy with wide-ranging therapeutic applications.';
};

const getRemedySphere = (remedyName: string): string => {
  const spheres: { [key: string]: string } = {
    'Arsenicum album': 'Affects every organ and tissue, particularly the gastrointestinal tract, respiratory system, and skin.',
    'Belladonna': 'Primarily affects the vascular system, brain, and sensory organs.',
    'Nux vomica': 'Acts prominently on the nervous system, digestive system, and liver.'
  };
  return spheres[remedyName] || 'Wide-ranging therapeutic applications across multiple body systems.';
};

const getConstitution = (remedyName: string): string => {
  const constitutions: { [key: string]: string } = {
    'Arsenicum album': 'Nervous, restless, anxious individuals with pale, sallow complexion.',
    'Belladonna': 'Plethoric, vigorous individuals with red, flushed face and bright eyes.',
    'Nux vomica': 'Thin, spare, irritable, nervous individuals with dark hair and complexion.'
  };
  return constitutions[remedyName] || '';
};

const getKeySymptoms = (remedyName: string): string[] => {
  const symptoms: { [key: string]: string[] } = {
    'Arsenicum album': [
      'Great anxiety and restlessness',
      'Burning pains relieved by heat',
      'Thirst for small sips of water',
      'Midnight aggravation',
      'Fear of death and being alone'
    ],
    'Belladonna': [
      'Sudden, violent onset',
      'Throbbing, pulsating pains',
      'Red, flushed face and hot skin',
      'Dilated pupils',
      'Sensitivity to light and noise'
    ]
  };
  return symptoms[remedyName] || ['Characteristic symptoms vary by individual case'];
};

const getMentalSymptoms = (remedyName: string[]): string[] => {
  return [
    'Anxiety and restlessness',
    'Fear of death',
    'Irritability',
    'Melancholy',
    'Mental exhaustion'
  ];
};

const getPhysicalSymptoms = (remedyName: string): string[] => {
  return [
    'Burning sensations',
    'Dryness of mucous membranes',
    'Weakness and fatigue',
    'Sleep disturbances',
    'Digestive disturbances'
  ];
};

const getModalities = (remedyName: string) => ({
  worse: ['Midnight', 'Cold', 'Alone', 'Motion', 'Noise'],
  better: ['Heat', 'Company', 'Rest', 'Warm drinks', 'Elevation']
});

const getRelationships = (remedyName: string) => ({
  complementary: ['Phosphorus', 'Sulphur', 'Thuja'],
  follows_well: ['Arnica', 'Aconite', 'Belladonna'],
  antidote: ['Camphor', 'Opium', 'China']
});

const getPotencies = (remedyName: string): string[] => {
  return ['6C', '30C', '200C', '1M', '10M'];
};

const getSource = (remedyName: string): string => {
  const sources: { [key: string]: string } = {
    'Arsenicum album': 'Mineral',
    'Belladonna': 'Plant',
    'Nux vomica': 'Plant',
    'Pulsatilla nigricans': 'Plant',
    'Sulphur': 'Mineral',
    'Calcarea carbonica': 'Mineral'
  };
  return sources[remedyName] || 'Homeopathic';
};

const getToxicity = (remedyName: string): string => {
  return 'Highly toxic in crude form, safe when potentized';
};

const getProvingInfo = (remedyName: string): string => {
  return 'Extensively proven by Hahnemann and later provers';
};