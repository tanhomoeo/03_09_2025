'use server';

/**
 * @fileOverview A Genkit flow to act as a Homeopathic AI Assistant.
 * It analyzes raw patient symptoms and demographic data, categorizes the symptoms,
 * and suggests a safe remedy with detailed reasoning, dosage, and precautions.
 *
 * - analyzeHomeopathicCase - The main function to call the flow.
 * - HomeopathicAnalysisInput - The input type for the flow.
 * - HomeopathicAssistantOutput - The output type for the flow (also used in frontend).
 */

import { ai } from '../genkit';
import { z } from 'genkit';
import { PatientDemographics, AnalysisResult } from '@/lib/types';

// Export the output type for use in the frontend
export type HomeopathicAssistantOutput = AnalysisResult;

// Input Schema: Raw symptoms and patient demographics.
export const HomeopathicAnalysisInputSchema = z.object({
  rawSymptoms: z
    .string()
    .describe(
      "A detailed description of the patient's symptoms in Bengali, including chief complaints, history, modalities, and any other relevant information."
    ),
  patientDemographics: PatientDemographics.describe(
    'Basic demographic information about the patient.'
  ),
});
export type HomeopathicAnalysisInput = z.infer<
  typeof HomeopathicAnalysisInputSchema
>;

// Local schema for the AI prompt, including keySymptoms
export const AnalysisResultSchema = z.object({
  keySymptoms: z
    .array(z.string())
    .optional()
    .describe(
      'A list of 3-5 of the most important guiding symptoms (Strange, Rare, and Peculiar) identified from the case.'
    ),
  categorizedSymptoms: z
    .object({
      Locations: z
        .array(z.string())
        .describe(
          'শারীরিক বা মানসিক লক্ষণগুলো শরীরের কোন অংশে বা কোন অঙ্গকে প্রভাবিত করছে। যেমন: মাথা, পেট, জয়েন্ট।'
        ),
      Causations: z
        .array(z.string())
        .describe(
          'রোগ বা উপসর্গের সম্ভাব্য কারণ কী? যেমন: আঘাত, ঠান্ডা লাগা, মানসিক চাপ, নির্দিষ্ট কোনো খাবার।'
        ),
      Sensations: z
        .array(z.string())
        .describe(
          'রোগী ঠিক কী ধরনের অনুভূতি বা ব্যথা অনুভব করছেন? যেমন: জ্বালাপোড়া, কামড়ানো, ধারালো ব্যথা, অবশ অনুভূতি।'
        ),
      Concomitants: z
        .array(z.string())
        .describe(
          'মূল সমস্যার সাথে আর কী কী আনুষঙ্গিক লক্ষণ দেখা যাচ্ছে, যা আপাতদৃষ্টিতে সরাসরি সম্পর্কিত নয়। যেমন: মাথাব্যথার সাথে বমি বমি ভাব।'
        ),
      Mental: z
        .array(z.string())
        .describe(
          'রোগীর মানসিক অবস্থা, আবেগ বা আচরণ সম্পর্কিত লক্ষণ। যেমন: খিটখিটে মেজাজ, ভয়, উদ্বেগ, বিষণ্ণতা।'
        ),
    })
    .describe(
      'The raw symptoms categorized into 5 specific homeopathic categories.'
    ),
  remedySuggestions: z
    .array(
      z.object({
        remedyName: z
          .string()
          .describe('The name of the suggested homeopathic remedy (e.g., "Arnica Montana").'),
        reasoning: z
          .string()
          .describe(
            'A detailed justification explaining why this remedy is the safest and most appropriate, linking it to the categorized symptoms. This should be based on global homeopathic knowledge.'
          ),
        dosage: z
          .object({
            centesimal: z.string().describe('The suggested dosage in the centesimal scale (e.g., "30C, 200C").'),
            millesimal: z.string().describe('The suggested dosage in the millesimal scale (e.g., "0/1, 0/2").'),
          })
          .describe('Suggested dosage in both centesimal and millesimal scales.'),
        precautions: z
          .string()
          .describe('Important precautions or warnings associated with the remedy.'),
      })
    )
    .min(1)
    .max(1)
    .describe('An array containing exactly one, safest remedy suggestion.'),
});

// Exported wrapper function for the UI to call.
// Modified to match the API route's expected signature.
export async function analyzeHomeopathicCase(input: {
  caseData: string;
}): Promise<HomeopathicAssistantOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'AI পরিষেবা কনফিগার করা যায়নি। GEMINI_API_KEY সেট করা নেই।'
    );
  }
  // Map the single caseData string to the structured input.
  // We use the caseData as rawSymptoms and provide empty demographics as they are combined in the UI.
  return homeopathicAnalysisFlow({
    rawSymptoms: input.caseData,
    patientDemographics: {},
  });
}

// Define the Genkit prompt for the AI model.
const homeopathicAnalysisPrompt = ai.definePrompt({
  name: 'homeopathicAnalysisPrompt',
  input: { schema: HomeopathicAnalysisInputSchema },
  output: {
    format: 'json',
    schema: AnalysisResultSchema,
  },
  config: {
    temperature: 0.3,
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `আপনি একজন বিশেষজ্ঞ এবং বিচক্ষণ হোমিওপ্যাথিক ডাক্তারের এআই সহকারী। আপনার প্রধান দায়িত্ব হলো রোগীর লক্ষণাবলী বিশ্লেষণ করে সবচেয়ে নিরাপদ এবং কার্যকর ঔষধ খুঁজে বের করতে ডাক্তারকে সাহায্য করা।\n\n**আপনার প্রধান কাজ নিম্নরূপ:**\n\n1.  **প্রধান লক্ষণ চিহ্নিতকরণ (Key Symptoms):**\n    রোগীর বর্ণনা থেকে ৩-৫টি সবচেয়ে গুরুত্বপূর্ণ এবং নির্ধারক লক্ষণ (Strange, Rare, and Peculiar - SRP) খুঁজে বের করুন।\n\n2.  **লক্ষণ ক্যাটাগরাইজেশন (Symptom Categorization):**\n    রোগীর প্রদত্ত লক্ষণগুলোকে অবশ্যই নিচের ৫টি সুনির্দিষ্ট ক্যাটাগরিতে ভাগ করুন:\n    - **Locations:** শারীরিক বা মানসিক লক্ষণ শরীরের কোন অংশে ঘটছে।\n    - **Causations:** রোগের বা লক্ষণের সম্ভাব্য কারণ।\n    - **Sensations:** রোগী কী ধরনের ব্যথা বা অনুভূতি অনুভব করছেন।\n    - **Concomitants:** মূল সমস্যার সাথে সম্পর্কিত আনুষঙ্গিক লক্ষণ।\n    - **Mental:** রোগীর মানসিক অবস্থা বা আচরণ সম্পর্কিত লক্ষণ।\n\n3.  **ঔষধ নির্বাচন ও বিশ্লেষণ (Remedy Selection and Analysis):**\n    - **গ্লোবাল নলেজ ব্যবহার:** আপনার সুবিশাল অভ্যন্তরীণ জ্ঞান এবং হোমিওপ্যাথিক মেটেরিয়া মেডিকার اصول ব্যবহার করে সর্বাধিক নিরাপদ (safest) একটি মাত্র ঔষধ নির্বাচন করুন।\n    - **বিস্তারিত আউটপুট:** আপনার নির্বাচিত ঔষধের জন্য Reasoning (যুক্তি), Dosage (শততমিক ও সহস্রতমিক মাত্রা) এবং Precautions (সতর্কতা) প্রদান করুন।\n\n**গুরুত্বপূর্ণ নির্দেশিকা:**\n- আপনার সম্পূর্ণ উত্তরটি অবশ্যই JSON ফরম্যাটে হতে হবে এবং প্রদত্ত \`AnalysisResultSchema\` মেনে চলতে হবে।\n- সমস্ত ব্যাখ্যা এবং বর্ণনা অবশ্যই বাংলায় হতে হবে, শুধুমাত্র ঔষধের নাম ইংরেজিতে হবে।\n\n**রোগীর ডেটা:**\n\n**১. ডেমোগ্রাফিক তথ্য:**\n\`\`\`json\n{{{json patientDemographics}}}\n\`\`\`\n\n**২. রোগীর প্রদত্ত লক্ষণ (Raw Symptoms):**\n\`\`\`text\n{{{rawSymptoms}}}\n\`\`\`\n\nআপনার বিশ্লেষণ JSON ফরম্যাটে প্রদান করুন।`,
});

// Define the Genkit flow that orchestrates the process.
const homeopathicAnalysisFlow = ai.defineFlow(
  {
    name: 'homeopathicAnalysisFlow',
    inputSchema: HomeopathicAnalysisInputSchema,
    outputSchema: AnalysisResultSchema,
  },
  async (input: HomeopathicAnalysisInput) => {
    try {
      const { output } = await homeopathicAnalysisPrompt(input);
      if (!output) {
        throw new Error('AI সহকারী কোনো উত্তর দেয়নি।');
      }
      return output as HomeopathicAssistantOutput;
    } catch (error: unknown) {
      console.error('Error in homeopathicAnalysisFlow:', error);
      let errorMessage =
        'AI বিশ্লেষণ ব্যর্থ হয়েছে। মডেল একটি সমস্যার সম্মুখীন হয়েছে।';
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (
          msg.includes('api key') ||
          msg.includes('permission denied') ||
          msg.includes('authentication')
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
          msg.startsWith('ai পরিষেবা কনফিগার করা নেই')
        ) {
          throw error;
        } else {
          errorMessage = error.message;
        }
      }
      throw new Error(errorMessage);
    }
  }
);
