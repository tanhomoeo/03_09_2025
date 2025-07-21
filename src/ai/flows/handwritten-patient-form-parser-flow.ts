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

import {ai} from '../genkit';
import {z} from 'genkit';

const HandwrittenFormInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a handwritten patient registration form, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type HandwrittenFormInput = z.infer<typeof HandwrittenFormInputSchema>;

const HandwrittenFormOutputSchema = z.object({
  name: z.string().optional().describe("রোগীর পুরো নাম (Patient's full name)."),
  phone: z
    .string()
    .optional()
    .describe("রোগীর ফোন নম্বর (Patient's phone number)."),
  guardianName: z
    .string()
    .optional()
    .describe("অভিভাবকের নাম (Guardian's name)."),
  villageUnion: z
    .string()
    .optional()
    .describe("গ্রাম বা ইউনিয়ন (Village or Union)."),
  thanaUpazila: z
    .string()
    .optional()
    .describe("থানা বা উপজেলা (Thana or Upazila)."),
  district: z.string().optional().describe('জেলা (District).'),
  age: z.string().optional().describe("রোগীর বয়স (Patient's age)."),
});
export type HandwrittenFormOutput = z.infer<
  typeof HandwrittenFormOutputSchema
>;

export async function parseHandwrittenForm(
  input: HandwrittenFormInput
): Promise<HandwrittenFormOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'AI পরিষেবা কনফিগার করা যায়নি। GEMINI_API_KEY সেট করা নেই।'
    );
  }
  return handwrittenFormParserFlow(input);
}

const formParserPrompt = ai.definePrompt({
  name: 'handwrittenFormParserPrompt',
  input: {schema: HandwrittenFormInputSchema},
  output: {schema: HandwrittenFormOutputSchema},
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

const handwrittenFormParserFlow = ai.defineFlow(
  {
    name: 'handwrittenFormParserFlow',
    inputSchema: HandwrittenFormInputSchema,
    outputSchema: HandwrittenFormOutputSchema,
  },
  async input => {
    try {
      const {output} = await formParserPrompt(input);
      if (!output) {
        throw new Error('AI পার্সার কোনো আউটপুট দেয়নি।');
      }

      if (output && output.phone) {
        const phoneMatch = output.phone.match(/(\+88)?01\d{9}/);
        output.phone = phoneMatch ? phoneMatch[0] : undefined;
      }

      return output;
    } catch (error: unknown) {
      console.error('Error in handwrittenFormParserFlow:', error);
       let errorMessage = 'হাতে লেখা ফর্ম পার্স করতে ব্যর্থ। AI মডেল একটি সমস্যার সম্মুখীন হয়েছে।';
      if (error instanceof Error) {
         if (error.message.startsWith('AI পরিষেবা কনফিগার করা যায়নি')) {
          throw error;
        }

        const msg = error.message.toLowerCase();
        if (msg.includes('api key') || msg.includes('permission denied') || msg.includes('authentication')) {
          errorMessage = 'AI পরিষেবা কনফিগার করা যায়নি। অনুগ্রহ করে আপনার GEMINI_API_KEY এবং বিলিং সেটিংস যাচাই করুন।';
        } else if (msg.includes('json') || msg.includes('zod')) {
          errorMessage = 'AI একটি ভুল উত্তর দিয়েছে যা প্রসেস করা সম্ভব হচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।';
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
