import React from 'react';
import {
  Brain, User, Eye, Wind, Mic, Thermometer, Moon, Droplets, Zap, Bone, Star
} from 'lucide-react';

export interface Remedy {
  name: string;
  grade: number;
  frequency?: number;
}

export interface Symptom {
  id: string;
  category: string;
  description: string;
  remedies: Remedy[];
  children?: Symptom[];
  prevalence?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  symptoms: Symptom[];
  totalSymptoms: number;
}

export const CATEGORY_ICONS: { [key: string]: React.ElementType } = {
  'Mind': Brain,
  'Head': User,
  'Eye': Eye,
  'Respiration': Wind,
  'Cough': Mic,
  'Fever': Thermometer,
  'Skin': User,
  'Sleep': Moon,
  'Gastric': Droplets,
  'Urinary': Droplets,
  'Pain': Zap,
  'Arthritis': Bone
};

export const REMEDY_COLORS = {
  1: "bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200",
  2: "bg-blue-50 text-blue-700 border-blue-200 italic hover:bg-blue-100",
  3: "bg-red-50 text-red-700 border-red-200 font-bold hover:bg-red-100"
} as const;

export const getCategoryIcon = (categoryName: string): React.ReactNode => {
  const Icon = CATEGORY_ICONS[categoryName] || Star;
  return <Icon className="h-5 w-5" />;
};

export const getRemedyColor = (grade: number): string => {
  return REMEDY_COLORS[grade as keyof typeof REMEDY_COLORS] || REMEDY_COLORS[1];
};

export const filterRepertoryData = (
  categories: Category[],
  selectedCategory: string,
  debouncedSearchTerm: string,
  filterGrade: number[],
  sortBy: 'name' | 'frequency' | 'remedies'
): Category[] => {
  const searchLower = debouncedSearchTerm.toLowerCase();

  return categories.reduce((acc: Category[], category) => {
    // 1. Category Filter
    if (selectedCategory !== 'all' && category.id !== selectedCategory) {
      return acc;
    }

    // 2. Filter Symptoms (Search + Grade)
    const filteredSymptoms = category.symptoms.reduce((symptomAcc: Symptom[], symptom) => {
      // Search Filter
      const matchesSearch = !debouncedSearchTerm ||
        symptom.description.toLowerCase().includes(searchLower) ||
        symptom.category.toLowerCase().includes(searchLower);

      if (!matchesSearch) return symptomAcc;

      // Grade Filter
      const filteredRemedies = symptom.remedies.filter(remedy =>
        filterGrade.includes(remedy.grade)
      );

      if (filteredRemedies.length > 0) {
        symptomAcc.push({
          ...symptom,
          remedies: filteredRemedies
        });
      }

      return symptomAcc;
    }, []);

    if (filteredSymptoms.length > 0) {
      // 3. Sort Symptoms
      filteredSymptoms.sort((a, b) => {
        switch (sortBy) {
          case 'frequency':
            return (b.prevalence || 0) - (a.prevalence || 0);
          case 'remedies':
            return b.remedies.length - a.remedies.length;
          default:
            return a.description.localeCompare(b.description);
        }
      });

      acc.push({
        ...category,
        symptoms: filteredSymptoms
      });
    }

    return acc;
  }, []);
};
