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

const CATEGORY_ICONS: { [key: string]: React.ElementType } = {
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
  // Creating the element here. Note: This returns a ReactNode.
  // In a pure util file, importing React is fine as long as it's a .tsx file or we use React.createElement.
  // Since we use .ts (or .tsx), let's stick to .tsx for JSX support if needed, or use React.createElement.
  // But usually utils are .ts. Let's make it .tsx to be safe with JSX.
  return React.createElement(Icon, { className: "h-5 w-5" });
};

export const processCategories = (data: any): Category[] => {
    if (!data?.categories || !data?.repertory) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          frequency: 50 // Removed random for stability and performance
        })),
        prevalence: 50 // Removed random
      })),
      totalSymptoms: Object.keys(data.repertory[categoryName] || {}).length
    }));
};

export const filterRepertoryData = (
    categories: Category[],
    selectedCategory: string,
    searchTerm: string,
    filterGrade: number[],
    sortBy: 'name' | 'frequency' | 'remedies'
): Category[] => {
    // 1. Optimization: Single pass reduction
    const searchLower = searchTerm ? searchTerm.toLowerCase() : '';
    const allGradesSelected = filterGrade.length === 3;

    return categories.reduce((acc: Category[], category) => {
       // Category Filter
       if (selectedCategory !== 'all' && category.id !== selectedCategory) {
         return acc;
       }

       // Filter Symptoms
       const filteredSymptoms: Symptom[] = [];

       for (const symptom of category.symptoms) {
          // Search Check
          if (searchLower) {
             const matches = symptom.description.toLowerCase().includes(searchLower) ||
                             symptom.category.toLowerCase().includes(searchLower);
             if (!matches) continue;
          }

          // Grade Filter
          let validRemedies = symptom.remedies;
          if (!allGradesSelected) {
              validRemedies = symptom.remedies.filter(r => filterGrade.includes(r.grade));
          }

          if (validRemedies.length > 0) {
             // Clone only if remedies were filtered to preserve immutability where needed,
             // but here we are creating a new array of symptoms anyway.
             // We reuse the symptom object if remedies are not changed?
             // Actually, if we modify remedies property, we must clone symptom.

             if (validRemedies !== symptom.remedies) {
                 filteredSymptoms.push({
                   ...symptom,
                   remedies: validRemedies
                 });
             } else {
                 filteredSymptoms.push(symptom);
             }
          }
       }

       if (filteredSymptoms.length > 0) {
          // Sort
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
