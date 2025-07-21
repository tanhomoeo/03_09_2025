'use server';
/**
 * @fileOverview A Genkit flow to analyze patient complaints in Bengali,
 * summarize them into key points, and suggest potential homeopathic medicines
 * with appropriate disclaimers.
 *
 * - analyzeComplaint - A function that handles the complaint analysis.
 * - ComplaintAnalyzerInput - The input type for the analyzeComplaint function.
 * - ComplaintAnalyzerOutput - The return type for the analyzeComplaint function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define Zod schema for input
const ComplaintAnalyzerInputSchema = z.object({
  complaintText: z.string().min(10, { message: "অনুগ্রহ করে রোগীর সম্পূর্ণ অভিযোগ বিস্তারিতভাবে লিখুন।" }).describe('The patient\'s complaint in Bengali language.'),
});
export type ComplaintAnalyzerInput = z.infer<typeof ComplaintAnalyzerInputSchema>;

// Define Zod schema for output
const ComplaintAnalyzerOutputSchema = z.object({
  summaryPoints: z.array(z.string()).describe('An array of strings, where each string is a key point summarized from the complaint.'),
  medicineSuggestions: z.array(z.string()).describe('An array of strings, where each string is a suggested homeopathic medicine with potency and a brief note in Bengali (e.g., "Arnica Montana 30C - আঘাত ও ব্যথার জন্য"). This is only a suggestion for consideration and not a final prescription.'),
});
export type ComplaintAnalyzerOutput = z.infer<typeof ComplaintAnalyzerOutputSchema>;

// Exported wrapper function to be called from the UI
export async function analyzeComplaint(input: ComplaintAnalyzerInput): Promise<ComplaintAnalyzerOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "আপনার_কপি_করা_API_কী_এখানে_দিন" || apiKey.length < 10) {
    throw new Error('AI পরিষেবা কনফিগার করা নেই। অনুগ্রহ করে `.env` ফাইলে আপনার GEMINI_API_KEY যোগ করুন এবং সার্ভার রিস্টার্ট করুন।');
  }

  const validationResult = ComplaintAnalyzerInputSchema.safeParse(input);
  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues.map(issue => issue.message).join(', ');
    console.error("Invalid input for analyzeComplaint:", validationResult.error.format());
    throw new Error(`ইনপুট ডেটা সঠিক নয়: ${errorMessages}`);
  }
  return complaintAnalyzerFlow(validationResult.data);
}

// Define the Genkit prompt
const complaintAnalysisPrompt = ai.definePrompt({
  name: 'complaintAnalysisPrompt',
  input: { schema: ComplaintAnalyzerInputSchema },
  output: { schema: ComplaintAnalyzerOutputSchema },
  config: {
    model: 'gemini-1.5-flash',
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `আপনি একজন অভিজ্ঞ হোমিওপ্যাথিক सहायक। ব্যবহারকারী বাংলা ভাষায় রোগীর অভিযোগ জানাবেন।
আপনার কাজগুলো হলো:
১. রোগীর অভিযোগটি মনোযোগ দিয়ে বিশ্লেষণ করা।
২. অভিযোগের প্রধান লক্ষণ এবং সমস্যাগুলো কয়েকটি সংক্ষিপ্ত ও স্পষ্ট বাংলা পয়েন্ট আকারে তুলে ধরা।
৩. চিহ্নিত লক্ষণগুলির উপর ভিত্তি করে, ৩ থেকে ৫টি সম্ভাব্য প্রাসঙ্গিক হোমিওপ্যাথিক ঔষধের নাম প্রস্তাব করা। প্রতিটি ঔষধের নামের সাথে তার শক্তি (যেমন 30C, 200C ইত্যাদি) এবং ঔষধটি কী ধরণের প্রধান লক্ষণে প্রযোজ্য হতে পারে তার একটি সংক্ষিপ্ত বাংলা নোট যোগ করুন (উদাহরণস্বরূপ: "Belladonna 30C - হঠাৎ শুরু হওয়া তীব্র মাথা ব্যথা ও জ্বরের জন্য।")।
৪. **গুরুত্বপূর্ণ দ্রষ্টব্য:** স্পষ্টভাবে উল্লেখ করবেন যে এটি শুধুমাত্র বিবেচনার জন্য একটি পরামর্শ, কোনো চূড়ান্ত প্রেসক্রিপশন নয়। রোগীদের সর্বদা একজন যোগ্যতাসম্পন্ন চিকিৎসকের সাথে পরামর্শ করা উচিত।
৫. আপনার সম্পূর্ণ উত্তরটি অবশ্যই একটি JSON অবজেক্ট হিসেবে দিতে হবে, যেখানে দুটি প্রধান কী থাকবে:
    ক) "summaryPoints": এটি একটি স্ট্রিং অ্যারে হবে, যেখানে প্রতিটি স্ট্রিং অভিযোগের একটি সারাংশ পয়েন্ট।
    খ) "medicineSuggestions": এটি একটি স্ট্রিং অ্যারে হবে, যেখানে প্রতিটি স্ট্রিং একটি প্রস্তাবিত ঔষধের নাম, শক্তি ও সংক্ষিপ্ত বিবরণ।

রোগীর অভিযোগ:
{{{complaintText}}}

Your response must be a valid JSON object matching the provided schema. Do not add any extra explanations.
`,
});

// Define the Genkit flow
const complaintAnalyzerFlow = ai.defineFlow(
  {
    name: 'complaintAnalyzerFlow',
    inputSchema: ComplaintAnalyzerInputSchema,
    outputSchema: ComplaintAnalyzerOutputSchema,
  },
  async (input) => {
    let retries = 3;
    while (retries > 0) {
      try {
        const { output } = await complaintAnalysisPrompt(input);

        if (!output) {
          throw new Error('AI বিশ্লেষণ থেকে কোনো উত্তর পাওয়া যায়নি। সম্ভবত ইনপুট কন্টেন্ট সেফটি ফিল্টার দ্বারা ব্লক করা হয়েছে অথবা মডেলটি কোনো আউটপুট দেয়নি।');
        }
        
        const validation = ComplaintAnalyzerOutputSchema.safeParse(output);
        if (!validation.success) {
            console.error('LLM output validation failed:', validation.error.format());
            throw new Error('AI মডেল একটি ভুল উত্তর দিয়েছে যা প্রসেস করা সম্ভব হচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।');
        }

        return validation.data;
      } catch (error) {
        console.error(`Full error in complaintAnalyzerFlow (attempt ${4 - retries}):`, error);

        if (error instanceof Error && error.message.includes('AI মডেল একটি ভুল উত্তর দিয়েছে') && retries > 1) {
            retries--;
            console.log(`Retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
            continue;
        }

        let errorMessage = 'অভিযোগ বিশ্লেষণ করার সময় একটি অপ্রত্যাশিত ত্রুটি হয়েছে।';
        if (error instanceof Error && error.message) {
          const msg = error.message.toLowerCase();
          const cause = (error as { cause?: { code?: string } }).cause;
          if (msg.includes('deadline') || msg.includes('timeout')) {
            errorMessage = 'AI সার্ভার থেকে উত্তর পেতে বেশি সময় লাগছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
          } else if (msg.includes('api key') || msg.includes('failed_precondition') || (cause?.code === 'UNAUTHENTICATED')) {
            errorMessage = 'AI পরিষেবা কনফিগার করা যায়নি। অনুগ্রহ করে নিশ্চিত করুন যে আপনার `.env` ফাইলে সঠিক GEMINI_API_KEY সেট করা আছে এবং আপনার Google Cloud প্রজেক্টে Vertex AI API চালু রয়েছে।';
          } else if (msg.includes('permission denied') || msg.includes('permission_denied') || msg.includes("api not enabled") || (cause?.code === 'PERMISSION_DENIED')) {
             errorMessage = 'AI পরিষেবা ব্যবহারের জন্য আপনার অনুমতি নেই। অনুগ্রহ করে নিশ্চিত করুন যে আপনার Google Cloud প্রজেক্টে "Vertex AI API" চালু আছে এবং বিলিং অ্যাকাউন্ট সঠিকভাবে সংযুক্ত আছে।';
          } else if (msg.includes('quota') || msg.includes('limit')) {
             errorMessage = 'AI পরিষেবা ব্যবহারের দৈনিক সীমা অতিক্রম করেছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
          } else if (error.message.startsWith('ইনপুট ডেটা সঠিক নয়:') || error.message.startsWith('AI মডেল একটি ভুল উত্তর দিয়েছে যা প্রসেস করা সম্ভব হচ্ছে না।') || error.message.startsWith('AI বিশ্লেষণ থেকে কোনো উত্তর পাওয়া যায়নি')) {
             errorMessage = error.message; 
          } else if (error.message.startsWith('AI পরিষেবা কনফিগার করা নেই')) {
             errorMessage = error.message;
          }
        }
        throw new Error(errorMessage);
      }
    }
    // This part should be unreachable if retries are exhausted and the last attempt throws.
    // However, to satisfy TypeScript, we throw a final error here.
    throw new Error('পুনরাবৃত্তি করার পরেও AI মডেল একটি সঠিক উত্তর দিতে ব্যর্থ হয়েছে।');
  }
);
