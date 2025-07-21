'use server';

import { ai } from '../genkit';
import { z } from 'zod';
import type { SuggestRemediesOutput as SuggestRemediesOutputType } from '@/lib/types';

const EnhancedRemedySuggestionInputSchema = z.object({
  symptoms: z
    .string()
    .describe('Detailed description of patient symptoms in Bengali including mental, physical, and general symptoms.'),
  language: z
    .string()
    .optional()
    .default('bengali')
    .describe('Response language preference (bengali/english)'),
});

export type EnhancedRemedySuggestionInput = z.infer<typeof EnhancedRemedySuggestionInputSchema>;

const RemedySchema = z.object({
  name: z
    .string()
    .describe('The exact name of the homeopathic remedy in English as found in classical texts.'),
  description: z
    .string()
    .describe('A comprehensive explanation in Bengali for why this remedy is suggested based on symptom similarity.'),
  score: z
    .number()
    .min(1)
    .max(100)
    .describe('Similarity score (1-100) based on symptom totality and characteristic symptoms.'),
  justification: z
    .string()
    .describe('Detailed justification in Bengali explaining the symptom similarity with specific references.'),
  source: z
    .string()
    .describe('Primary source: K (Kent), B (Boericke), H (Hahnemann), R (Repertory), AI (Analysis)'),
  potency: z
    .string()
    .describe('Recommended potency based on case acuity and constitutional factors.'),
  keynote: z
    .string()
    .describe('Key symptom or indication that led to this remedy selection.'),
});

const EnhancedRemedySuggestionOutputSchema = z.object({
  caseAnalysis: z
    .string()
    .describe('Comprehensive case analysis in Bengali including symptom hierarchy and totality.'),
  remedies: z
    .array(RemedySchema)
    .min(3)
    .max(8)
    .describe('Ranked list of remedy suggestions with detailed analysis.'),
  rubricAnalysis: z
    .string()
    .describe('Repertorial analysis showing key rubrics and remedy coverage.'),
  prescriptionGuidance: z
    .string()
    .describe('Guidance on prescription management, follow-up, and case management in Bengali.'),
});

export type EnhancedRemedySuggestionOutput = z.infer<typeof EnhancedRemedySuggestionOutputSchema>;

export async function enhancedRemedySuggestion(
  input: EnhancedRemedySuggestionInput
): Promise<SuggestRemediesOutputType> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'AI পরিষেবা কনফিগার করা যায়নি। GEMINI_API_KEY সেট করা নেই।'
    );
  }

  // Load JSON databases
  const [repertoryData, materiaMedicaData] = await Promise.all([
    loadRepertoryData(),
    loadMateriaMedicaData()
  ]);

  return enhancedRemedySuggestionFlow({ 
    ...input, 
    repertoryData: JSON.stringify(repertoryData),
    materiaMedicaData: JSON.stringify(materiaMedicaData)
  });
}

// Import the data cache
import { homeopathicDataCache } from '@/lib/homeopathicDataCache';

async function loadRepertoryData() {
  return await homeopathicDataCache.getRepertoryData();
}

async function loadMateriaMedicaData() {
  return await homeopathicDataCache.getMateriaMedicaData();
}

const EnhancedPromptInputSchema = EnhancedRemedySuggestionInputSchema.extend({
  repertoryData: z.string(),
  materiaMedicaData: z.string(),
});

const enhancedPrompt = ai.definePrompt({
  name: 'enhancedRemedySuggestionPrompt',
  input: { schema: EnhancedPromptInputSchema },
  output: { schema: EnhancedRemedySuggestionOutputSchema },
  config: {
    model: 'googleai/gemini-1.5-flash',
    temperature: 0.1,
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `আপনি একজন অভিজ্ঞ ক্লাসিক্যাল হোমিওপ্যাথিক বিশেষজ্ঞ। আপনার কাজ হলো প্রদত্ত লক্ষণগুলোর ভিত্তিতে সবচেয়ে উপযুক্ত হোমিওপ্যাথিক ঔষধ নির্বাচন করা।

## বিশ্লেষণ পদ্ধতি:

### ১. লক্ষণের সামগ্রিকতা (Totality of Symptoms):
- সমস্ত লক্ষণকে মানসিক, শারীরিক এবং সাধারণ লক্ষণে ভাগ করুন
- অসাধারণ, বিরল এবং নির্দিষ্ট (Strange, Rare, Peculiar) লক্ষণগুলো চিহ্নিত করুন
- হ্রাস-বৃদ্ধি (Modalities) এবং রোগের কারণ (Causation) বিবেচনা করুন

### ২. রেপার্টরি বিশ্লেষণ:
- প্রদত্ত রেপার্টরি ডেটাবেস ব্যবহার করে মূল লক্ষণগুলোর জন্য রুব্রিক খুঁজুন
- গ্রেড ৩, ২, ১ অনুযায়ী ঔষধের গুরুত্ব নির্ধারণ করুন
- একাধিক রুব্রিকে উপস্থিত ঔষধগুলো চিহ্নিত করুন

### ৩. মেটেরিয়া মেডিকা যাচাইকরণ:
- প্রদত্ত মেটেরিয়া মেডিকা ডেটাবেস থেকে নির্বাচিত ঔষধের বিস্তারিত তথ্য যাচাই করুন
- কীনোট লক্ষণ, মানসিক লক্ষণ, শারীরিক লক্ষণ এবং হ্রাস-বৃদ্ধি মিলিয়ে দেখুন

### ৪. ঔষধ নির্বাচন:
- লক্ষণের সাদৃশ্য অনুযায়ী ৩-৮টি ঔষধ নির্বাচন করুন
- প্রতিটি ঔষধের জন্য ১-১০০ স্কোর দিন
- উচ্চ স্কোর থেকে কম স্কোর অনুযায়ী সাজান

### ৫. শক্তি নির্বাচন:
- তীব্র অবস্থায়: ৬C, ৩০C (ঘন ঘন)
- দীর্ঘস্থায়ী অবস্থায়: ২০০C, ১M (কম ঘন ঘন)
- সংবেদনশীল রোগীর জন্য: কম শক্তি
- জোরালো রোগীর জন্য: উচ্চ শক্তি

## ডেটাবেস তথ্য:

### রেপার্টরি ডেটা:
{{{repertoryData}}}

### মেটেরিয়া মেডিকা ডেটা:
{{{materiaMedicaData}}}

## রোগীর লক্ষণ:
{{{symptoms}}}

## নির্দেশাবলী:
- সমস্ত বিশ্লেষণ বাংলায় লিখুন (ঔষধের নাম ইংরেজিতে)
- প্রতিটি ঔষধের জন্য বিস্তারিত যুক্তি প্রদান করুন
- রেপার্টরি এবং মেটেরিয়া মেডিকা উভয় থেকে তথ্য ব্যবহার করুন
- ব্যবহারিক প্রেসক্রিপশন গাইডেন্স দিন

দয়া করে JSON ফরম্যাটে আপনার বিশ্লেষণ প্রদান করুন।`,
});

const enhancedRemedySuggestionFlow = ai.defineFlow(
  {
    name: 'enhancedRemedySuggestionFlow',
    inputSchema: EnhancedPromptInputSchema,
    outputSchema: EnhancedRemedySuggestionOutputSchema,
  },
  async (input: z.infer<typeof EnhancedPromptInputSchema>) => {
    try {
      if (!input.symptoms || input.symptoms.trim().length < 20) {
        throw new Error(
          'অপর্যাপ্ত তথ্য। বিশ্লেষণ করার জন্য অনুগ্রহ করে রোগীর সমস্যা ও ইতিহাস সম্পর্কে আরও বিস্তারিত লিখুন (কমপক্ষে ২০ অক্ষর)।'
        );
      }

      const { output } = await enhancedPrompt(input);

      if (!output) {
        throw new Error('AI সহকারী কোনো উত্তর দেয়নি।');
      }

      // Transform the output to match the expected type
      const transformedOutput: SuggestRemediesOutputType = {
        caseAnalysis: output.caseAnalysis,
        remedies: output.remedies.map(remedy => ({
          name: remedy.name,
          description: remedy.description,
          score: remedy.score,
          justification: remedy.justification,
          source: remedy.source
        }))
      };

      return transformedOutput;
    } catch (error: unknown) {
      console.error('Error in enhancedRemedySuggestionFlow:', error);
      let errorMessage = 'AI বিশ্লেষণ ব্যর্থ হয়েছে। উন্নত AI মডেল একটি সমস্যার সম্মুখীন হয়েছে।';
      
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('api key') || msg.includes('authentication') || msg.includes('billing')) {
          errorMessage = 'AI পরিষেবা কনফিগার করা যায়নি। অনুগ্রহ করে আপনার GEMINI_API_KEY এবং বিলিং সেটিংস যাচাই করুন।';
        } else if (msg.includes('json')) {
          errorMessage = 'AI মডেল একটি ভুল উত্তর দিয়েছে যা প্রসেস করা সম্ভব হচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।';
        } else if (msg.includes('503') || msg.includes('unavailable')) {
          errorMessage = 'AI পরিষেবাটি বর্তমানে ওভারলোড বা অনুপলব্ধ। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।';
        } else if (msg.startsWith('অপর্যাপ্ত তথ্য')) {
          throw error;
        } else {
          errorMessage = `উন্নত AI বিশ্লেষণে ত্রুটি: ${error.message}`;
        }
      }
      throw new Error(errorMessage);
    }
  }
);
