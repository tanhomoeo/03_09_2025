// Simple cache implementation without external dependencies

interface RepertoryData {
  metadata: Record<string, unknown>;
  remedies: Record<string, unknown>;
  symptomIndex: Record<string, unknown>;
  repertoryRubrics: Record<string, unknown>;
}

interface MateriaMedicaData {
  metadata: Record<string, unknown>;
  remedies: Record<string, unknown>;
  therapeuticIndex: Record<string, unknown>;
  clinicalConditions: Record<string, unknown>;
}

// Simple in-memory cache for JSON data
class HomeopathicDataCache {
  private cache = new Map<string, { data: unknown, timestamp: number }>();
  private readonly maxAge = 30 * 60 * 1000; // 30 minutes
  private readonly maxSize = 10; // Maximum cache entries

  async getRepertoryData(): Promise<RepertoryData> {
    const cacheKey = 'repertory-data';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return cached.data as RepertoryData;
    }

    try {
      const data = await this.loadRepertoryData();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      // Clean up old entries if cache is too large
      if (this.cache.size > this.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
      }
      
      return data;
    } catch (error) {
      console.error('Error loading repertory data:', error);
      return { metadata: {}, remedies: {}, symptomIndex: {}, repertoryRubrics: {} };
    }
  }

  async getMateriaMedicaData(): Promise<MateriaMedicaData> {
    const cacheKey = 'materia-medica-data';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return cached.data as MateriaMedicaData;
    }

    try {
      const data = await this.loadMateriaMedicaData();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      // Clean up old entries if cache is too large
      if (this.cache.size > this.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
      }
      
      return data;
    } catch (error) {
      console.error('Error loading materia medica data:', error);
      return { metadata: {}, remedies: {}, therapeuticIndex: {}, clinicalConditions: {} };
    }
  }

  private async loadRepertoryData(): Promise<RepertoryData> {
    // Try to load from different environments
    if (typeof window !== 'undefined') {
      // Client-side loading
      const response = await fetch('/data/homeopathic-repertory.json');
      if (!response.ok) throw new Error('Failed to fetch repertory data');
      return await response.json();
    } else {
      // Server-side loading
      const fs = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public/data/homeopathic-repertory.json');
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    }
  }

  private async loadMateriaMedicaData(): Promise<MateriaMedicaData> {
    // Try to load from different environments
    if (typeof window !== 'undefined') {
      // Client-side loading
      const response = await fetch('/data/enhanced-materia-medica.json');
      if (!response.ok) throw new Error('Failed to fetch materia medica data');
      return await response.json();
    } else {
      // Server-side loading
      const fs = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public/data/enhanced-materia-medica.json');
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    }
  }

  // Utility method to get remedy suggestions based on symptoms
  async getRemedySuggestions(symptoms: string[]): Promise<string[]> {
    const repertoryData = await this.getRepertoryData();
    const suggestions = new Set<string>();

    // Search through symptom index
    symptoms.forEach(symptom => {
      const normalizedSymptom = symptom.toLowerCase().trim();
      
      // Search in symptom index
      Object.entries(repertoryData.symptomIndex).forEach(([, categorySymptoms]) => {
        if (typeof categorySymptoms === 'object' && categorySymptoms !== null) {
          Object.entries(categorySymptoms).forEach(([symptomKey, remedies]) => {
            if (symptomKey.includes(normalizedSymptom) && Array.isArray(remedies)) {
              remedies.forEach(remedy => suggestions.add(remedy));
            }
          });
        }
      });
    });

    return Array.from(suggestions);
  }

  // Get remedy details
  async getRemedyDetails(remedyName: string): Promise<{ repertory: unknown, materiaMedica: unknown }> {
    const [repertoryData, materiaMedicaData] = await Promise.all([
      this.getRepertoryData(),
      this.getMateriaMedicaData()
    ]);

    return {
      repertory: (repertoryData.remedies as Record<string, unknown>)[remedyName],
      materiaMedica: (materiaMedicaData.remedies as Record<string, unknown>)[remedyName]
    };
  }

  // Clear cache (useful for development)
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const homeopathicDataCache = new HomeopathicDataCache();

// Export types
export type { RepertoryData, MateriaMedicaData };
