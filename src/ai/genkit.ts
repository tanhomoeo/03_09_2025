import 'server-only';
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

export const ai = genkit({
  plugins: [
    googleAI({ 
      apiKey: process.env.GOOGLE_GENAI_API_KEY as string 
    }),
  ],
});
