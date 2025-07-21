'use server';
/**
 * @fileOverview A Genkit flow to act as a Homeopathic AI Assistant.
 * It analyzes a full patient case, identifies key symptoms based on
 * homeopathic principles, and suggests potential remedies.
 *
 * - analyzeHomeopathicCase - The main function to call the flow.
 * - HomeopathicAssistantInput - The input type for the flow.
 * - HomeopathicAssistantOutput - The output type for the flow.
 */

import { ai } from '../genkit';
import { z } from 'genkit';

// Input Schema: A comprehensive patient case.
const HomeopathicAssistantInputSchema = z.object({
  caseData: z.string().describe('A detailed summary of the patient case in Bengali, including current complaints, patient history, family history, mental state, physical generals (thirst, sleep, thermal reaction), and specific modalities.'),
});
export type HomeopathicAssistantInput = z.infer<typeof HomeopathicAssistantInputSchema>;

// Output Schema: Structured analysis and suggestions.
const HomeopathicAssistantOutputSchema = z.object({
  keySymptoms: z.array(z.string()).describe('An array of key guiding symptoms identified from the case, based on homeopathic principles (e.g., strange, rare, peculiar, modalities, causation).'),
  remedySuggestions: z.array(
    z.object({
      remedyName: z.string().describe('The name of the suggested homeopathic remedy (e.g., "Pulsatilla Nigricans").'),
      potency: z.string().describe('A commonly used potency for the remedy (e.g., "30C", "200C").'),
      justification: z.string().describe('A brief justification explaining why this remedy is suggested, linking it to the key symptoms.'),
    })
  ).describe('An array of 2-4 potential remedy suggestions with potency and justification.'),
});
export type HomeopathicAssistantOutput = z.infer<typeof HomeopathicAssistantOutputSchema>;

// Exported wrapper function for the UI to call.
export async function analyzeHomeopathicCase(input: HomeopathicAssistantInput): Promise<HomeopathicAssistantOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('AI পরিষেবা কনফিগার করা যায়নি। GEMINI_API_KEY সেট করা নেই।');
  }
  return homeopathicAssistantFlow(input);
}

// Define the Genkit prompt for the AI model.
const homeopathicAssistantPrompt = ai.definePrompt({
  name: 'homeopathicAssistantPrompt',
  input: { schema: HomeopathicAssistantInputSchema },
  output: { schema: HomeopathicAssistantOutputSchema },
  config: {
    temperature: 0.2,
    safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `আপনি একজন বিশেষজ্ঞ এবং অভিজ্ঞ হোমিওপ্যাথিক ডাক্তারের সহকারী। আপনার কাজ হলো প্রদত্ত রোগীর কেসটি বিশ্লেষণ করে সিদ্ধান্ত গ্রহণে ডাক্তারকে সহায়তা করা।
হোমিওপ্যাথির মূলনীতি অনুসরণ করে আপনার কাজগুলো হলো:

1.  **লক্ষণের সামগ্রিকতা (Totality of Symptoms) বিশ্লেষণ:** রোগীর দেওয়া সমস্ত তথ্য (প্রধান অভিযোগ, মানসিক অবস্থা, সাধারণ লক্ষণ, নির্দিষ্টতা বা Modalities) মনোযোগ দিয়ে পড়ুন।
2.  **প্রধান লক্ষণ শনাক্তকরণ (Identify Key Symptoms):** সাধারণ লক্ষণের চেয়ে অসাধারণ, অদ্ভুত, বিরল এবং নির্দিষ্ট (Strange, Rare, Peculiar - SRP) লক্ষণগুলোকে সর্বোচ্চ গুরুত্ব দিন। কারণ, রোগের কারণ (Causation), এবং হ্রাস-বৃদ্ধি (Modalities) উল্লেখ থাকলে সেগুলোকে তালিকাবদ্ধ করুন। এই প্রধান লক্ষণগুলো আপনার \`keySymptoms\` অ্যারে-তে যুক্ত করুন।
3.  **ঔষধ প্রস্তাবনা (Remedy Suggestion):** শনাক্ত করা প্রধান লক্ষণগুলোর উপর ভিত্তি করে, মেটেরিয়া মেডিকার জ্ঞান ব্যবহার করে ২ থেকে ৪টি সবচেয়ে সম্ভাব্য হোমিওপ্যাথিক ঔষধের নাম, একটি সাধারণ শক্তি (potency), এবং প্রতিটি ঔষধ কেন নির্বাচিত হলো তার একটি সংক্ষিপ্ত যুক্তি (\`justification\`) প্রদান করুন। আপনার প্রস্তাবনা \`remedySuggestions\` অ্যারে-তে অবজেক্ট হিসেবে যুক্ত করুন।

**গুরুত্বপূর্ণ নির্দেশিকা:**
- আপনার উত্তরটি অবশ্যই একটি JSON অবজেক্ট হতে হবে।
- এটি একটি সহকারী টুল, ডাক্তারের সিদ্ধান্তের বিকল্প নয়। আপনার দেওয়া তথ্য শুধুমাত্র একটি পরামর্শ।

**রোগীর কেস-টেকিং ডেটা:**
{{{caseData}}}

আপনার বিশ্লেষণ JSON ফরম্যাটে প্রদান করুন।`,
});

// Define the Genkit flow that orchestrates the process.
const homeopathicAssistantFlow = ai.defineFlow(
  {
    name: 'homeopathicAssistantFlow',
    inputSchema: HomeopathicAssistantInputSchema,
    outputSchema: HomeopathicAssistantOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await homeopathicAssistantPrompt(input);
      if (!output) {
        throw new Error('AI সহকারী কোনো উত্তর দেয়নি।');
      }
      return output;
    } catch (error: unknown) {
      console.error('Error in homeopathicAssistantFlow:', error);
      let errorMessage = 'AI বিশ্লেষণ ব্যর্থ হয়েছে। মডেল একটি সমস্যার সম্মুখীন হয়েছে।';
      if(error instanceof Error) {
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
      throw new Error(errorMessage);
    }
  }
);
