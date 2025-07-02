
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc,
  writeBatch,
  limit,
} from 'firebase/firestore';
import type { Patient, Visit, Prescription, PaymentSlip, ClinicSettings, PaymentMethod } from './types';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isValid } from 'date-fns';

// --- Data Conversion Helpers ---

const convertTimestampsToISO = (data: any): any => {
  if (!data) return data;
  const result = { ...data };
  for (const key in result) {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate().toISOString();
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      // Recursively convert for nested objects (e.g., items in prescription)
      if (Array.isArray(result[key])) {
        result[key] = result[key].map(item => typeof item === 'object' ? convertTimestampsToISO(item) : item);
      } else {
        result[key] = convertTimestampsToISO(result[key]);
      }
    }
  }
  return result;
};

const convertDocument = <T extends { id: string }>(docSnap: any): T => {
  return convertTimestampsToISO({ ...docSnap.data(), id: docSnap.id }) as T;
};

const prepareDataForFirestore = (data: any): any => {
  if (!data) return data;
  const result = { ...data };
  // Convert known date string fields to Timestamps
  const dateFields = ['createdAt', 'updatedAt', 'visitDate', 'registrationDate', 'date'];
  for (const key in result) {
    if (dateFields.includes(key) && typeof result[key] === 'string') {
      const dateObj = new Date(result[key]);
      if (isValid(dateObj)) {
        result[key] = Timestamp.fromDate(dateObj);
      } else {
        console.warn(`Invalid date string for field ${key}: ${result[key]}`);
        delete result[key]; // Remove invalid date to avoid Firestore errors
      }
    } else if (result[key] instanceof Date) { // Handle if Date object is passed
        result[key] = Timestamp.fromDate(result[key]);
    } else if (typeof result[key] === 'object' && result[key] !== null) {
       if (Array.isArray(result[key])) {
        result[key] = result[key].map(item => typeof item === 'object' ? prepareDataForFirestore(item) : item);
      } else {
        result[key] = prepareDataForFirestore(result[key]);
      }
    }
  }
  return result;
};


// --- Patients ---
const patientsCollectionRef = collection(db, 'patients');

export const getPatients = async (): Promise<Patient[]> => {
  try {
    const q = query(patientsCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => convertDocument<Patient>(docSnap));
  } catch (error) {
    console.error("Error getting patients: ", error);
    return [];
  }
};

export const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = Timestamp.now();
    const newPatient = {
      ...patientData,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(patientsCollectionRef, prepareDataForFirestore(newPatient));
    return docRef.id;
  } catch (error) {
    console.error("Error adding patient: ", error);
    throw error;
  }
};

export const updatePatient = async (patientId: string, patientData: Partial<Omit<Patient, 'id' | 'createdAt'>>): Promise<boolean> => {
  try {
    const patientRef = doc(db, 'patients', patientId);
    const updatedData = {
      ...patientData,
      updatedAt: Timestamp.now(),
    };
    await updateDoc(patientRef, prepareDataForFirestore(updatedData));
    return true;
  } catch (error) {
    console.error("Error updating patient: ", error);
    return false;
  }
};

export const getPatientById = async (id: string): Promise<Patient | null> => {
  try {
    const patientRef = doc(db, 'patients', id);
    const docSnap = await getDoc(patientRef);
    return docSnap.exists() ? convertDocument<Patient>(docSnap) : null;
  } catch (error) {
    console.error("Error getting patient by ID: ", error);
    return null;
  }
};

export const getPatientsRegisteredWithinDateRange = async (startDate: Date, endDate: Date): Promise<Patient[]> => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    const q = query(patientsCollectionRef,
                    where('createdAt', '>=', startTimestamp),
                    where('createdAt', '<=', endTimestamp),
                    orderBy('createdAt', 'desc')
                   );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => convertDocument<Patient>(docSnap));
  } catch (error) {
    console.error("Error getting patients registered within date range: ", error);
    return [];
  }
};

// --- Visits ---
const visitsCollectionRef = collection(db, 'visits');

export const getVisits = async (): Promise<Visit[]> => {
  try {
    const q = query(visitsCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => convertDocument<Visit>(docSnap));
  } catch (error) {
    console.error("Error getting all visits: ", error);
    return [];
  }
};

export const addVisit = async (visitData: Omit<Visit, 'id' | 'createdAt'>): Promise<string | null> => {
  try {
    const newVisit = {
      ...visitData,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(visitsCollectionRef, prepareDataForFirestore(newVisit));
    return docRef.id;
  } catch (error) {
    console.error("Error adding visit: ", error);
    return null;
  }
};

export const updateVisit = async (visitId: string, visitData: Partial<Omit<Visit, 'id' | 'createdAt'>>): Promise<boolean> => {
  try {
    const visitRef = doc(db, 'visits', visitId);
    await updateDoc(visitRef, prepareDataForFirestore(visitData));
    return true;
  } catch (error) {
    console.error("Error updating visit: ", error);
    return false;
  }
};

export const createVisitForPrescription = async (
  patientId: string,
  symptoms: string = "পুনরায় সাক্ষাৎ / Follow-up",
  medicineDeliveryMethod: 'direct' | 'courier' = 'direct'
): Promise<string | null> => {
  try {
    const visitData: Omit<Visit, 'id' | 'createdAt'> = {
      patientId,
      visitDate: new Date().toISOString(), 
      symptoms,
      medicineDeliveryMethod, // Added this field
    };
    const newVisit = {
      ...visitData,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(visitsCollectionRef, prepareDataForFirestore(newVisit));
    return docRef.id;
  } catch (error) {
    console.error("Error creating visit for prescription: ", error);
    return null;
  }
};


export const getVisitsByPatientId = async (patientId: string): Promise<Visit[]> => {
  try {
    const q = query(visitsCollectionRef, where('patientId', '==', patientId), orderBy('visitDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => convertDocument<Visit>(docSnap));
  } catch (error) {
    console.error("Error getting visits by patient ID: ", error);
    return [];
  }
};

export const getVisitById = async (id: string): Promise<Visit | null> => {
  try {
    const visitRef = doc(db, 'visits', id);
    const docSnap = await getDoc(visitRef);
    return docSnap.exists() ? convertDocument<Visit>(docSnap) : null;
  } catch (error) {
    console.error("Error getting visit by ID: ", error);
    return null;
  }
};

export const getVisitsWithinDateRange = async (startDate: Date, endDate: Date): Promise<Visit[]> => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    const q = query(visitsCollectionRef,
                    where('visitDate', '>=', startTimestamp),
                    where('visitDate', '<=', endTimestamp),
                    orderBy('visitDate', 'desc'),
                    orderBy('createdAt', 'desc')
                  );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => convertDocument<Visit>(docSnap));
  } catch (error) {
    console.error("Error getting visits within date range: ", error);
    return [];
  }
};


// --- Prescriptions ---
const prescriptionsCollectionRef = collection(db, 'prescriptions');

export const getPrescriptions = async (): Promise<Prescription[]> => {
  try {
    const q = query(prescriptionsCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => convertDocument<Prescription>(docSnap));
  } catch (error) {
    console.error("Error getting prescriptions: ", error);
    return [];
  }
};

export const addPrescription = async (prescriptionData: Omit<Prescription, 'id' | 'createdAt'>): Promise<string | null> => {
  try {
    const newPrescription = {
      ...prescriptionData,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(prescriptionsCollectionRef, prepareDataForFirestore(newPrescription));
    return docRef.id;
  } catch (error) {
    console.error("Error adding prescription: ", error);
    return null;
  }
};

export const updatePrescription = async (prescriptionId: string, prescriptionData: Partial<Omit<Prescription, 'id' | 'createdAt'>>): Promise<boolean> => {
  try {
    const presRef = doc(db, 'prescriptions', prescriptionId);
    await updateDoc(presRef, prepareDataForFirestore(prescriptionData));
    return true;
  } catch (error) {
    console.error("Error updating prescription: ", error);
    return false;
  }
};


export const getPrescriptionById = async (id: string): Promise<Prescription | null> => {
  try {
    const presRef = doc(db, 'prescriptions', id);
    const docSnap = await getDoc(presRef);
    return docSnap.exists() ? convertDocument<Prescription>(docSnap) : null;
  } catch (error) {
    console.error("Error getting prescription by ID: ", error);
    return null;
  }
};

export const getPrescriptionsByPatientId = async (patientId: string): Promise<Prescription[]> => {
  try {
    const q = query(prescriptionsCollectionRef, where('patientId', '==', patientId), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => convertDocument<Prescription>(docSnap));
  } catch (error) {
    console.error("Error getting prescriptions by patient ID: ", error);
    return [];
  }
};


// --- Payment Slips ---
const paymentSlipsCollectionRef = collection(db, 'paymentSlips');

export const getPaymentSlips = async (): Promise<PaymentSlip[]> => {
  try {
    const q = query(paymentSlipsCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => convertDocument<PaymentSlip>(docSnap));
  } catch (error) {
    console.error("Error getting all payment slips: ", error);
    return [];
  }
};

export const addPaymentSlip = async (slipData: Omit<PaymentSlip, 'id' | 'createdAt'>): Promise<string | null> => {
  try {
     const newSlip = {
      ...slipData,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(paymentSlipsCollectionRef, prepareDataForFirestore(newSlip));
    return docRef.id;
  } catch (error) {
    console.error("Error adding payment slip: ", error);
    return null;
  }
};

export const getPaymentSlipsByPatientId = async (patientId: string): Promise<PaymentSlip[]> => {
  try {
    const q = query(paymentSlipsCollectionRef, where('patientId', '==', patientId), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => convertDocument<PaymentSlip>(docSnap));
  } catch (error) {
    console.error("Error getting payment slips by patient ID: ", error);
    return [];
  }
};

export const getPaymentSlipsWithinDateRange = async (startDate: Date, endDate: Date): Promise<PaymentSlip[]> => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    const q = query(paymentSlipsCollectionRef,
                    where('date', '>=', startTimestamp),
                    where('date', '<=', endTimestamp),
                    orderBy('date', 'desc')
                   );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => convertDocument<PaymentSlip>(docSnap));
  } catch (error) {
    console.error("Error getting payment slips within date range: ", error);
    return [];
  }
};


// --- Settings ---
const settingsDocRef = doc(db, 'settings', 'clinic');

export const getClinicSettings = async (): Promise<ClinicSettings> => {
  try {
    const docSnap = await getDoc(settingsDocRef);
    const defaultSettings: ClinicSettings = {
      clinicName: 'ত্রিফুল আরোগ্য নিকেতন',
      doctorName: '',
      clinicAddress: '',
      clinicContact: '',
      bmRegNo: '',
    };
    if (docSnap.exists()) {
      return { ...defaultSettings, ...docSnap.data() } as ClinicSettings;
    }
    return defaultSettings;
  } catch (error) {
    console.error("Error getting clinic settings: ", error);
    return {
      clinicName: 'ত্রিফুল আরোগ্য নিকেতন',
      doctorName: '',
      clinicAddress: '',
      clinicContact: '',
      bmRegNo: '',
    };
  }
};

export const saveClinicSettings = async (settings: ClinicSettings): Promise<boolean> => {
  try {
    // Ensure no nextDiaryNumber is saved
    const { ...settingsToSave } = settings;
    if ('nextDiaryNumber' in settingsToSave) {
        delete (settingsToSave as any).nextDiaryNumber;
    }
    await setDoc(settingsDocRef, settingsToSave);
    return true;
  } catch (error) {
    console.error("Error saving clinic settings: ", error);
    return false;
  }
};


// --- Date & Utility helpers ---
export const isToday = (dateStringOrDate: string | Date): boolean => {
    if (!dateStringOrDate) return false;
    const date = typeof dateStringOrDate === 'string' ? new Date(dateStringOrDate) : dateStringOrDate;
    if (!isValid(date)) return false;
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
};

export const isThisMonth = (dateStringOrDate: string | Date): boolean => {
  if (!dateStringOrDate) return false;
  const date = typeof dateStringOrDate === 'string' ? new Date(dateStringOrDate) : dateStringOrDate;
  if (!isValid(date)) return false;
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth();
};

export const formatDate = (dateString?: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (!isValid(date)) return 'Invalid Date';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'short', day: 'numeric',
    ...options
  };
  try {
    return date.toLocaleDateString('bn-BD', defaultOptions);
  } catch (e) {
    console.warn(`Error formatting date: ${dateString}`, e);
    return 'Invalid Date'; // Fallback
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount);
};

// Updated PAYMENT_METHOD_LABELS
export const PAYMENT_METHOD_LABELS: Record<Exclude<PaymentMethod, ''>, string> = {
  cash: 'ক্যাশ',
  bkash: 'বিকাশ',
  nagad: 'নগদ',
  rocket: 'রকেট',
  other: 'অন্যান্য',
};

export const getPaymentMethodLabel = (methodValue?: PaymentMethod): string => {
  if (!methodValue) return 'N/A';
  return PAYMENT_METHOD_LABELS[methodValue as Exclude<PaymentMethod, ''>] || 'N/A';
};

export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const validDate = isValid(date) ? date : new Date();
  const start = startOfWeek(validDate, { weekStartsOn: 0 }); // Sunday as start of week
  const end = endOfWeek(validDate, { weekStartsOn: 0 });
  return { start, end };
};

export const getMonthRange = (date: Date): { start: Date; end: Date } => {
  const validDate = isValid(date) ? date : new Date();
  const start = startOfMonth(validDate);
  const end = endOfMonth(validDate);
  return { start, end };
};
