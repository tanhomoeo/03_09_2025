
'use server';

/**
 * @fileOverview Suggests homeopathic remedies based on user-provided symptoms.
 *
 * - suggestRemedies - A function that takes a symptom inputs and returns a ranked list of potential homeopathic medicine suggestions.
 * - SuggestRemediesInput - The input type for the suggestRemedies function.
 * - SuggestRemediesOutput - The return type for the suggestRemedies function.
 */
import {ai} from '../genkit';
import {z} from 'zod';
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
        const fullPath = path.join(process.cwd(), 'src', 'ai', 'data', fileName);
        return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
        console.error(`Error reading knowledge base file ${fileName}:`, error);
        return `Error: Could not load ${fileName}.`;
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
  prompt: `You are a highly experienced homeopathic doctor. You will analyze the patient's symptoms based on the core principles of classical homeopathy.
Your tasks are:

1.  **Categorize Symptoms**: Your first task is to categorize the given symptoms into the seven specific sections defined in the 'categorizedSymptoms' output schema. The output object for categorized symptoms should contain the defined fields directly, NOT nested under a title for each category. If no information is provided for a category or sub-category, you MUST leave it as an empty string.

2.  **Best Repertory Suggestion**: Analyze the case as a whole and determine which knowledge source (Hahnemann's, Boericke's, Kent's, or your own general AI knowledge) appears most suited for finding the primary remedy for this specific patient. Provide a short justification for your choice in the 'bestRepertorySuggestion' field.

3.  **Suggest Remedies**: Perform a comprehensive analysis using your categorized symptoms and FOUR distinct sources of information (Hahnemann, Boericke, Kent, and your general knowledge) to generate a single, unified list of remedy suggestions.

    -   For each potential remedy, provide:
        a.  The medicine's name in English.
        b.  A brief description in Bengali explaining why it's suggested.
        c.  A confidence score from 1 to 100 indicating the match.
        d.  A detailed justification in Bengali. If from a text source ('H', 'B', or 'K'), reference how the user's symptoms match.
        e.  The source ('H', 'B', 'K', or 'AI').

    -   Combine all found remedies into a single 'remedies' array.
    -   Sort this 'remedies' array from the highest score to the lowest.

All output (descriptions, justifications, categorized symptoms, and repertory suggestions) MUST be in Bengali, except for the medicine names, which must be in English.

Knowledge Bases:
- Hahnemann's Materia Medica: {{{hahnemannsMateriaMedica}}}
- Boericke's Materia Medica: {{{boerickesMateriaMedica}}}
- Kent's Materia Medica: {{{kentsMateriaMedica}}}

Patient's Symptoms: {{{symptoms}}}`
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
