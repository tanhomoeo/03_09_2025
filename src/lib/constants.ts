
export const ROUTES = {
  DASHBOARD: '/dashboard',
  PATIENT_ENTRY: '/entry',
  PATIENT_SEARCH: '/search',
  DAILY_REPORT: '/report',
  SLIP_SEARCH: '/slip',
  DICTIONARY: '/dictionary',
  PRESCRIPTION: '/prescription',
  CLINIC_INFORMATION: '/clinic-information',
  APP_SETTINGS: '/settings',
  AI_SUMMARY: '/ai-summary',
  MEDICINE_INSTRUCTIONS: '/medicine-instructions',
  STORE_MANAGEMENT: '/store-management',
  PERSONAL_EXPENSES: '/personal-expenses',
  REPERTORY_BROWSER: '/repertory',
  COURIER: '/courier',
  LOGIN: '/',
};

export const APP_NAME = 'ত্রিফুল আরোগ্য নিকেতন';
export const APP_VERSION = '1.15.0';

// To grant admin privileges, add Firebase Authentication UIDs to this array.
// You can find the UID in the Firebase Console > Authentication > Users table.
// Example: export const ADMIN_USER_IDS: string[] = ['your-admin-uid-here', 'another-admin-uid'];
export const ADMIN_USER_IDS: string[] = ['2uVscE2nJzUoVlT2PyuH6YRm5D22'];

export const BENGALI_VOWELS_FOR_FILTER = ['সব', 'অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ'];
export const BENGALI_CONSONANTS_FOR_FILTER = [
  'ক', 'খ', 'গ', 'ঘ', 'ঙ',
  'চ', 'ছ', 'জ', 'ঝ', 'ঞ',
  'ট', 'ঠ', 'ড', 'ঢ', 'ণ',
  'ত', 'থ', 'দ', 'ধ', 'ন',
  'প', 'ফ', 'ব', 'ভ', 'ম',
  'য', 'র', 'ল', 'শ', 'ষ', 'স', 'হ', 'ড়', 'ঢ়', 'য়', 'ৎ', 'ং', 'ঃ', 'ঁ'
];
