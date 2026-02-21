import 'server-only';
import { googleAI } from '@genkit-ai/googleai';
import { genkit, type Plugin } from 'genkit';

const plugins: Plugin[] = [];

if (process.env.GEMINI_API_KEY) {
  plugins.push(googleAI({ apiKey: process.env.GEMINI_API_KEY as string }));
}

export const ai = genkit({
  plugins,
});
