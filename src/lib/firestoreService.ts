import { getDbInstance } from './firebase';
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
  or,
  limit,
  arrayUnion,
} from 'firebase/firestore';
import type {
  Patient,
  Visit,
  Prescription,
  PaymentSlip,
  ClinicSettings,
  PaymentMethod,
  CategorizedCaseNotes,
  Medicine,
  PersonalExpense,
  SteadfastConsignment,
} from './types';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isValid,
} from 'date-fns';

const convertTimestampsToISO = <T>(data: unknown): T => {
  if (data instanceof Timestamp) {
    return data.toDate().toISOString() as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => convertTimestampsToISO(item)) as T;
  }
  if (data && typeof data === 'object') {
    const res: { [key: string]: unknown } = {};
    for (const key in data as Record<string, unknown>) {
      res[key] = convertTimestampsToISO((data as Record<string, unknown>)[key]);
    }
    return res as T;
  }
  return data as T;
};

const convertDocument = <T extends { id: string }>(docSnap: {
  id: string;
  data: () => unknown;
}): T => {
  const data = docSnap.data() as Record<string, unknown> | undefined;
  if (
    data &&
    data.categorizedCaseNotes &&
    typeof data.categorizedCaseNotes === 'string'
  ) {
    try {
      data.categorizedCaseNotes = JSON.parse(data.categorizedCaseNotes);
    } catch {
      console.error('Failed to parse categorizedCaseNotes');
      // If parsing fails, set it to a default/empty object to prevent crashes downstream
      data.categorizedCaseNotes = {} as CategorizedCaseNotes;
    }
  }
  return convertTimestampsToISO({ ...data, id: docSnap.id }) as T;
};

const prepareDataForFirestore = (
  data: Record<string, unknown>,
): Record<string, unknown> => {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  const result: { [key: string]: unknown } = {};

  for (const key in data) {
    if (
      Object.prototype.hasOwnProperty.call(data, key) &&
      data[key] !== undefined
    ) {
      const value = data[key];

      if (value instanceof Date) {
        result[key] = Timestamp.fromDate(value);
      } else if (
        typeof value === 'string' &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
      ) {
        const dateObj = new Date(value);
        if (isValid(dateObj)) {
          result[key] = Timestamp.fromDate(dateObj);
        } else {
          result[key] = value;
        }
      } else if (Array.isArray(value)) {
        result[key] = value.map((item) =>
          prepareDataForFirestore(item as Record<string, unknown>),
        );
      } else if (
        value !== null &&
        typeof value === 'object' &&
        !(value instanceof Timestamp)
      ) {
        result[key] = prepareDataForFirestore(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
};

const patientsCollectionRef = () => collection(getDbInstance(), 'patients');
const visitsCollectionRef = () => collection(getDbInstance(), 'visits');
const prescriptionsCollectionRef = () =>
  collection(getDbInstance(), 'prescriptions');
const paymentSlipsCollectionRef = () =>
  collection(getDbInstance(), 'paymentSlips');
const medicinesCollectionRef = () => collection(getDbInstance(), 'medicines');
const personalExpensesCollectionRef = () =>
  collection(getDbInstance(), 'personalExpenses');
const consignmentsCollectionRef = () =>
  collection(getDbInstance(), 'consignments');
const settingsDocRef = () => doc(getDbInstance(), 'settings', 'clinic');

export const getPatients = async (): Promise<Patient[]> => {
  try {
    const q = query(patientsCollectionRef(), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => convertDocument<Patient>(docSnap));
  } catch (error) {
    console.error('Error getting patients: ', error);
    return [];
  }
};

export const getPatientsByQuery = async (
  searchQuery: string,
): Promise<Patient[]> => {
  if (!searchQuery) {
    // Return all patients if query is empty, or handle as needed
    return getPatients();
  }
  const lowerCaseQuery = searchQuery.toLowerCase();
  try {
    const _q = query(
      patientsCollectionRef(),
      or(
        where('name', '>=', searchQuery),
        where('name', '<=', searchQuery + '\uf8ff'),
        where('phone', '==', searchQuery),
        where('diaryNumber', '==', searchQuery),
        // Firestore doesn't support case-insensitive or partial text search natively with this method.
        // For more advanced search, a third-party service like Algolia is recommended.
        // This query works for exact phone/diary number and prefix-based name search.
      ),
      limit(15), // Limit results for performance
    );

    // As Firestore doesn't support `or` with `orderBy` on different fields, manual client-side filter is needed for full text search
    // A more robust solution is to fetch all and filter, or use a dedicated search service.
    // Let's do a broader fetch and a client-side filter for better UX in this context.

    const allPatients = await getPatients();
    const filtered = allPatients
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lowerCaseQuery) ||
          p.phone.includes(searchQuery) ||
          (p.diaryNumber &&
            p.diaryNumber.toLowerCase().includes(lowerCaseQuery)),
      )
      .slice(0, 15); // limit results

    return filtered;
  } catch (error) {
    console.error('Error searching patients: ', error);
    return [];
  }
};

export const addPatient = async (
  patientData: Partial<Patient>,
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const newPatient: Partial<Patient> = {
      ...patientData,
      createdAt: now,
      updatedAt: now,
    };

    // Ensure categorizedCaseNotes is an object, not a string, for Firestore
    if (typeof newPatient.categorizedCaseNotes === 'string') {
      newPatient.categorizedCaseNotes = JSON.parse(
        newPatient.categorizedCaseNotes,
      );
    }

    const docRef = await addDoc(
      patientsCollectionRef(),
      prepareDataForFirestore(newPatient as Record<string, unknown>),
    );
    return docRef.id;
  } catch (error) {
    console.error('Error adding patient: ', error);
    throw error;
  }
};

export const updatePatient = async (
  patientId: string,
  patientData: Partial<Patient>,
): Promise<boolean> => {
  try {
    const patientRef = doc(getDbInstance(), 'patients', patientId);

    const updatedData: Partial<Patient> = {
      ...patientData,
      updatedAt: new Date().toISOString(),
    };

    const firestoreUpdateData: { [key: string]: unknown } = {};
    for (const key in updatedData) {
      if (Object.prototype.hasOwnProperty.call(updatedData, key)) {
        const value = (updatedData as Record<string, unknown>)[key];
        if (value !== undefined) {
          if (key === 'categorizedCaseNotes' && typeof value === 'string') {
            try {
              firestoreUpdateData[key] = JSON.parse(value);
            } catch {
              console.error(
                'Skipping invalid JSON in categorizedCaseNotes during update',
              );
            }
          } else if (
            key === 'categorizedCaseNotes' &&
            typeof value === 'object'
          ) {
            firestoreUpdateData[key] = value;
          } else {
            firestoreUpdateData[key] = value;
          }
        }
      }
    }

    await updateDoc(
      patientRef,
      prepareDataForFirestore(firestoreUpdateData) as any,
    );
    return true;
  } catch (error) {
    console.error('Error updating patient: ', error);
    return false;
  }
};

export const getPatientById = async (id: string): Promise<Patient | null> => {
  try {
    const patientRef = doc(getDbInstance(), 'patients', id);
    const docSnap = await getDoc(patientRef);
    return docSnap.exists() ? convertDocument<Patient>(docSnap) : null;
  } catch (error) {
    console.error('Error getting patient by ID: ', error);
    return null;
  }
};

export const getPatientsRegisteredWithinDateRange = async (
  startDate: Date,
  endDate: Date,
): Promise<Patient[]> => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const q = query(
      patientsCollectionRef(),
      where('createdAt', '>=', startTimestamp),
      where('createdAt', '<=', endTimestamp),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => convertDocument<Patient>(docSnap));
  } catch (error) {
    console.error(
      'Error getting patients registered within date range: ',
      error,
    );
    return [];
  }
};

export const getVisits = async (): Promise<Visit[]> => {
  try {
    const q = query(visitsCollectionRef(), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => convertDocument<Visit>(docSnap));
  } catch (error) {
    console.error('Error getting all visits: ', error);
    return [];
  }
};

export const addVisit = async (
  visitData: Omit<Visit, 'id' | 'createdAt'>,
): Promise<string | null> => {
  try {
    const newVisit = {
      ...visitData,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(
      visitsCollectionRef(),
      prepareDataForFirestore(newVisit as Record<string, unknown>) as any,
    );
    return docRef.id;
  } catch (error) {
    console.error('Error adding visit: ', error);
    return null;
  }
};

export const updateVisit = async (
  visitId: string,
  visitData: Partial<Visit>,
): Promise<boolean> => {
  try {
    const visitRef = doc(getDbInstance(), 'visits', visitId);
    await updateDoc(
      visitRef,
      prepareDataForFirestore(visitData as Record<string, unknown>) as any,
    );
    return true;
  } catch (error) {
    console.error('Error updating visit: ', error);
    return false;
  }
};

export const createVisitForPrescription = async (
  patientId: string,
  symptoms: string = 'পুনরায় সাক্ষাৎ / Follow-up',
  medicineDeliveryMethod: 'direct' | 'courier' = 'direct',
): Promise<string | null> => {
  try {
    const visitData: Omit<Visit, 'id' | 'createdAt'> = {
      patientId,
      visitDate: new Date().toISOString(),
      symptoms,
      medicineDeliveryMethod,
    };
    const docRef = await addDoc(
      visitsCollectionRef(),
      prepareDataForFirestore(visitData as Record<string, unknown>) as any,
    );
    return docRef.id;
  } catch (error) {
    console.error('Error creating visit for prescription: ', error);
    return null;
  }
};

export const getVisitsByPatientId = async (
  patientId: string,
): Promise<Visit[]> => {
  try {
    const q = query(
      visitsCollectionRef(),
      where('patientId', '==', patientId),
      orderBy('visitDate', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => convertDocument<Visit>(docSnap));
  } catch (error) {
    console.error('Error getting visits by patient ID: ', error);
    return [];
  }
};

export const getVisitById = async (id: string): Promise<Visit | null> => {
  try {
    const visitRef = doc(getDbInstance(), 'visits', id);
    const docSnap = await getDoc(visitRef);
    return docSnap.exists() ? convertDocument<Visit>(docSnap) : null;
  } catch (error) {
    console.error('Error getting visit by ID: ', error);
    return null;
  }
};

export const getVisitsWithinDateRange = async (
  startDate: Date,
  endDate: Date,
): Promise<Visit[]> => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    const q = query(
      visitsCollectionRef(),
      where('visitDate', '>=', startTimestamp),
      where('visitDate', '<=', endTimestamp),
    );
    const snapshot = await getDocs(q);
    const visits = snapshot.docs.map((docSnap) =>
      convertDocument<Visit>(docSnap),
    );
    return visits.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error('Error getting visits within date range: ', error);
    return [];
  }
};

export const getPrescriptions = async (): Promise<Prescription[]> => {
  try {
    const q = query(prescriptionsCollectionRef(), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      convertDocument<Prescription>(docSnap),
    );
  } catch (error) {
    console.error('Error getting prescriptions: ', error);
    return [];
  }
};

export const addPrescription = async (
  prescriptionData: Partial<Prescription>,
): Promise<string | null> => {
  try {
    const newPrescription = {
      ...prescriptionData,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(
      prescriptionsCollectionRef(),
      prepareDataForFirestore(
        newPrescription as Record<string, unknown>,
      ) as any,
    );
    return docRef.id;
  } catch (error) {
    console.error('Error adding prescription: ', error);
    return null;
  }
};

export const updatePrescription = async (
  prescriptionId: string,
  prescriptionData: Partial<Prescription>,
): Promise<boolean> => {
  try {
    const presRef = doc(getDbInstance(), 'prescriptions', prescriptionId);
    await updateDoc(
      presRef,
      prepareDataForFirestore(
        prescriptionData as Record<string, unknown>,
      ) as any,
    );
    return true;
  } catch (error) {
    console.error('Error updating prescription: ', error);
    return false;
  }
};

export const getPrescriptionById = async (
  id: string,
): Promise<Prescription | null> => {
  try {
    const presRef = doc(getDbInstance(), 'prescriptions', id);
    const docSnap = await getDoc(presRef);
    return docSnap.exists() ? convertDocument<Prescription>(docSnap) : null;
  } catch (error) {
    console.error('Error getting prescription by ID: ', error);
    return null;
  }
};

export const getPrescriptionsByPatientId = async (
  patientId: string,
): Promise<Prescription[]> => {
  try {
    const q = query(
      prescriptionsCollectionRef(),
      where('patientId', '==', patientId),
      orderBy('date', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      convertDocument<Prescription>(docSnap),
    );
  } catch (error) {
    console.error('Error getting prescriptions by patient ID: ', error);
    return [];
  }
};

export const getPaymentSlips = async (): Promise<PaymentSlip[]> => {
  try {
    const q = query(paymentSlipsCollectionRef(), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      convertDocument<PaymentSlip>(docSnap),
    );
  } catch (error) {
    console.error('Error getting all payment slips: ', error);
    return [];
  }
};

export const addPaymentSlip = async (
  slipData: Omit<PaymentSlip, 'id' | 'createdAt'>,
): Promise<string | null> => {
  try {
    const newSlip = {
      ...slipData,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(
      paymentSlipsCollectionRef(),
      prepareDataForFirestore(newSlip as Record<string, unknown>) as any,
    );
    return docRef.id;
  } catch (error) {
    console.error('Error adding payment slip: ', error);
    return null;
  }
};

export const getPaymentSlipsByPatientId = async (
  patientId: string,
): Promise<PaymentSlip[]> => {
  try {
    const q = query(
      paymentSlipsCollectionRef(),
      where('patientId', '==', patientId),
      orderBy('date', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      convertDocument<PaymentSlip>(docSnap),
    );
  } catch (error) {
    console.error('Error getting payment slips by patient ID: ', error);
    return [];
  }
};

export const getPaymentSlipsWithinDateRange = async (
  startDate: Date,
  endDate: Date,
): Promise<PaymentSlip[]> => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    const q = query(
      paymentSlipsCollectionRef(),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp),
    );
    const snapshot = await getDocs(q);
    const slips = snapshot.docs.map((docSnap) =>
      convertDocument<PaymentSlip>(docSnap),
    );
    return slips.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error('Error getting payment slips within date range: ', error);
    return [];
  }
};

export const getMedicines = async (): Promise<Medicine[]> => {
  try {
    const q = query(medicinesCollectionRef(), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => convertDocument<Medicine>(docSnap));
  } catch (error) {
    console.error('Error getting medicines: ', error);
    return [];
  }
};

export const addMedicine = async (
  medicineData: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const newMedicine = {
      ...medicineData,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(
      medicinesCollectionRef(),
      prepareDataForFirestore(newMedicine as Record<string, unknown>) as any,
    );
    return docRef.id;
  } catch (error) {
    console.error('Error adding medicine: ', error);
    throw error;
  }
};

export const updateMedicine = async (
  medicineId: string,
  medicineData: Partial<Omit<Medicine, 'id' | 'createdAt'>>,
): Promise<void> => {
  try {
    const medicineRef = doc(getDbInstance(), 'medicines', medicineId);
    const updatedData = {
      ...medicineData,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(
      medicineRef,
      prepareDataForFirestore(updatedData as Record<string, unknown>) as any,
    );
  } catch (error) {
    console.error('Error updating medicine: ', error);
    throw error;
  }
};

export const deleteMedicine = async (medicineId: string): Promise<void> => {
  try {
    const medicineRef = doc(getDbInstance(), 'medicines', medicineId);
    await deleteDoc(medicineRef);
  } catch (error) {
    console.error('Error deleting medicine: ', error);
    throw error;
  }
};

export const getClinicSettings = async (): Promise<ClinicSettings> => {
  const defaultSettings: ClinicSettings = {
    clinicName: 'ত্রিফুল আরোগ্য নিকেতন',
    doctorName: '',
    clinicAddress: '',
    clinicContact: '',
    bmRegNo: '',
  };
  try {
    const docSnap = await getDoc(settingsDocRef());
    if (docSnap.exists()) {
      return { ...defaultSettings, ...(docSnap.data() as ClinicSettings) };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error getting clinic settings: ', error);
    return defaultSettings;
  }
};

export const saveClinicSettings = async (
  settings: ClinicSettings,
): Promise<boolean> => {
  try {
    await setDoc(settingsDocRef(), settings);
    return true;
  } catch (error) {
    console.error('Error saving clinic settings: ', error);
    return false;
  }
};

// Courier Consignment Functions
export const getConsignments = async (): Promise<
  (SteadfastConsignment & { id: string })[]
> => {
  try {
    const q = query(consignmentsCollectionRef(), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      convertDocument<SteadfastConsignment & { id: string }>(docSnap),
    );
  } catch (error) {
    console.error('Error getting consignments: ', error);
    return [];
  }
};

export const addConsignment = async (
  consignmentData: SteadfastConsignment,
): Promise<string> => {
  try {
    // Use consignment_id as the document ID for easy lookup and to prevent duplicates
    const consignmentRef = doc(
      getDbInstance(),
      'consignments',
      String(consignmentData.consignment_id),
    );
    await setDoc(
      consignmentRef,
      prepareDataForFirestore(
        consignmentData as unknown as Record<string, unknown>,
      ) as any,
    );
    return String(consignmentData.consignment_id);
  } catch (error) {
    console.error('Error adding consignment: ', error);
    throw error;
  }
};

export const updateConsignmentStatus = async (
  consignmentId: number,
  status: string,
): Promise<boolean> => {
  try {
    const consignmentRef = doc(
      getDbInstance(),
      'consignments',
      String(consignmentId),
    );
    await updateDoc(consignmentRef, {
      status: status,
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating consignment status: ', error);
    return false;
  }
};

// Personal Expense Functions
export const getExpenses = async (): Promise<PersonalExpense[]> => {
  try {
    const q = query(personalExpensesCollectionRef(), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      convertDocument<PersonalExpense>(docSnap),
    );
  } catch (error) {
    console.error('Error getting personal expenses: ', error);
    return [];
  }
};

export const addExpense = async (
  expenseData: Omit<PersonalExpense, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const newExpense = {
      ...expenseData,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(
      personalExpensesCollectionRef(),
      prepareDataForFirestore(newExpense as Record<string, unknown>) as any,
    );
    return docRef.id;
  } catch (error) {
    console.error('Error adding personal expense: ', error);
    throw error;
  }
};

export const updateExpense = async (
  expenseId: string,
  expenseData: Partial<Omit<PersonalExpense, 'id' | 'createdAt'>>,
): Promise<void> => {
  try {
    const expenseRef = doc(getDbInstance(), 'personalExpenses', expenseId);
    const updatedData = {
      ...expenseData,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(
      expenseRef,
      prepareDataForFirestore(updatedData as Record<string, unknown>) as any,
    );
  } catch (error) {
    console.error('Error updating personal expense: ', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  try {
    const expenseRef = doc(getDbInstance(), 'personalExpenses', expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error('Error deleting personal expense: ', error);
    throw error;
  }
};

export const isToday = (dateStringOrDate: string | Date): boolean => {
  if (!dateStringOrDate) return false;
  const date =
    typeof dateStringOrDate === 'string'
      ? new Date(dateStringOrDate)
      : dateStringOrDate;
  if (!isValid(date)) return false;
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const isThisMonth = (dateStringOrDate: string | Date): boolean => {
  if (!dateStringOrDate) return false;
  const date =
    typeof dateStringOrDate === 'string'
      ? new Date(dateStringOrDate)
      : dateStringOrDate;
  if (!isValid(date)) return false;
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth()
  );
};

export const formatDate = (
  dateString?: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string => {
  if (!dateString) return 'N/A';
  const date =
    typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (!isValid(date)) return 'অবৈধ তারিখ';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('bn-BD', defaultOptions).format(date);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const PAYMENT_METHOD_LABELS: Record<
  Exclude<PaymentMethod, ''>,
  string
> = {
  cash: 'ক্যাশ',
  bkash: '���িকাশ',
  nagad: 'নগদ',
  rocket: 'রকেট',
  other: 'অন্যান্য',
};

export const getPaymentMethodLabel = (methodValue?: PaymentMethod): string => {
  if (!methodValue) return 'N/A';
  return PAYMENT_METHOD_LABELS[methodValue] || 'N/A';
};

export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const validDate = isValid(date) ? date : new Date();
  const start = startOfWeek(validDate, { weekStartsOn: 0 });
  const end = endOfWeek(validDate, { weekStartsOn: 0 });
  return { start, end };
};

export const getMonthRange = (date: Date): { start: Date; end: Date } => {
  const validDate = isValid(date) ? date : new Date();
  const start = startOfMonth(validDate);
  const end = endOfMonth(validDate);
  return { start, end };
};

export const addTrackingEvent = async (
  consignmentId: number,
  message: string,
): Promise<boolean> => {
  try {
    const consignmentRef = doc(
      getDbInstance(),
      'consignments',
      String(consignmentId),
    );
    await updateDoc(consignmentRef, {
      tracking_history: arrayUnion({
        message: message,
        timestamp: new Date().toISOString(),
      }),
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error adding tracking event: ', error);
    return false;
  }
};
