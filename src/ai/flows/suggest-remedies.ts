
'use server';

/**
 * @fileOverview Suggests homeopathic remedies based on user-provided symptoms.
 *
 * - suggestRemedies - A function that takes a symptom inputs and returns a ranked list of potential homeopathic medicine suggestions.
 * - SuggestRemediesInput - The input type for the suggestRemedies function.
 * - SuggestRemediesOutput - The return type for the suggestRemedies function.
 */
import { ai } from '../genkit';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const SuggestRemediesInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A detailed description of the symptoms experienced by the user in Bengali.'),
});
export type SuggestRemediesInput = z.infer<typeof SuggestRemediesInputSchema>;

const CategorizedSymptomsSchema = z.object({
  physicalSymptoms: z.object({
    general: z.string().optional().describe("সাধারণ উপসর্গ যেমন মাথাব্যথা, জ্বর, দুর্বলতা।"),
    gastrointestinal: z.string().optional().describe("পায়খানা সংক্রান্ত সমস্যা যেমন কোষ্ঠকাঠিন্য, পাতলা পায়খানা, মলে রক্ত।"),
    urinary: z.string().optional().describe("প্রস্রাব সংক্রান্ত সমস্যা যেমন বারবার প্রস্রাব, জ্বালাপোড়া।"),
    femaleSpecific: z.string().optional().describe("মেয়েলী সমস্যা যেমন অনিয়মিত মাসিক, সাদা স্রাব।"),
    modalities: z.string().optional().describe("লক্ষণের হ্রাস-বৃদ্ধি (কখন বাড়ে বা কমে)।"),
    locationAndNature: z.string().optional().describe("লক্ষণের অবস্থান ও প্রকৃতি (কোন অংশে, কেমন ব্যথা)।")
  }).describe("বর্তমান শারীরিক উপসর্গ"),
  mentalAndEmotionalSymptoms: z.object({
    fear: z.string().optional().describe("ভয় সম্পর্কিত বিবরণ।"),
    sadnessAndDepression: z.string().optional().describe("দুঃখ, হতাশা সম্পর্কিত বিবরণ।"),
    angerAndMoodSwings: z.string().optional().describe("রাগ, মেজাজের পরিবর্তন সম্পর্কিত বিবরণ।"),
    loneliness: z.string().optional().describe("একাকীত্ব সম্পর্কিত বিবরণ।")
  }).describe("বর্তমান মানসিক ও আবেগজনিত উপসর্গ"),
  excitingCause: z.object({
    weather: z.string().optional().describe("আবহাওয়ার কারণে রোগ শুরু।"),
    diet: z.string().optional().describe("খাদ্যাভ্যাসের কারণে রোগ শুরু।"),
    mentalTrauma: z.string().optional().describe("মানসিক আঘাতের কারণে রোগ শুরু।"),
    accidentOrInfection: z.string().optional().describe("দুর্ঘটনা বা সংক্রমণের কারণে রোগ শুরু।")
  }).describe("রোগ শুরু হওয়ার কারণ (Exciting Cause)"),
  maintainingCause: z.object({
    lifestyle: z.string().optional().describe("অনিয়মিত জীবনযাপন।"),
    mentalStress: z.string().optional().describe("অতিরিক্ত মানসিক চাপ।"),
    habits: z.string().optional().describe("অভ্যাসগত কারণ।")
  }).describe("রোগ স্থায়ী হওয়ার কারণ (Maintaining Cause)"),
  familyAndHereditaryHistory: z.object({
    diabetes: z.string().optional().describe("ডায়াবেটিস সম্পর্কিত পারিবারিক ইতিহাস।"),
    highBloodPressure: z.string().optional().describe("উচ্চ রক্তচাপ সম্পর্কিত পারিবারিক ইতিহাস।"),
    cancer: z.string().optional().describe("ক্যান্সার সম্পর্কিত পারিবারিক ইতিহাস।"),
    allergies: z.string().optional().describe("অ্যালার্জি সম্পর্কিত পারিবারিক ইতিহাস।")
  }).describe("পারিবারিক বা বংশগত ইতিহাস (Hereditary Cause / Miasm)"),
  pastMedicalHistory: z.object({
    majorIllnesses: z.string().optional().describe("রোগীর বড় কোনো পূর্বের রোগের বিবরণ।"),
    operationsOrTrauma: z.string().optional().describe("রোগীর পূর্বের কোনো অপারেশন বা ট্রমার বিবরণ।"),
    chronicIssues: z.string().optional().describe("রোগীর দীর্ঘমেয়াদি কোনো সমস্যার বিবরণ।")
  }).describe("রোগীর পূর্বের রোগের ইতিহাস"),
  pastTreatmentHistory: z.object({
    previousMedication: z.string().optional().describe("রোগী পূর্বে কোন কোন ওষুধ নিয়েছে তার বিবরণ।"),
    treatmentSystems: z.string().optional().describe("পূর্বে কোন চিকিৎসা পদ্ধতি (হোমিওপ্যাথি/অ্যালোপ্যাথি/আয়ুর্বেদ) নিয়েছেন।"),
    otherTreatments: z.string().optional().describe("অন্য কোনো চিকিৎসা পদ্ধতি গ্রহণ করে থাকলে তার বিবরণ।")
  }).describe("ওষুধের/চিকিৎসার ইতিহাস")
});

const SuggestRemediesPromptInputSchema = SuggestRemediesInputSchema.extend({
    hahnemannsMateriaMedica: z.string(),
    boerickesMateriaMedica: z.string(),
    kentsMateriaMedica: z.string(),
});

const RemedySchema = z.object({
  name: z.string().describe("The name of the suggested homeopathic medicine in English, as found in the knowledge base."),
  description: z.string().describe("A brief explanation in Bengali for why the remedy is suggested, based on the provided knowledge bases."),
  score: z.number().describe("A similarity score from 1 to 100, where 100 is a perfect match between the user's symptoms and the remedy's profile in the knowledge base."),
  justification: z.string().describe("A detailed justification in Bengali, quoting or referencing specific symptoms from the respective Materia Medica that match the user's symptoms. This explains the basis for the score."),
  source: z.string().describe("The source of the information. Use 'H' for Hahnemann's Materia Medica, 'B' for Boericke's Materia Medica, 'K' for Kent's Materia Medica, and 'AI' for the AI's general knowledge.")
});

const SuggestRemediesOutputSchema = z.object({
  categorizedSymptoms: CategorizedSymptomsSchema.describe("The user's symptoms, categorized by the AI into 7 specific sections."),
  bestRepertorySuggestion: z.string().describe("A brief analysis in Bengali explaining which repertory (Hahnemann, Boericke, Kent, or general AI knowledge) is likely most suitable for this specific case and why."),
  remedies: z
    .array(RemedySchema)
    .describe('A ranked list of potential homeopathic medicine suggestions, sorted from highest score to lowest.'),
});
export type SuggestRemediesOutput = z.infer<typeof SuggestRemediesOutputSchema>;

const loadKnowledgeBase = (fileName: string): string => {
    try {
        const fullPath = path.resolve(process.cwd(), 'public', 'data', fileName);
        if (fs.existsSync(fullPath)) {
            return fs.readFileSync(fullPath, 'utf-8');
        } else {
             console.warn(`Knowledge base file not found at ${fullPath}. AI will rely on internal knowledge.`);
             return ''; 
        }
    } catch (error) {
        console.error(`Error reading knowledge base file ${fileName}:`, error);
        return '';
    }
};

export async function suggestRemedies(input: SuggestRemediesInput): Promise<SuggestRemediesOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('AI পরিষেবা কনফিগার করা যায়নি। GEMINI_API_KEY সেট করা নেই।');
  }
  return suggestRemediesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRemediesPrompt',
  input: { schema: SuggestRemediesPromptInputSchema },
  output: { schema: SuggestRemediesOutputSchema },
  config: {
    temperature: 0.1,
    safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an Expert Classical Homeopathic Physician and a highly analytical AI assistant. Your primary task is to carefully analyze the patient's symptoms, cross-reference them with the provided Materia Medica texts, and provide direct, highly accurate remedy suggestions.

### CORE INSTRUCTIONS:

1. **Symptom Categorization:** Extract the symptoms from the patient's case and categorize them EXACTLY according to the defined JSON schema. 
   - Rule: Do not create additional nested fields. If no data exists for a specific sub-category, you MUST provide an empty string ("").

2. **Information Retrieval & Cross-Referencing:**
   You are provided with raw text data from three major sources:
   - Hahnemann's Materia Medica: {{{hahnemannsMateriaMedica}}}
   - Boericke's Materia Medica: {{{boerickesMateriaMedica}}}
   - Kent's Materia Medica: {{{kentsMateriaMedica}}}
   - Rule: Search through these texts to find the closest matching remedies for the patient's unique symptoms (especially uncommon, rare, and peculiar symptoms).

3. **Fallback to Internal Knowledge (CRITICAL):**
   The provided raw text files might be unstructured, messy, or incomplete. 
   - Rule: If you cannot find sufficient evidence in the provided texts, you MUST seamlessly use your own extensive internal AI knowledge of Homeopathy, Materia Medica, and Repertory to complete the analysis. Do not fail or complain about missing text data.

4. **Generating Remedies:**
   Provide a single, ranked list of the best-suited homeopathic medicines based on the combined analysis. For each remedy provide:
   - "name": The exact medicine name in English (e.g., "Arsenicum Album").
   - "description": A short, direct sentence in Bengali explaining why it is selected.
   - "score": A similarity score (1-100) indicating how perfectly the remedy matches the case.
   - "justification": A clear, point-by-point justification in Bengali mapping the patient's symptoms to the remedy's known pathogenesis.
   - "source": Write "H", "B", "K", or "AI" indicating where the strongest symptom match was found.

5. **Best Repertory Suggestion:**
   Write a 1-2 sentence direct analysis in Bengali stating which source or approach is best for this specific case and why.

### CONSTRAINTS:
- Language: ALL output texts (description, justification, categorization, analysis) MUST be in completely natural Bengali. ONLY the medicine names must be in English.
- Output Format: Provide ONLY the strict JSON output requested by the schema. Do not add conversational filler text before or after the JSON.

Patient's Case / Symptoms: 
{{{symptoms}}}`
});

const suggestRemediesFlow = ai.defineFlow(
  {
    name: 'suggestRemediesFlow',
    inputSchema: SuggestRemediesInputSchema,
    outputSchema: SuggestRemediesOutputSchema,
  },
  async (input: SuggestRemediesInput) => {
    try {
      const hahnemannsMateriaMedica = loadKnowledgeBase('materia-medica.txt');
      const boerickesMateriaMedica = loadKnowledgeBase('Boerickes_Materia_Medica.txt');
      const kentsMateriaMedica = loadKnowledgeBase('Kents_Lectures_On_Materia_Medica.txt');

      const {output} = await prompt({
          ...input,
          hahnemannsMateriaMedica,
          boerickesMateriaMedica,
          kentsMateriaMedica
      });
      
      if (!output) {
        throw new Error('AI সহকারী কোনো উত্তর দেয়নি।');
      }
      return output;

    } catch (error: unknown) {
      let errorMessage = 'AI বিশ্লেষণ ব্যর্থ হয়েছে। মডেল একটি সমস্যার সম্মুখীন হয়েছে।';
      if (error instanceof Error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            errorMessage = 'AI জ্ঞান ভান্ডারের ফাইল খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।';
        } else {
            const msg = error.message.toLowerCase();
            if (msg.includes('api key') || msg.includes('permission denied') || msg.includes('authentication')) {
                errorMessage = 'AI পরিষেবা কনফিগার করা যায়নি। অনুগ্রহ করে আপনার GEMINI_API_KEY এবং বিলিং সেটিংস যাচাই করুন।';
            } else if (msg.includes('json')) {
                errorMessage = 'AI মডেল একটি ভুল উত্তর দিয়েছে যা প্রসেস করা সম্ভব হচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।';
            } else if (msg.includes('503') || msg.includes('unavailable') || msg.includes('internal error')) {
                errorMessage = 'AI পরিষেবাটি বর্তমানে ওভারলোড বা недоступ্য। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।';
            } else if (msg.startsWith('ai ') || msg.startsWith('ইনপুট') || msg.startsWith('ai পরিষেবা কনফিগার করা নেই')) {
                throw error;
            } else {
                errorMessage = error.message;
            }
        }
      }
      throw new Error(errorMessage);
    }
  }
);
