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
  icon?: React.ReactNode;
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

export const getCategoryIcon = (categoryName: string): React.ReactNode => {
  const Icon = CATEGORY_ICONS[categoryName] || Star;
  return <Icon className="h-5 w-5" />;
};

export const REMEDY_COLORS = {
  3: 'bg-red-600 hover:bg-red-700 text-white border-red-700',
  2: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700',
  1: 'bg-gray-700 hover:bg-gray-800 text-white border-gray-800',
} as const;

export const filterRepertoryData = (
  categories: Category[],
  selectedCategory: string,
  searchTerm: string,
  filterGrade: number[],
  sortBy: 'name' | 'frequency' | 'remedies'
): Category[] => {
  const searchLower = searchTerm ? searchTerm.toLowerCase() : '';

  return categories.reduce((acc: Category[], category: Category) => {
    // 1. Category Filter (Early return)
    if (selectedCategory !== 'all' && category.id !== selectedCategory) {
      return acc;
    }

    // Process symptoms
    const filteredSymptoms = category.symptoms.reduce((symAcc: Symptom[], symptom: Symptom) => {
      // 2. Search Filter (Check if symptom matches)
      const matchesSearch = !searchLower ||
        symptom.description.toLowerCase().includes(searchLower) ||
        symptom.category.toLowerCase().includes(searchLower);

      if (!matchesSearch) return symAcc;

      // 3. Grade Filter (Filter remedies)
      const filteredRemedies = symptom.remedies.filter((remedy: Remedy) =>
        filterGrade.includes(remedy.grade)
      );

      if (filteredRemedies.length > 0) {
        symAcc.push({
          ...symptom,
          remedies: filteredRemedies
        });
      }

      return symAcc;
    }, []);

    // 4. Sort Symptoms (Only if we have symptoms)
    if (filteredSymptoms.length > 0) {
      filteredSymptoms.sort((a: Symptom, b: Symptom) => {
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
