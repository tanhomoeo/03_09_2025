
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

import { ai } from '@/ai/genkit';
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
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.length < 10) {
    throw new Error('AI পরিষেবা কনফিগার করা নেই। অনুগ্রহ করে `.env` ফাইলে আপনার `GOOGLE_API_KEY` যোগ করুন এবং সার্ভার রিস্টার্ট করুন।');
  }
  return handwrittenFormParserFlow(input);
}

// Define the Genkit prompt for the AI model.
const formParserPrompt = ai.definePrompt({
  name: 'handwrittenFormParserPrompt',
  input: { schema: HandwrittenFormInputSchema },
  output: { schema: HandwrittenFormOutputSchema },
  model: 'gemini-1.5-flash-latest', // A powerful multimodal model
  prompt: `You are an expert data entry assistant for a clinic in Bangladesh. 
Your task is to analyze the following image of a handwritten patient registration form. The text is in Bengali.

Carefully read the handwritten text and extract the following information:
- Patient's Name (নাম)
- Phone Number (ফোন / মোবাইল)
- Guardian's Name (পিতা / স্বামী / অভিভাবকের নাম)
- Village/Union (গ্রাম/ইউনিয়ন)
- Thana/Upazila (থানা/উপজেলা)
- District (জেলা)
- Age (বয়স)

Return the extracted information in a structured JSON format. If a piece of information is not present or is illegible, omit that field from the output. Pay close attention to correctly identifying and transcribing the phone number.

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
      if (output.phone) {
        const phoneMatch = output.phone.match(/(\+88)?01\d{9}/);
        output.phone = phoneMatch ? phoneMatch[0] : undefined;
      }
      
      return output;
    } catch (error: any) {
      console.error('Error in handwrittenFormParserFlow:', error);
      let errorMessage = 'হাতে লেখা ফর্ম পার্স করতে ব্যর্থ। AI মডেল একটি সমস্যার সম্মুখীন হয়েছে।';
      if (error && error.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes('api key') || msg.includes('failed_precondition') || (error.cause?.code === 'UNAUTHENTICATED')) {
           errorMessage = 'AI পরিষেবা কনফিগার করা যায়নি। অনুগ্রহ করে নিশ্চিত করুন যে আপনার `.env` ফাইলে সঠিক GOOGLE_API_KEY সেট করা আছে এবং আপনার Google Cloud প্রজেক্টে Vertex AI API চালু রয়েছে।';
        } else if (msg.includes('permission denied') || msg.includes('permission_denied') || msg.includes("api not enabled") || (error.cause?.code === 'PERMISSION_DENIED')) {
           errorMessage = 'AI পরিষেবা ব্যবহারের জন্য আপনার অনুমতি নেই। অনুগ্রহ করে নিশ্চিত করুন যে আপনার Google Cloud প্রজেক্টে "Vertex AI API" চালু আছে এবং বিলিং অ্যাকাউন্ট সঠিকভাবে সংযুক্ত আছে।';
        }
      }
      throw new Error(errorMessage);
    }
  }
);
