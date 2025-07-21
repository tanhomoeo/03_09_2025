'use server';
/**
 * @fileOverview This file defines a Genkit flow for fetching detailed information about a homeopathic remedy.
 *
 * - getRemedyDetails - A function that takes a remedy name and returns its detailed profile.
 * - RemedyDetailsInput - The input type for the getRemedyDetails function.
 * - RemedyDetailsOutput - The return type for the getRemedyDetails function.
 */

import {ai} from '../genkit';
import {z} from 'genkit';

const RemedyDetailsInputSchema = z.object({
  remedyName: z
    .string()
    .describe('The name of the homeopathic remedy to look up.'),
});
export type RemedyDetailsInput = z.infer<typeof RemedyDetailsInputSchema>;

const RemedyDetailsOutputSchema = z.object({
  name: z.string().describe('The name of the remedy.'),
  description: z
    .string()
    .describe(
      'A general description of the remedy and its primary sphere of action.'
    ),
  keySymptoms: z
    .array(z.string())
    .describe(
      'A list of the most characteristic or guiding symptoms of the remedy.'
    ),
  modalities: z.object({
    worse: z
      .string()
      .describe(
        'A summary of conditions or factors that make the symptoms worse (aggravation).'
      ),
    better: z
      .string()
      .describe(
        'A summary of conditions or factors that provide relief (amelioration).'
      ),
  }),
  source: z
    .string()
    .describe(
      "The primary Materia Medica source for this information (e.g., 'Boericke', 'Kent')."
    ),
});
export type RemedyDetailsOutput = z.infer<typeof RemedyDetailsOutputSchema>;

export async function getRemedyDetails(
  input: RemedyDetailsInput
): Promise<RemedyDetailsOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'AI পরিষেবা কনফিগার করা যায়নি। GEMINI_API_KEY সেট করা নেই।'
    );
  }
  return remedyDetailsFlow(input);
}

const remedyDetailsPrompt = ai.definePrompt({
  name: 'remedyDetailsPrompt',
  input: {schema: RemedyDetailsInputSchema},
  output: {schema: RemedyDetailsOutputSchema},
  config: {
    model: 'googleai/gemini-1.5-flash',
    temperature: 0.2,
    safetySettings: [
      {category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE'},
      {category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE'},
      {category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE'},
      {category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE'},
    ],
  },
  prompt: `You are an expert Homeopathic Materia Medica assistant.
Based on your knowledge from classical sources like Boericke's and Kent's Materia Medica, provide a detailed profile for the following remedy: {{{remedyName}}}.

Structure your response strictly according to the provided JSON schema.
- For the 'source', name the primary Materia Medica you are referencing.
- For 'keySymptoms', provide a concise list of the most important guiding symptoms.
- For 'modalities', summarize the key aggravations and ameliorations.`,
});

const remedyDetailsFlow = ai.defineFlow(
  {
    name: 'remedyDetailsFlow',
    inputSchema: RemedyDetailsInputSchema,
    outputSchema: RemedyDetailsOutputSchema,
  },
  async input => {
    try {
      const {output} = await remedyDetailsPrompt(input);
      if (!output) {
        throw new Error('AI did not return any details for this remedy.');
      }
      return output;
    } catch (error: unknown) {
      console.error('Error in remedyDetailsFlow:', error);
      let errorMessage =
        'Failed to get remedy details. The AI model encountered a problem.';
      if (error instanceof Error) {
        if (error.message.startsWith('AI পরিষেবা কনফিগার করা যায়নি')) {
          throw error;
        }

        const msg = error.message.toLowerCase();
        if (msg.includes('api key') || msg.includes('permission denied') || msg.includes('authentication')) {
          errorMessage = 'AI পরিষেবা কনফিগার করা যায়নি। অনুগ্রহ করে আপনার GEMINI_API_KEY এবং বিলিং সেটিংস যাচাই করুন।';
        } else if (msg.includes('json') || msg.includes('zod')) {
          errorMessage = 'AI মডেল একটি ভুল উত্তর দিয়েছে যা প্রসেস করা সম্ভব হচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।';
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
