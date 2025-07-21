'use server';
/**
 * @fileOverview A Genkit flow to categorize unstructured homeopathic case notes into a structured format.
 *
 * This flow takes a block of text describing a patient's case and uses Gemini to
 * extract and organize the information into a predefined set of categories,
 * making it easier for practitioners to review and analyze.
 *
 * - categorizeCaseNotes - The main function to call the flow.
 * - CaseNotesInput - The input type for the flow.
 * - CategorizedCaseNotesOutput - The output type for the flow (the structured notes).
 */
import {ai} from '../genkit';
import {z} from 'genkit';
import type {CategorizedCaseNotes as CategorizedCaseNotesType} from '@/lib/types';

const CaseNotesInputSchema = z.object({
  caseNotesText: z
    .string()
    .describe(
      'A detailed, unstructured text containing the full case history and symptoms of a patient in Bengali.'
    ),
});
export type CaseNotesInput = z.infer<typeof CaseNotesInputSchema>;

const CategorizedCaseNotesOutputSchema = z.object({
  physicalSymptoms: z
    .string()
    .describe(
      'রোগীর বর্তমান সমস্ত শারীরিক উপসর্গ, যেমন - মাথাব্যথা, জ্বর, দুর্বলতা, পায়খানা ও প্রস্রাব সংক্রান্ত সমস্যা, মেয়েলী সমস্যা, এবং লক্ষণের হ্রাস-বৃদ্ধি ও প্রকৃতি।'
    ),
  mentalAndEmotionalSymptoms: z
    .string()
    .describe(
      'রোগীর বর্তমান মানসিক ও আবেগজনিত উপসর্গ, যেমন - ভয়, দুঃখ, হতাশা, রাগ, মেজাজের পরিবর্তন, এবং একাকীত্ব।'
    ),
  excitingCause: z
    .string()
    .describe(
      'রোগ শুরু হওয়ার কারণ (Exciting Cause), যেমন - আবহাওয়া, খাদ্যাভ্যাস, মানসিক আঘাত, বা দুর্ঘটনা।'
    ),
  maintainingCause: z
    .string()
    .describe(
      'রোগ স্থায়ী হওয়ার কারণ (Maintaining Cause), যেমন - অনিয়মিত জীবনযাপন, মানসিক চাপ, বা অভ্যাস।'
    ),
  familyAndHereditaryHistory: z
    .string()
    .describe(
      'পারিবারিক বা বংশগত রোগের ইতিহাস (Miasm), যেমন - ডায়াবেটিস, উচ্চ রক্তচাপ, ক্যান্সার, বা অ্যালার্জি।'
    ),
  pastMedicalHistory: z
    .string()
    .describe(
      'রোগীর পূর্বের বড় কোনো রোগ, অপারেশন, বা দীর্ঘমেয়াদী সমস্যার বিবরণ।'
    ),
  pastTreatmentHistory: z
    .string()
    .describe(
      'রোগী পূর্বে কোন কোন ওষুধ বা চিকিৎসা পদ্ধতি (হোমিওপ্যাথি/অ্যালোপ্যাথি) নিয়েছেন তার বিবরণ।'
    ),
});
export type CategorizedCaseNotesOutput = z.infer<
  typeof CategorizedCaseNotesOutputSchema
>;

export async function categorizeCaseNotes(
  input: CaseNotesInput
): Promise<CategorizedCaseNotesType> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'AI পরিষেবা কনফিগার করা যায়নি। GEMINI_API_KEY সেট করা নেই।'
    );
  }
  if (!input.caseNotesText || input.caseNotesText.trim().length < 20) {
    throw new Error(
      'অপর্যাপ্ত তথ্য। বিশ্লেষণ করার জন্য অনুগ্রহ করে রোগীর সমস্যা ও ইতিহাস সম্পর্কে আরও বিস্তারিত লিখুন (কমপক্ষে ২০ অক্ষর)।'
    );
  }
  const result = await categorizeCaseNotesFlow(input);
  return result as CategorizedCaseNotesType;
}

const caseNotesCategorizerPrompt = ai.definePrompt({
  name: 'caseNotesCategorizerPrompt',
  input: {schema: CaseNotesInputSchema},
  output: {schema: CategorizedCaseNotesOutputSchema},
  config: {
    model: 'googleai/gemini-1.5-flash',
    temperature: 0.1,
    safetySettings: [
      {category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE'},
      {category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE'},
      {category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE'},
      {category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE'},
    ],
  },
  prompt: `You are an expert homeopathic assistant. Your task is to read the following unstructured case notes written in Bengali and categorize the information into a structured JSON format.
For each of the 7 categories in the output schema, consolidate all relevant information from the user's text into a single summary string.
If no information is found for a specific category, you MUST return an empty string "" for that field.

Case Notes Text:
{{{caseNotesText}}}

Your response must be a valid JSON object matching the provided schema. Do not add any extra explanations.`,
});

const categorizeCaseNotesFlow = ai.defineFlow(
  {
    name: 'categorizeCaseNotesFlow',
    inputSchema: CaseNotesInputSchema,
    outputSchema: CategorizedCaseNotesOutputSchema,
  },
  async (input: CaseNotesInput) => {
    try {
      const {output} = await caseNotesCategorizerPrompt(input);
      
      if (!output) {
        throw new Error('AI কোনো তথ্য প্রদান করেনি।');
      }
      
      const validationResult = CategorizedCaseNotesOutputSchema.safeParse(output);

      if (!validationResult.success) {
          console.error("AI output validation failed:", validationResult.error.format());
          throw new Error('AI একটি ভুল উত্তর দিয়েছে যা প্রসেস করা সম্ভব হচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }

      return validationResult.data;

    } catch (error: unknown) {
      console.error('Error in categorizeCaseNotesFlow:', error);
      let errorMessage =
        'কেস নোট ক্যাটাগরি করতে একটি অপ্রত্যাশিত সমস্যা হয়েছে।';
      if (error instanceof Error) {
        // Re-throw errors that are already user-friendly
        if (
          error.message.startsWith('AI পরিষেবা কনফিগার করা যায়নি') ||
          error.message.startsWith('অপর্যাপ্ত তথ্য') ||
          error.message.startsWith('AI একটি ভুল উত্তর দিয়েছে')
        ) {
          throw error;
        }

        const msg = error.message.toLowerCase();
        if (msg.includes('api key') || msg.includes('permission denied') || msg.includes('authentication')) {
          errorMessage = 'AI পরিষেবা কনফিগার করা যায়নি। অনুগ্রহ করে আপনার GEMINI_API_KEY এবং বিলিং সেটিংস যাচাই করুন।';
        } else if (msg.includes('json') || msg.includes('zod')) {
          errorMessage = 'AI একটি ভুল উত্তর দিয়েছে যা প্রসেস করা সম্ভব হচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।';
        } else if (msg.includes('503') || msg.includes('unavailable') || msg.includes('internal error')) {
          errorMessage = 'AI পরিষেবাটি বর্তমানে ওভারলোড বা недоступ্য। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।';
        } else if (msg.includes('deadline') || msg.includes('timeout')) {
          errorMessage = 'AI সার্ভার থেকে উত্তর পেতে বেশি সময় লাগছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
        } else {
          errorMessage = `অপ্রত্যাশিত ত্রুটি: ${error.message}`;
        }
      }
      throw new Error(errorMessage);
    }
  }
);
