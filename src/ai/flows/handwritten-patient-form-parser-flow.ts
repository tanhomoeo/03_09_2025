'use server';
/**
 * @fileOverview A Genkit flow to parse a handwritten patient form using multimodal AI.
 *
 * This flow takes an image of a handwritten form (in Bengali), uses Gemini to perform
 * OCR and structured data extraction, and returns the patient's information in a
 * structured format suitable for populating a form.
 *
 * - parseHandwrittenForm - A function that handles the form parsing process.
 * - HandwrittenFormInput - The input type for the parseHandwrittenForm function.
 * - HandwrittenFormOutput - The return type for the parseHandwrittenForm function.
 */

import { ai } from '../genkit';
import { z } from 'genkit';

// Input schema: An image of the form as a data URI.
const HandwrittenFormInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a handwritten patient registration form, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type HandwrittenFormInput = z.infer<typeof HandwrittenFormInputSchema>;

// Output schema: The structured data extracted from the form.
// All fields are optional, as they may not be present or legible in the image.
const HandwrittenFormOutputSchema = z.object({
  name: z.string().optional().describe("রোগীর পুরো নাম (Patient's full name)."),
  phone: z.string().optional().describe("রোগীর ফোন নম্বর (Patient's phone number)."),
  guardianName: z.string().optional().describe("অভিভাবকের নাম (Guardian's name)."),
  villageUnion: z.string().optional().describe("গ্রাম বা ইউনিয়ন (Village or Union)."),
  thanaUpazila: z.string().optional().describe("থানা বা উপজেলা (Thana or Upazila)."),
  district: z.string().optional().describe("জেলা (District)."),
  age: z.string().optional().describe("রোগীর বয়স (Patient's age)."),
});
export type HandwrittenFormOutput = z.infer<typeof HandwrittenFormOutputSchema>;

// Exported wrapper function for the UI to call.
export async function parseHandwrittenForm(input: HandwrittenFormInput): Promise<HandwrittenFormOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('AI পরিষেবা কনফিগার করা যায়নি। GEMINI_API_KEY সেট করা নেই।');
  }
  return handwrittenFormParserFlow(input);
}

// Define the Genkit prompt for the AI model.
const formParserPrompt = ai.definePrompt({
  name: 'handwrittenFormParserPrompt',
  input: { schema: HandwrittenFormInputSchema },
  output: { schema: HandwrittenFormOutputSchema },
  config: {
    temperature: 0.1,
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an expert data entry assistant for a clinic in Bangladesh. 
Your task is to analyze the following image of a handwritten patient registration form. The text is in Bengali.

Carefully read the handwritten text and extract ONLY the following information that matches the fields in our application:
- Patient's Name (রোগীর নাম)
- Phone Number (মোবাঃ / ফোন)
- Guardian's Name (পিতা / স্বামীর নাম)
- Village (গ্রাম)
- Upazila (উপজেলা)
- District (জেলা)
- Age (বয়স)

IGNORE all other fields like "পেশা", "শারীরিক গড়ন", "চুলের বর্ণ", "বৈবাহিক অবস্থা", "উচ্চতা", etc. Only extract data for the fields listed above.

Return the extracted information in a structured JSON format. If a piece of information is not present or is illegible, omit that field from the output. Pay close attention to correctly identifying and transcribing the phone number, removing any prefix like "মোবাঃ".

Image of the form:
{{media url=photoDataUri}}`,
});

// Define the Genkit flow that orchestrates the process.
const handwrittenFormParserFlow = ai.defineFlow(
  {
    name: 'handwrittenFormParserFlow',
    inputSchema: HandwrittenFormInputSchema,
    outputSchema: HandwrittenFormOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await formParserPrompt(input);
      if (!output) {
        throw new Error('AI পার্সার কোনো আউটপুট দেয়নি।');
      }

      // Optionally, clean up the phone number if the model returns it with extra text.
      if (output && output.phone) {
        const phoneMatch = output.phone.match(/(\+88)?01\d{9}/);
        output.phone = phoneMatch ? phoneMatch[0] : undefined;
      }
      
      return output;
    } catch (error: unknown) {
      console.error('Error in handwrittenFormParserFlow:', error);
      let errorMessage = 'হাতে লেখা ফর্ম পার্স করতে ব্যর্থ। AI মডেল একটি সমস্যার সম্মুখীন হয়েছে।';
      if(error instanceof Error) {
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
