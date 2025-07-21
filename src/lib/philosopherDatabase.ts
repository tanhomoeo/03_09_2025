import { homeopathicDataCache } from './homeopathicDataCache';

interface PhilosopherData {
  metadata: {
    author: string;
    title: string;
    version: string;
    totalRemedies: number;
    description: string;
    created: string;
    philosophy: string;
  };
  remedies: Record<string, any>;
  rubrics?: Record<string, any>; // Optional for Kent's repertory
}

interface RemedySuggestion {
  name: string;
  score: number;
  source: string;
  philosophy: string;
  keynotes: string[];
  justification: string;
  potency?: string;
}

class PhilosopherDatabase {
  private cache = new Map<string, PhilosopherData>();
  private readonly philosophers = ['kent', 'boericke', 'hahnemann'];
  private readonly maxAge = 30 * 60 * 1000; // 30 minutes

  async loadPhilosopherData(philosopher: string): Promise<PhilosopherData> {
    const cacheKey = `${philosopher}-data`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return cached.data;
    }

    try {
      let data: PhilosopherData;
      const filename = philosopher === 'kent' ? 'kent-repertory' : `${philosopher}-materia-medica`;

      if (typeof window !== 'undefined') {
        // Client-side loading
        const response = await fetch(`/data/philosophers/${filename}.json`);
        if (!response.ok) throw new Error(`Failed to fetch ${philosopher} data`);
        data = await response.json();
      } else {
        // Server-side loading
        const fs = await import('fs/promises');
        const path = await import('path');
        const filePath = path.join(process.cwd(), `public/data/philosophers/${filename}.json`);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        data = JSON.parse(fileContent);
      }

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Error loading ${philosopher} data:`, error);
      return {
        metadata: {
          author: philosopher,
          title: `${philosopher} Database`,
          version: '1.0',
          totalRemedies: 0,
          description: 'Database not available',
          created: new Date().toISOString(),
          philosophy: 'Classical homeopathy'
        },
        remedies: {}
      };
    }
  }

  async getAllPhilosopherData(): Promise<Record<string, PhilosopherData>> {
    const results: Record<string, PhilosopherData> = {};
    
    await Promise.all(
      this.philosophers.map(async (philosopher) => {
        results[philosopher] = await this.loadPhilosopherData(philosopher);
      })
    );

    return results;
  }

  async searchRemediesBySymptoms(symptoms: string[]): Promise<RemedySuggestion[]> {
    const allData = await this.getAllPhilosopherData();
    const suggestions: RemedySuggestion[] = [];

    // Normalize symptoms for better matching
    const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());

    for (const [philosopher, data] of Object.entries(allData)) {
      if (philosopher === 'kent' && data.rubrics) {
        // Kent repertory analysis
        suggestions.push(...this.analyzeKentRubrics(data, normalizedSymptoms, philosopher));
      } else if (data.remedies) {
        // Materia medica analysis
        suggestions.push(...this.analyzeMateriaMedica(data, normalizedSymptoms, philosopher));
      }
    }

    // Sort by score and remove duplicates
    const uniqueSuggestions = this.deduplicateAndScore(suggestions);
    return uniqueSuggestions.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  private analyzeKentRubrics(data: any, symptoms: string[], philosopher: string): RemedySuggestion[] {
    const suggestions: RemedySuggestion[] = [];
    const remedyScores = new Map<string, number>();

    if (!data.rubrics) return suggestions;

    // Analyze rubrics for symptom matches
    Object.entries(data.rubrics).forEach(([category, categoryRubrics]: [string, any]) => {
      Object.entries(categoryRubrics).forEach(([rubric, rubricData]: [string, any]) => {
        const rubricText = `${category} ${rubric}`.toLowerCase();
        
        symptoms.forEach(symptom => {
          if (rubricText.includes(symptom) || symptom.length > 4 && rubricText.includes(symptom.substring(0, 4))) {
            if (rubricData.general) {
              // Add remedies based on their grades
              rubricData.general.grade3?.forEach((remedy: string) => {
                remedyScores.set(remedy, (remedyScores.get(remedy) || 0) + 30);
              });
              rubricData.general.grade2?.forEach((remedy: string) => {
                remedyScores.set(remedy, (remedyScores.get(remedy) || 0) + 20);
              });
              rubricData.general.grade1?.forEach((remedy: string) => {
                remedyScores.set(remedy, (remedyScores.get(remedy) || 0) + 10);
              });
            }
          }
        });
      });
    });

    // Convert scores to suggestions
    remedyScores.forEach((score, remedy) => {
      const remedyData = data.remedies?.[remedy];
      suggestions.push({
        name: remedy,
        score: Math.min(score, 100),
        source: 'K',
        philosophy: data.metadata.philosophy,
        keynotes: remedyData?.keynotes || [],
        justification: `Kent's Repertory analysis - Found in multiple rubrics matching symptoms`,
        potency: this.suggestPotency(score, 'acute')
      });
    });

    return suggestions;
  }

  private analyzeMateriaMedica(data: any, symptoms: string[], philosopher: string): RemedySuggestion[] {
    const suggestions: RemedySuggestion[] = [];

    Object.entries(data.remedies).forEach(([remedyName, remedyData]: [string, any]) => {
      let matchScore = 0;
      const matchedSymptoms: string[] = [];

      // Check keynotes
      if (remedyData.keynotes) {
        remedyData.keynotes.forEach((keynote: string) => {
          symptoms.forEach(symptom => {
            if (keynote.toLowerCase().includes(symptom) || symptom.length > 4 && keynote.toLowerCase().includes(symptom.substring(0, 4))) {
              matchScore += 15;
              matchedSymptoms.push(keynote);
            }
          });
        });
      }

      // Check mind symptoms
      if (remedyData.mindSymptoms?.symptoms) {
        remedyData.mindSymptoms.symptoms.forEach((mindSymptom: string) => {
          symptoms.forEach(symptom => {
            if (mindSymptom.toLowerCase().includes(symptom)) {
              matchScore += 20; // Mental symptoms are important
              matchedSymptoms.push(mindSymptom);
            }
          });
        });
      }

      // Check modalities
      if (remedyData.modalities) {
        const modalityText = [
          ...(remedyData.modalities.worse || []),
          ...(remedyData.modalities.better || [])
        ].join(' ').toLowerCase();

        symptoms.forEach(symptom => {
          if (modalityText.includes(symptom)) {
            matchScore += 10;
            matchedSymptoms.push(`Modality: ${symptom}`);
          }
        });
      }

      if (matchScore > 0) {
        suggestions.push({
          name: remedyName,
          score: Math.min(matchScore, 100),
          source: philosopher === 'boericke' ? 'B' : 'H',
          philosophy: data.metadata.philosophy,
          keynotes: remedyData.keynotes || [],
          justification: `Matched symptoms: ${matchedSymptoms.slice(0, 3).join(', ')}${matchedSymptoms.length > 3 ? '...' : ''}`,
          potency: this.suggestPotency(matchScore, remedyData.clinicalUses ? 'chronic' : 'acute')
        });
      }
    });

    return suggestions;
  }

  private deduplicateAndScore(suggestions: RemedySuggestion[]): RemedySuggestion[] {
    const remedyMap = new Map<string, RemedySuggestion>();

    suggestions.forEach(suggestion => {
      const existing = remedyMap.get(suggestion.name);
      if (!existing || suggestion.score > existing.score) {
        remedyMap.set(suggestion.name, suggestion);
      } else if (existing && suggestion.score === existing.score) {
        // Combine sources
        existing.source = Array.from(new Set([existing.source, suggestion.source])).join(', ');
        existing.justification += ` | ${suggestion.justification}`;
      }
    });

    return Array.from(remedyMap.values());
  }

  private suggestPotency(score: number, type: 'acute' | 'chronic'): string {
    if (type === 'acute') {
      if (score >= 80) return '30C';
      if (score >= 60) return '12C';
      return '6C';
    } else {
      if (score >= 90) return '1M';
      if (score >= 70) return '200C';
      if (score >= 50) return '30C';
      return '12C';
    }
  }

  async getRemedyDetails(remedyName: string): Promise<any> {
    const allData = await this.getAllPhilosopherData();
    const details: any = {
      name: remedyName,
      sources: {}
    };

    for (const [philosopher, data] of Object.entries(allData)) {
      if (data.remedies[remedyName]) {
        details.sources[philosopher] = data.remedies[remedyName];
      }
    }

    return details;
  }

  // Get comprehensive remedy information from all sources
  async getComprehensiveRemedyInfo(remedyName: string): Promise<{
    name: string;
    sources: Record<string, any>;
    combinedKeynotes: string[];
    combinedModalities: { worse: string[]; better: string[] };
    philosophy: string[];
  }> {
    const allData = await this.getAllPhilosopherData();
    const info = {
      name: remedyName,
      sources: {} as Record<string, any>,
      combinedKeynotes: [] as string[],
      combinedModalities: { worse: [] as string[], better: [] as string[] },
      philosophy: [] as string[]
    };

    for (const [philosopher, data] of Object.entries(allData)) {
      if (data.remedies[remedyName]) {
        const remedyData = data.remedies[remedyName];
        info.sources[philosopher] = remedyData;
        
        // Combine keynotes
        if (remedyData.keynotes) {
          info.combinedKeynotes.push(...remedyData.keynotes);
        }
        
        // Combine modalities
        if (remedyData.modalities) {
          if (remedyData.modalities.worse) {
            info.combinedModalities.worse.push(...remedyData.modalities.worse);
          }
          if (remedyData.modalities.better) {
            info.combinedModalities.better.push(...remedyData.modalities.better);
          }
        }
        
        // Add philosophy
        info.philosophy.push(data.metadata.philosophy);
      }
    }

    // Remove duplicates
    info.combinedKeynotes = Array.from(new Set(info.combinedKeynotes));
    info.combinedModalities.worse = Array.from(new Set(info.combinedModalities.worse));
    info.combinedModalities.better = Array.from(new Set(info.combinedModalities.better));
    info.philosophy = Array.from(new Set(info.philosophy));

    return info;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const philosopherDatabase = new PhilosopherDatabase();

// Export types
export type { PhilosopherData, RemedySuggestion };
