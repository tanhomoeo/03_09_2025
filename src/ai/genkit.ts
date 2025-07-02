/**
 * @fileOverview Initializes and exports the Genkit AI instance.
 * This instance is configured with the Google AI plugin.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// The plugin will automatically look for GOOGLE_API_KEY or GEMINI_API_KEY
// in the environment variables.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // Note: `logLevel` and `enableTracingAndMetrics` are not configured directly in `genkit()` in v1.x.
  // Telemetry and logging are typically handled by plugins or specific configurations.
});
