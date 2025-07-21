import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

// Import models from the Google AI plugin. The Google AI API provides access to
// several generative models. Here, we import Gemini 1.5 Flash.
import { gemini15Flash } from "@genkit-ai/googleai";

const ai = genkit({
  plugins: [
    // Load the Google AI plugin. You can optionally specify your API key
    // by passing in a config object; if you don't, the Google AI plugin uses
    // the value from the GOOGLE_GENAI_API_KEY environment variable, which is
    // the recommended practice.
    googleAI(),
  ],
});

// Define a simple flow that prompts an LLM to generate menu suggestions.
const menuSuggestionFlow = ai.defineFlow({
  name: "menuSuggestionFlow",
  inputSchema: z.string().describe("A restaurant theme").default("seafood"),
  outputSchema: z.string(),
  streamSchema: z.string(),
}, async (subject, { sendChunk }) => {
  // Construct a request and send it to the model API.
  const prompt =
    `Suggest an item for the menu of a ${subject} themed restaurant`;
  const { response, stream } = ai.generateStream({
    model: gemini15Flash,
    prompt: prompt,
    config: {
      temperature: 1,
    },
  });

  for await (const chunk of stream) {
    sendChunk(chunk.text);
  }

  // Handle the response from the model API. In this sample, we just
  // convert it to a string, but more complicated flows might coerce the
  // response into structured output or chain the response into another
  // LLM call, etc.
  return (await response).text;
});

// Export the flow as a Firebase HTTPS callable function using firebase-functions SDK
import * as functions from "firebase-functions";

export const menuSuggestion = functions.https.onCall(async (data, context) => {
  // You can add auth checks here if needed, e.g. context.auth

  // Call the flow with the input data
  const result = await menuSuggestionFlow.run(data.text);

  return result;
});