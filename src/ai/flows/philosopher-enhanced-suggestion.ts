'use server';

import { ai } from '../genkit';
import { z } from 'zod';
import type { SuggestRemediesOutput as SuggestRemediesOutputType } from '@/lib/types';
import { philosopherDatabase } from '@/lib/philosopherDatabase';

const PhilosopherEnhancedInputSchema = z.object({
  symptoms: z
    .string()
    .describe('Detailed description of patient symptoms in Bengali including mental, physical, and general symptoms.'),
  preferredPhilosopher: z
    .enum(['kent', 'boericke', 'hahnemann', 'all'])
    .optional()
    .default('all')
    .describe('Preferred homeopathic philosopher approach'),
  acuity: z
    .enum(['acute', 'chronic', 'mixed'])
    .optional()
    .default('mixed')
    .describe('Nature of the condition'),
});

export type PhilosopherEnhancedInput = z.infer<typeof PhilosopherEnhancedInputSchema>;

const RemedySchema = z.object({
  name: z
    .string()
    .describe('The exact name of the homeopathic remedy in English.'),
  description: z
    .string()
    .describe('A comprehensive explanation in Bengali for why this remedy is suggested.'),
  score: z
    .number()
    .min(1)
    .max(100)
    .describe('Similarity score (1-100) based on symptom totality and philosopher approach.'),
  justification: z
    .string()
    .describe('Detailed justification in Bengali explaining the symptom similarity with specific references.'),
  source: z
    .string()
    .describe('Primary source: K (Kent), B (Boericke), H (Hahnemann), AI (Analysis)'),
  potency: z
    .string()
    .describe('Recommended potency based on case acuity and philosopher approach.'),
  keynote: z
    .string()
    .describe('Key symptom or indication that led to this remedy selection.'),
  philosophy: z
    .string()
    .describe('The philosophical approach that supports this remedy selection.'),
});

const PhilosopherEnhancedOutputSchema = z.object({
  caseAnalysis: z
    .string()
    .describe('Comprehensive case analysis in Bengali including symptom hierarchy and totality.'),
  remedies: z
    .array(RemedySchema)
    .min(3)
    .max(8)
    .describe('Ranked list of remedy suggestions with detailed analysis from philosopher perspectives.'),
  philosophicalApproach: z
    .string()
    .describe('Explanation of the homeopathic philosophical approach used in this analysis.'),
  prescriptionGuidance: z
    .string()
    .describe('Guidance on prescription management, follow-up, and case management in Bengali.'),
});

export type PhilosopherEnhancedOutput = z.infer<typeof PhilosopherEnhancedOutputSchema>;

export async function philosopherEnhancedSuggestion(
  input: PhilosopherEnhancedInput
): Promise<SuggestRemediesOutputType> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'AI পরিষেবা কনফিগার করা যায়নি। GEMINI_API_KEY সেট করা নেই।'
    );
  }

  // Parse symptoms for database search
  const symptomList = extractSymptoms(input.symptoms);
  
  // Get suggestions from philosopher databases
  const databaseSuggestions = await philosopherDatabase.searchRemediesBySymptoms(symptomList);
  
  // Get philosopher data for context
  const philosopherData = await philosopherDatabase.getAllPhilosopherData();

  return philosopherEnhancedFlow({ 
    ...input, 
    databaseSuggestions: JSON.stringify(databaseSuggestions),
    philosopherData: JSON.stringify(philosopherData)
  });
}

function extractSymptoms(symptomsText: string): string[] {
  // Extract meaningful symptom keywords from Bengali text
  const englishKeywords = [
    'fever', 'headache', 'anxiety', 'fear', 'irritability', 'sadness', 'thirst', 'nausea',
    'cough', 'pain', 'burning', 'cold', 'heat', 'motion', 'rest', 'night', 'morning',
    'evening', 'better', 'worse', 'restless', 'tired', 'weak', 'hungry', 'appetite'
  ];
  
  const bengaliKeywords = [
    'জ্বর', 'মাথাব্যথা', 'উদ্বেগ', 'ভয়', 'রাগ', 'দুঃখ', 'তৃষ্ণা', 'বমি',
    'কাশি', 'ব্যথা', 'জ্বালা', 'ঠান্ডা', 'গরম', 'নড়াচড়া', 'বিশ্রাম', 'রাত', 'সকাল',
    'সন্ধ্যা', 'ভাল', 'খারাপ', 'অস্থির', 'ক্লান্ত', 'দুর্বল', 'ক্ষুধার্ত', 'ক্ষুধা'
  ];

  const symptoms: string[] = [];
  const lowerText = symptomsText.toLowerCase();

  // Extract English keywords
  englishKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      symptoms.push(keyword);
    }
  });

  // Extract Bengali keywords and add their English equivalents
  bengaliKeywords.forEach((bengaliWord, index) => {
    if (lowerText.includes(bengaliWord)) {
      symptoms.push(englishKeywords[index] || bengaliWord);
    }
  });

  return Array.from(new Set(symptoms)); // Remove duplicates
}

const PhilosopherPromptInputSchema = PhilosopherEnhancedInputSchema.extend({
  databaseSuggestions: z.string(),
  philosopherData: z.string(),
});

const philosopherEnhancedPrompt = ai.definePrompt({
  name: 'philosopherEnhancedPrompt',
  input: { schema: PhilosopherPromptInputSchema },
  output: { schema: PhilosopherEnhancedOutputSchema },
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
  prompt: `আপনি একজন অভিজ্ঞ হোমিওপ্যাথিক বিশেষজ্ঞ যিনি ক্লাসিক্যাল হোমিওপ্যাথির বিভিন্ন দর্শনের সাথে পরিচিত। আপনার কাজ হলো প্রদত্ত লক্ষণগুলোর ভিত্তিতে সবচেয়ে উপযুক্��� হোমিওপ্যাথিক ঔষধ নির্বাচন করা।

## হোমিওপ্যাথিক দর্শন:

### Kent's দর্শন (রেপার্টরিয়াল পদ্ধতি):
- মানসিক লক্ষণকে সর্বোচ্চ গুরুত্ব দেওয়া
- রেপার্টরি ব্যবহার করে রুব্রিক বিশ্লেষণ
- কনস্টিটিউশনাল প্রেসক্রাইবিং
- উচ্চ শক্তির ব্যবহার

### Boericke's দর্শন (ক্লিনিক্যাল পদ্ধতি):
- ক্লিনিক্যাল অবস্থার উপর ফোকাস
- থেরাপিউটিক ইন্ডিকেশন
- প্র্যাক্টিক্যাল প্রয়োগ
- নিম্ন থেকে মধ্যম শক্তির ব্যবহার

### Hahnemann's দর্শন (বিশুদ্ধ প্রভিং):
- প্রভিং থেকে প্রাপ্ত লক্ষণের উপর নির্ভরশীলতা
- লক্ষণের সামগ্রিকতা (Totality of Symptoms)
- সিমিলিয়া সিমিলিবাস কিউরেনটার নীতি
- চরিত্রগত ও অদ্ভুত লক্ষণের গুরুত্ব

## বিশ্লেষণ পদ্ধতি:

1. **ডেটাবেস বিশ্লেষণ**: প্রদত্ত ডেটাবেস সাজেশনগুলো পর্যালোচনা করুন
2. **দার্শনিক দৃষ্টিভঙ্গি**: উপযুক্ত দর্শন অনুসরণ করুন
3. **লক্ষণের গ্রেডিং**: কেন্ট রেপার্টরির গ্রেড (৩, ২, ১) বিবেচনা করুন
4. **সামগ্রিক মূল্যায়ন**: মানসিক, সাধারণ এবং বিশেষ লক্ষণের সমন্বয়

## ডেটাবেস সাজেশন:
{{{databaseSuggestions}}}

## দার্শনিক তথ্য:
{{{philosopherData}}}

## পছন্দের দর্শন: {{{preferredPhilosopher}}}
## অবস্থার ধরন: {{{acuity}}}

## রোগীর লক্ষণ:
{{{symptoms}}}

## নির্দেশাবলী:
- সমস্ত বিশ্লেষণ বাংলায় লিখুন (ঔষধের নাম ইংরেজিতে)
- ডেটাব���স সাজেশন এবং দার্শনিক দৃষ্টিভঙ্গি উভয়ই ব্যবহার করুন
- প্রতিটি ঔষধের জন্য দর্শনভিত্তিক যুক্তি প্রদান করুন
- উপযুক্ত শক্তি নির্বাচন করুন
- ব্যবহারিক প্রেসক্রিপশন গাইডেন্স দিন

দয়া করে JSON ফরম্যাটে আপনার বিশ্লেষণ প্রদান করুন।`,
});

const philosopherEnhancedFlow = ai.defineFlow(
  {
    name: 'philosopherEnhancedFlow',
    inputSchema: PhilosopherPromptInputSchema,
    outputSchema: PhilosopherEnhancedOutputSchema,
  },
  async (input: z.infer<typeof PhilosopherPromptInputSchema>) => {
    try {
      if (!input.symptoms || input.symptoms.trim().length < 20) {
        throw new Error(
          'অপর্যাপ্ত তথ্য। বিশ্লেষণ করার জন্য অনুগ্রহ করে রোগীর সমস্যা ও ইতিহাস সম্পর্কে আরও বিস্তারিত লিখুন (কমপক্ষে ২০ অক্ষর)।'
        );
      }

      const { output } = await philosopherEnhancedPrompt(input);

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
      console.error('Error in philosopherEnhancedFlow:', error);
      let errorMessage = 'দার্শনিক AI বিশ্লেষণ ব্যর্থ হয়েছে। উন্নত AI মডেল একটি সমস্যার সম্মুখীন হয়েছে।';
      
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
          errorMessage = `দার্শনিক AI বিশ্লেষণে ত্রুটি: ${error.message}`;
        }
      }
      throw new Error(errorMessage);
    }
  }
);
