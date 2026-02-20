import 'server-only';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';
import { configureGenkit } from '@genkit-ai/core';

export const ai = configureGenkit({
  plugins: [
    firebase(),
    googleAI({ 
      apiKey: process.env.GOOGLE_GENAI_API_KEY as string 
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
