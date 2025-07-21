import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

if (!process.env.GEMINI_API_KEY) {
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      'GEMINI_API_KEY is not set. AI features will not be available.'
    );
  } else {
    // In development, we can throw an error to make it obvious.
    // throw new Error('GEMINI_API_KEY is not set. Please set it in your .env file.');
    console.warn('GEMINI_API_KEY is not set. Please set it in your .env file.');
  }
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});
