
'use server';
/**
 * @fileOverview A Genkit flow to analyze patient complaints and categorize them into 7 key homeopathic principles.
 *
 * This flow takes unstructured patient complaints in Bengali and uses an AI model
 * to structure the information into seven categories: Location, Causation, Sensation,
 * Modalities, Concomitant, Generalities, and Past History. For each category, it
 * separates general symptoms from "Strange, Rare, and Peculiar" (SRP) symptoms.
 * It also generates a concise summary of all identified SRP symptoms.
 *
 * - analyzeComplaint - The main function to call the flow.
 * - ComplaintAnalyzerInput - The input type for the flow.
 * - ComplaintAnalyzerOutput - The structured output type returned by the flow.
 */

import { ai } from '../genkit';
import { z } from 'zod';

// Input Schema: A single string containing all the patient's symptoms.
const ComplaintAnalyzerInputSchema = z.object({
  symptoms: z.string().describe('The unstructured text of patient complaints in Bengali.'),
});
export type ComplaintAnalyzerInput = z.infer<typeof ComplaintAnalyzerInputSchema>;

// Output Schema Definition
const LocationSchema = z.object({
  general: z.string().optional().describe('রোগের সাধারণ অবস্থান।'),
  srp: z.string().optional().describe('অবস্থান সম্পর্কিত অদ্ভুত, বিরল বা বিশেষ লক্ষণ (SRP)।'),
});

const CausationSchema = z.object({
  general: z.string().optional().describe('রোগের সাধারণ কারণ।'),
  srp: z.string().optional().describe('কারণ সম্পর্কিত অদ্ভুত, বিরল বা বিশেষ লক্ষণ (SRP)।'),
});

const SensationSchema = z.object({
  general: z.string().optional().describe('রোগীর সাধারণ অনুভূতি (যেমন, ব্যথা, জ্বালা)।'),
  srp: z.string().optional().describe('অনুভূতি সম্পর্কিত অদ্ভুত, বিরল বা বিশেষ লক্ষণ (SRP)।'),
});

const ModalitiesSchema = z.object({
  aggravation: z.string().optional().describe('যেসব কারণে লক্ষণ বৃদ্ধি পায়।'),
  amelioration: z.string().optional().describe('যেসব কারণে লক্ষণ কমে বা উপশম হয়।'),
  srp: z.string().optional().describe('হ্রাস-বৃদ্ধি সম্পর্কিত অদ্ভুত, বিরল বা বিশেষ লক্ষণ (SRP)।'),
});

const ConcomitantSchema = z.object({
  general: z.string().optional().describe('প্রধান লক্ষণের সাথে সম্পর্কিত সাধারণ সহগামী লক্ষণ।'),
  srp: z.string().optional().describe('সহগামী লক্ষণ সম্পর্কিত অদ্ভুত, বিরল বা বিশেষ লক্ষণ (SRP)।'),
});

const GeneralitiesSchema = z.object({
  physical: z.string().optional().describe('সাধারণ শারীরিক লক্ষণ (Physical Generals)।'),
  mental: z.string().optional().describe('সাধারণ মানসিক অবস্থা (Mental Generals)।'),
  srp: z.string().optional().describe('সামগ্রিক বৈশিষ্ট্য সম্পর্কিত অদ্ভুত, বিরল বা বিশেষ লক্ষণ (SRP)।'),
});

const PastHistorySchema = z.object({
  disease: z.string().optional().describe('পূর্ববর্তী রোগের ইতিহাস।'),
  personal: z.string().optional().describe('ব্যক্তিগত ইতিহাস।'),
  family: z.string().optional().describe('পারিবারিক রোগের ইতিহাস।'),
  treatment: z.string().optional().describe('পূর্ববর্তী চিকিৎসার ইতিহাস।'),
  srp: z.string().optional().describe('অতীত ইতিহাস সম্পর্কিত অদ্ভুত, বিরল বা বিশেষ লক্ষণ (SRP)।'),
});

const ComplaintAnalyzerOutputSchema = z.object({
  location: LocationSchema.describe('রোগের অবস্থান সম্পর্কিত তথ্য।'),
  causation: CausationSchema.describe('রোগের কারণ সম্পর্কিত তথ্য।'),
  sensation: SensationSchema.describe('রোগীর অনুভূতি সম্পর্কিত তথ্য।'),
  modalities: ModalitiesSchema.describe('লক্ষণের হ্রাস-বৃদ্ধি সম্পর্কিত তথ্য।'),
  concomitant: ConcomitantSchema.describe('প্রধান লক্ষণের সাথে সম্পর্কিত অন্যান্য সহগামী লক্ষণ।'),
  generalities: GeneralitiesSchema.describe('রোগীর সামগ্রিক শারীরিক ও মানসিক বৈশিষ্ট্য।'),
  pastHistory: PastHistorySchema.describe('রোগীর অতীত রোগের, ব্যক্তিগত, পারিবারিক এবং চিকিৎসার ইতিহাস।'),
  srpSummary: z.string().optional().describe('A concise summary of all the key guiding Strange, Rare, and Peculiar (SRP) symptoms identified across all categories. This should be a readable paragraph.'),
});
export type ComplaintAnalyzerOutput = z.infer<typeof ComplaintAnalyzerOutputSchema>;


// Exported wrapper function for the UI to call.
export async function analyzeComplaint(input: ComplaintAnalyzerInput): Promise<ComplaintAnalyzerOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('AI পরিষেবা কনফিগার করা যায়নি। GEMINI_API_KEY সেট করা নেই।');
  }
  return complaintAnalyzerFlow(input);
}

// Define the Genkit prompt for the AI model.
const complaintAnalyzerPrompt = ai.definePrompt({
  name: 'complaintAnalyzerPrompt',
  input: { schema: ComplaintAnalyzerInputSchema },
  output: { schema: ComplaintAnalyzerOutputSchema },
  config: {
    temperature: 0.2,
     safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an expert homeopathic doctor's assistant. Your task is to analyze the patient's symptoms provided in Bengali and perform two steps:

Step 1: Categorize Symptoms
Analyze the text and categorize them according to the 7 key principles of homeopathy. For each category, you must separate the information into two parts:
1.  **General Part**: Contains the common, expected symptoms. For 'Modalities', list aggravations and ameliorations here. For 'Generalities', list physical and mental generals. For 'Past History', list all historical details.
2.  **Peculiarity (SRP) Part**: This is crucial. You must identify and extract only the "Strange, Rare, and Peculiar" (SRP) symptoms. These are the unique, guiding symptoms.

Here are the 7 categories:
- **Location (অবস্থান)**
- **Causation (কারণ)**
- **Sensation (অনুভূতি)**
- **Modalities (হ্রাস/বৃদ্ধি)**
- **Concomitant (সহগামী লক্ষণ)**
- **Generalities (সামগ্রিক বৈশিষ্ট্য)**
- **Past History (অতীত ইতিহাস)**

Step 2: Create SRP Summary
After categorizing all symptoms, review ALL the SRP fields you have filled. Create a concise, readable paragraph in Bengali that summarizes all these key guiding symptoms. Place this summary in the \`srpSummary\` field.

Follow these rules strictly:
- The final output MUST be a valid JSON object matching the provided schema.
- If no information is found for a specific field (e.g., no SRP symptom for 'Location'), leave that field as an empty string.
- Provide all responses in Bengali.

Patient's Symptoms Text:
{{{symptoms}}}

Now, analyze the text and provide the structured JSON output including the final SRP summary.`,
});

// Define the Genkit flow that orchestrates the process.
const complaintAnalyzerFlow = ai.defineFlow(
  {
    name: 'complaintAnalyzerFlow',
    inputSchema: ComplaintAnalyzerInputSchema,
    outputSchema: ComplaintAnalyzerOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await complaintAnalyzerPrompt(input);
      if (!output) {
        throw new Error('AI did not return any analysis.');
      }
      return output;
    } catch (error: unknown) {
      console.error('Error in complaintAnalyzerFlow:', error);
      let errorMessage = 'AI বিশ্লেষণ করতে একটি অপ্রত্যাশিত সমস্যা হয়েছে।';
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
         if (msg.includes('api key') || msg.includes('permission denied') || msg.includes('authentication')) {
            errorMessage = 'AI পরিষেবা কনফিগার করা যায়নি। অনুগ্রহ করে আপনার GEMINI_API_KEY এবং বিলিং সেটিংস যাচাই করুন।';
        } else if (msg.includes('json')) {
            errorMessage = 'AI মডেল একটি ভুল উত্তর দিয়েছে যা প্রসেস করা সম্ভব হচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।';
        } else if (msg.includes('503') || msg.includes('unavailable') || msg.includes('internal error')) {
            errorMessage = 'AI পরিষেবাটি বর্তমানে ওভারলোড বা недоступ্য। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।';
        } else {
            errorMessage = error.message;
        }
      }
      throw new Error(errorMessage);
    }
  }
);
