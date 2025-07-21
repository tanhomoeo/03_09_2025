'use server';
/**
 * @fileOverview A Genkit flow to categorize unstructured homeopathic case notes into a structured format.
 *
 * This flow takes a block of text describing a patient's case and uses Gemini to
 * extract and organize the information into a predefined set of categories and sub-categories,
 * making it easier for practitioners to review and analyze.
 *
 * - categorizeCaseNotes - The main function to call the flow.
 * - CaseNotesInput - The input type for the flow.
 * - CategorizedCaseNotesOutput - The output type for the flow (the structured notes).
 */
import { ai } from '../genkit';
import { z } from 'genkit';
import type { CategorizedCaseNotes as CategorizedCaseNotesType } from '@/lib/types';

// Input Schema: A single string containing all the case notes.
const CaseNotesInputSchema = z.object({
  caseNotesText: z.string().describe('A detailed, unstructured text containing the full case history and symptoms of a patient in Bengali.'),
});
export type CaseNotesInput = z.infer<typeof CaseNotesInputSchema>;

// Output Schema: A structured object representing the categorized notes.
// This Zod schema dynamically creates fields based on the CategorizedCaseNotesType interface
// to ensure validation matches the TypeScript type.
const CategorizedCaseNotesOutputSchema = z.object({
  physicalSymptoms: z.object({
    general: z.string().optional().describe("সাধারণ উপসর্গ যেমন মাথাব্যথা, জ্বর, দুর্বলতা।"),
    gastrointestinal: z.string().optional().describe("পায়খানা সংক্রান্ত সমস্যা যেমন কোষ্ঠকাঠিন্য, পাতলা পায়খানা, মলে রক্ত।"),
    urinary: z.string().optional().describe("প্রস্রাব সংক্রান্ত সমস্যা যেমন বারবার প্রস্রাব, জ্বালাপোড়া।"),
    femaleSpecific: z.string().optional().describe("মেয়েলী সমস্যা যেমন অনিয়মিত মাসিক, সাদা স্রাব।"),
    modalities: z.string().optional().describe("লক্ষণের হ্রাস-বৃদ্ধি (কখন বাড়ে বা কমে)।"),
    locationAndNature: z.string().optional().describe("লক্ষণের অবস্থান ও প্রকৃতি (কোন অংশে, কেমন ব্যথা)।")
  }).describe("বর্তমান শারীরিক উপসর্গ").optional(),

  mentalAndEmotionalSymptoms: z.object({
    fear: z.string().optional().describe("ভয় সম্পর্কিত বিবরণ।"),
    sadnessAndDepression: z.string().optional().describe("দুঃখ, হতাশা সম্পর্কিত বিবরণ।"),
    angerAndMoodSwings: z.string().optional().describe("রাগ, মেজাজের পরিবর্তন সম্পর্কিত বিবরণ।"),
    loneliness: z.string().optional().describe("একাকীত্ব সম্পর্কিত বিবরণ।")
  }).describe("বর্তমান মানসিক ও আবেগজনিত উপসর্গ").optional(),

  excitingCause: z.object({
    weather: z.string().optional().describe("আবহাওয়ার কারণে রোগ শুরু।"),
    diet: z.string().optional().describe("খাদ্যাভ্যাসের কারণে রোগ শুরু।"),
    mentalTrauma: z.string().optional().describe("মানসিক আঘাতের কারণে রোগ শুরু।"),
    accidentOrInfection: z.string().optional().describe("দুর্ঘটনা বা সংক্রমণের কারণে রোগ শুরু।")
  }).describe("রোগ শুরু হওয়ার কারণ (Exciting Cause)").optional(),

  maintainingCause: z.object({
    lifestyle: z.string().optional().describe("অনিয়মিত জীবনযাপন।"),
    mentalStress: z.string().optional().describe("অতিরিক্ত মানসিক চাপ।"),
    habits: z.string().optional().describe("অভ্যাসগত কারণ।")
  }).describe("রোগ স্থায়ী হওয়ার কারণ (Maintaining Cause)").optional(),

  familyAndHereditaryHistory: z.object({
    diabetes: z.string().optional().describe("ডায়াবেটিস সম্পর্কিত পারিবারিক ইতিহাস।"),
    highBloodPressure: z.string().optional().describe("উচ্চ রক্তচাপ সম্পর্কিত পারিবারিক ইতিহাস।"),
    cancer: z.string().optional().describe("ক্যান্সার সম্পর্কিত পারিবারিক ইতিহাস।"),
    allergies: z.string().optional().describe("অ্যালার্জি সম্পর্কিত পারিবারিক ইতিহাস।")
  }).describe("পারিবারিক বা বংশগত ইতিহাস (Hereditary Cause / Miasm)").optional(),

  pastMedicalHistory: z.object({
    majorIllnesses: z.string().optional().describe("রোগীর বড় কোনো পূর্বের রোগের বিবরণ।"),
    operationsOrTrauma: z.string().optional().describe("রোগীর পূর্বের কোনো অপারেশন বা ট্রমার বিবরণ।"),
    chronicIssues: z.string().optional().describe("রোগীর দীর্ঘমেয়াদি কোনো সমস্যার বিবরণ।")
  }).describe("রোগীর পূর্বের রোগের ইতিহাস").optional(),

  pastTreatmentHistory: z.object({
    previousMedication: z.string().optional().describe("রোগী পূর্বে কোন কোন ওষুধ নিয়েছে তার বিবরণ।"),
    treatmentSystems: z.string().optional().describe("পূর্বে কোন চিকিৎসা পদ্ধতি (হোমিওপ্যাথি/অ্যালোপ্যাথি/আয়ুর্বেদ) নিয়েছেন।"),
    otherTreatments: z.string().optional().describe("অন্য কোনো চিকিৎসা পদ্ধতি গ্রহণ করে থাকলে তার বিবরণ।")
  }).describe("ওষুধের/চিকিৎসার ইতিহাস").optional()
});
export type CategorizedCaseNotesOutput = z.infer<typeof CategorizedCaseNotesOutputSchema>;

// Exported wrapper function for the UI to call.
export async function categorizeCaseNotes(input: { caseNotesText: string }): Promise<CategorizedCaseNotesType> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('AI পরিষেবা কনফিগার করা যায়নি। GEMINI_API_KEY সেট করা নেই।');
  }
  const result = await categorizeCaseNotesFlow(input);
  return result as CategorizedCaseNotesType;
}

// Define the Genkit prompt for the AI model.
const caseNotesCategorizerPrompt = ai.definePrompt({
  name: 'caseNotesCategorizerPrompt',
  input: { schema: CaseNotesInputSchema },
  output: { schema: CategorizedCaseNotesOutputSchema },
  config: {
    temperature: 0.1,
     safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an expert homeopathic assistant. Your task is to read the following unstructured case notes written in Bengali and categorize the information into a structured JSON format. 
Carefully analyze the text and extract relevant details for each category and sub-category defined in the output schema. 
If no information is found for a specific field, leave it as an empty string. The title of each main category should NOT be prefixed with a number.

Case Notes Text:
{{{caseNotesText}}}

Your response must be a valid JSON object matching the provided schema.`,
});

// Define the Genkit flow that orchestrates the process.
const categorizeCaseNotesFlow = ai.defineFlow(
  {
    name: 'categorizeCaseNotesFlow',
    inputSchema: CaseNotesInputSchema,
    outputSchema: CategorizedCaseNotesOutputSchema,
  },
  async (input: { caseNotesText: string }) => {
    try {
      const { output } = await caseNotesCategorizerPrompt(input);
      if (!output) {
        throw new Error('AI কোনো তথ্য প্রদান করেনি।');
      }
      return output;
    } catch (error: unknown) {
      console.error('Error in categorizeCaseNotesFlow:', error);
      let errorMessage = 'কেস নোট ক্যাটাগরি করতে একটি অপ্রত্যাশিত সমস্যা হয়েছে।';
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('api key') || msg.includes('permission denied') || msg.includes('authentication')) {
            errorMessage = 'AI পরিষেবা কনফিগার করা যায়নি। অনুগ্রহ করে আপনার GEMINI_API_KEY এবং বিলিং সেটিংস যাচাই করুন।';
        } else if (msg.includes('json')) {
            errorMessage = 'AI একটি ভুল উত্তর দিয়েছে যা প্রসেস করা সম্ভব হচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।';
        } else if (msg.includes('503') || msg.includes('unavailable') || msg.includes('internal error')) {
            errorMessage = 'AI পরিষেবাটি বর্তমানে ওভারলোড বা недоступ্য। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।';
        } else if (msg.startsWith('ai ') || msg.startsWith('ইনপুট') || msg.startsWith('ai পরিষেবা কনফিগার করা নেই')) {
             throw error;
        } else {
            errorMessage = error.message;
        }
      }
      throw new Error(errorMessage);
    }
  }
);
