
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK.
// This is the standard way to initialize in a Cloud Functions environment.
// The SDK will automatically use the project's service account credentials.
admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// Example of a callable function:
//
// import {onCall} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";
//
// export const helloWorld = onCall((request) => {
//   logger.info("Hello logs!", {structuredData: true});
//   return {
//     message: "Hello from " + (request.auth?.token.name || "anonymous")
//   };
// });

// Example of a Firestore trigger:
//
// import {onDocumentWritten} from "firebase-functions/v2/firestore";
//
// export const makeuppercase = onDocumentWritten("/messages/{documentId}", (event) => {
//   const original = event.data?.after.data().original;
//   return event.data?.after.ref.update({uppercase: original.toUpperCase()});
// });
