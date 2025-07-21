import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      'GEMINI_API_KEY is not set. AI features will not be available.'
    );
  } else {
    console.warn(
      'GEMINI_API_KEY is not set. AI features will not work. Please set it in your .env file.'
    );
  }
}

export const ai = genkit({
  plugins: [
    googleAI(geminiApiKey ? {apiKey: geminiApiKey} : undefined),
  ],
  model: 'googleai/gemini-1.5-flash',
});
