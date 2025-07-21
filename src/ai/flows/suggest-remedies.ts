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
import type {SuggestRemediesOutput as SuggestRemediesOutputType} from '@/lib/types';

import hahnemannsMateriaMedica from 'raw-loader!../../../public/data/materia-medica.txt';
import boerickesMateriaMedica from 'raw-loader!../../../public/data/Boerickes_Materia_Medica.txt';
import kentsMateriaMedica from 'raw-loader!../../../public/data/Kents_Lectures_On_Materia_Medica.txt';

const SuggestRemediesInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A detailed description of the symptoms experienced by the user in Bengali.'),
});
export type SuggestRemediesInput = z.infer<typeof SuggestRemediesInputSchema>;

const SuggestRemediesPromptInputSchema = SuggestRemediesInputSchema.extend({
  hahnemannsMateriaMedica: z.string(),
  boerickesMateriaMedica: z.string(),
  kentsMateriaMedica: z.string(),
});

const RemedySchema = z.object({
  name: z
    .string()
    .describe(
      'The name of the suggested homeopathic medicine in English, as found in the knowledge base.'
    ),
  description: z
    .string()
    .describe(
      "A brief explanation in Bengali for why the remedy is suggested, based on the provided knowledge bases."
    ),
  score: z
    .number()
    .describe(
      "A similarity score from 1 to 100, where 100 is a perfect match between the user's symptoms and the remedy's profile in the knowledge base."
    ),
  justification: z
    .string()
    .describe(
      "A detailed justification in Bengali, quoting or referencing specific symptoms from the respective Materia Medica that match the user's symptoms. This explains the basis for the score."
    ),
  source: z
    .string()
    .describe(
      "The source of the information. Use 'H' for Hahnemann's Materia Medica, 'B' for Boericke's Materia Medica, 'K' for Kent's Materia Medica, and 'AI' for the AI's general knowledge."
    ),
});

const SuggestRemediesOutputSchema = z.object({
  caseAnalysis: z
    .string()
    .describe(
      "A detailed, paragraph-based analysis of the patient's case in Bengali, summarizing the key symptoms and overall picture."
    ),
  remedies: z
    .array(RemedySchema)
    .describe(
      'A ranked list of potential homeopathic medicine suggestions, sorted from highest score to lowest.'
    ),
});

export type SuggestRemediesOutput = z.infer<typeof SuggestRemediesOutputSchema>;

export async function suggestRemedies(
  input: SuggestRemediesInput
): Promise<SuggestRemediesOutputType> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'AI পরিষেবা কনফিগার করা যায়নি। GEMINI_API_KEY সেট করা নেই।'
    );
  }
  return suggestRemediesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRemediesPrompt',
  input: {schema: SuggestRemediesPromptInputSchema},
  output: {schema: SuggestRemediesOutputSchema},
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
  prompt: `You are a highly experienced homeopathic doctor. You will analyze the patient's symptoms based on the core principles of classical homeopathy.
Your tasks are:

1.  **Analyze and Summarize**: Your first task is to provide a comprehensive analysis of the patient's case in a detailed paragraph. This analysis should cover the totality of symptoms, identifying the most important physical, mental, and general symptoms. This summary will be the value for the 'caseAnalysis' field.

2.  **Suggest Remedies**: Perform a comprehensive analysis using FOUR distinct sources of information (Hahnemann, Boericke, Kent, and your general knowledge) to generate a single, unified list of remedy suggestions.

    -   For each potential remedy, provide:
        a.  The medicine's name in English.
        b.  A brief description in Bengali explaining why it's suggested.
        c.  A confidence score from 1 to 100 indicating the match.
        d.  A detailed justification in Bengali. If from a text source ('H', 'B', or 'K'), reference how the user's symptoms match.
        e.  The source ('H', 'B', 'K', or 'AI').

    -   Combine all found remedies into a single 'remedies' array.
    -   Sort this 'remedies' array from the highest score to the lowest.

All output (descriptions, justifications, case analysis) MUST be in Bengali, except for the medicine names, which must be in English.

Knowledge Bases:
- Hahnemann's Materia Medica: {{{hahnemannsMateriaMedica}}}
- Boericke's Materia Medica: {{{boerickesMateriaMedica}}}
- Kent's Materia Medica: {{{kentsMateriaMedica}}}

Patient's Symptoms: {{{symptoms}}}`,
});

const suggestRemediesFlow = ai.defineFlow(
  {
    name: 'suggestRemediesFlow',
    inputSchema: SuggestRemediesInputSchema,
    outputSchema: SuggestRemediesOutputSchema,
  },
  async (input: SuggestRemediesInput) => {
    try {
      if (!input.symptoms || input.symptoms.trim().length < 20) {
        throw new Error(
          'অপর্যাপ্ত তথ্য। বিশ্লেষণ করার জন্য অনুগ্রহ করে রোগীর সমস্যা ও ইতিহাস সম্পর্কে আরও বিস্তারিত লিখুন (কমপক্ষে ২০ অক্ষর)।'
        );
      }
      const {output} = await prompt({
        ...input,
        hahnemannsMateriaMedica,
        boerickesMateriaMedica,
        kentsMateriaMedica,
      });

      if (!output) {
        throw new Error('AI সহকারী কোনো উত্তর দেয়নি।');
      }
      return output;
    } catch (error: unknown) {
      console.error('Error in suggestRemediesFlow:', error);
      let errorMessage = 'AI বিশ্লেষণ ব্যর্থ হয়েছে। মডেল একটি সমস্যার সম্মুখীন হয়েছে।';
      if (error instanceof Error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          errorMessage =
            'AI জ্ঞান ভান্ডারের ফাইল খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।';
        } else {
          const msg = error.message.toLowerCase();
          if (
            msg.includes('api key') ||
            msg.includes('permission denied') ||
            msg.includes('authentication') ||
            msg.includes('billing')
          ) {
            errorMessage =
              'AI পরিষেবা কনফিগার করা যায়নি। অনুগ্রহ করে আপনার GEMINI_API_KEY এবং বিলিং সেটিংস যাচাই করুন।';
          } else if (msg.includes('json')) {
            errorMessage =
              'AI মডেল একটি ভুল উত্তর দিয়েছে যা প্রসেস করা সম্ভব হচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।';
          } else if (
            msg.includes('503') ||
            msg.includes('unavailable') ||
            msg.includes('internal error')
          ) {
            errorMessage =
              'AI পরিষেবাটি বর্তমানে ওভারলোড বা недоступ্য। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।';
          } else if (
            msg.startsWith('ai ') ||
            msg.startsWith('ইনপুট') ||
            msg.startsWith('ai পরিষেবা কনফিগার করা নেই') ||
            msg.startsWith('অপর্যাপ্ত তথ্য')
          ) {
            throw error;
          } else {
            errorMessage = `অপ্রত্যাশিত ত্রুটি: ${error.message}`;
          }
        }
      }
      throw new Error(errorMessage);
    }
  }
);
