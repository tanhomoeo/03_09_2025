

export interface CategorizedCaseNotes {
  physicalSymptoms?: {
    general?: string;
    gastrointestinal?: string;
    urinary?: string;
    femaleSpecific?: string;
    modalities?: string;
    locationAndNature?: string;
  };
  mentalAndEmotionalSymptoms?: {
    fear?: string;
    sadnessAndDepression?: string;
    angerAndMoodSwings?: string;
    loneliness?: string;
  };
  excitingCause?: {
    weather?: string;
    diet?: string;
    mentalTrauma?: string;
    accidentOrInfection?: string;
  };
  maintainingCause?: {
    lifestyle?: string;
    mentalStress?: string;
    habits?: string;
  };
  familyAndHereditaryHistory?: {
    diabetes?: string;
    highBloodPressure?: string;
    cancer?: string;
    allergies?: string;
  };
  pastMedicalHistory?: {
    majorIllnesses?: string;
    operationsOrTrauma?: string;
    chronicIssues?: string;
  };
  pastTreatmentHistory?: {
    previousMedication?: string;
    treatmentSystems?: string;
    otherTreatments?: string;
  };
}

export type PatientGender = 'male' | 'female' | 'other' | '';
export type GuardianRelation = 'father' | 'husband' | '';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  
  registrationDate?: string;
  diaryNumber?: string;
  age?: string;
  gender?: PatientGender;
  occupation?: string;
  guardianRelation?: GuardianRelation;
  guardianName?: string;
  district?: string;
  thanaUpazila?: string;
  villageUnion?: string;
  caseNotes?: string;
  categorizedCaseNotes?: CategorizedCaseNotes;
}

export type MedicineDeliveryMethod = 'direct' | 'courier';

export interface Visit {
  id: string;
  patientId: string;
  visitDate: string;
  symptoms?: string;
  diagnosis?: string;
  notes?: string;
  prescriptionId?: string;
  paymentSlipId?: string;
  createdAt: string;
  medicineDeliveryMethod?: MedicineDeliveryMethod;
}

export type PrescriptionItem = {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
};

export interface Prescription {
  id: string;
  patientId: string;
  visitId: string;
  doctorName?: string;
  date: string;
  items: PrescriptionItem[];
  followUpDays?: number;
  advice?: string;
  serialNumber?: string;
  createdAt: string;
  diagnosis?: string;
}

export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'other';

export interface PaymentSlip {
  id: string;
  patientId: string;
  visitId?: string;
  slipNumber: string;
  date: string;
  amount: number;
  purpose: string;
  receivedBy?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
}

export interface ClinicSettings {
  clinicName?: string;
  doctorName?: string;
  clinicAddress?: string;
  clinicContact?: string;
  bmRegNo?: string;
}

export interface EnrichedVisit extends Visit {
  prescription: Prescription | null;
  slips: PaymentSlip[];
}

export type MedicineUnit = 'dram' | 'ml' | 'pcs' | 'gm' | 'other';

export interface Medicine {
  id: string;
  name: string;
  potency: string;
  quantity: number;
  unit: MedicineUnit;
  supplier?: string;
  purchaseDate?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Types for Repertory Browser
export interface LanguageMap {
  en: string;
  bn: string;
}

export interface Remedy {
  name: string;
  grade: 1 | 2 | 3;
}

export interface Rubric {
  id: string;
  name: LanguageMap;
  remedies: Remedy[];
  children: Rubric[];
}

export interface Chapter {
  id: string;
  name: LanguageMap;
  rubrics: Rubric[];
}

export type ExpenseCategory =
  | 'household'
  | 'transport'
  | 'food'
  | 'utilities'
  | 'personal'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'other';

export interface PersonalExpense {
  id: string;
  date: string; // ISO string
  category: ExpenseCategory;
  description: string;
  amount: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
