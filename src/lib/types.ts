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
  keySymptoms?: string[];
}

export type PatientGender = 'male' | 'female' | 'other' | '';

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
  guardianName?: string;
  guardianRelation?: string;
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

export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'other' | '';

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
  medicineDeliveryMethod?: MedicineDeliveryMethod;
  createdAt: string;
}

export interface ClinicSettings {
  clinicName?: string;
  doctorName?: string;
  clinicAddress?: string;
  clinicContact?: string;
  bmRegNo?: string;
  clinicLogo?: string;
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

// Types for Steadfast Courier
export interface SteadfastOrder {
    invoice: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    alternative_phone?: string;
    recipient_email?: string;
    note?: string;
    item_description?: string;
    total_lot?: number;
    delivery_type?: 0 | 1;
}

export interface SteadfastConsignment {
    consignment_id: number;
    invoice: string;
    tracking_code: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    status: string; // e.g., "in_review"
    note: string | null;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

export interface SteadfastStatus {
    status: number;
    delivery_status: string;
}

export interface SteadfastBalance {
    status: number;
    current_balance: number;
}

// Bulk order types
export interface SteadfastBulkOrderItem extends SteadfastOrder {}
export interface SteadfastBulkOrderResultItem {
    invoice: string;
    recipient_name: string;
    recipient_address: string;
    recipient_phone: string;
    cod_amount: string | number;
    note: string | null;
    consignment_id: number | null;
    tracking_code: string | null;
    status: 'success' | 'error' | string;
}

// Return request types
export type SteadfastReturnStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'cancelled';
export interface SteadfastReturnRequest {
    id: number;
    user_id?: number;
    consignment_id: number;
    reason: string | null;
    status: SteadfastReturnStatus;
    created_at: string;
    updated_at: string;
}

// Types for Steadfast Webhook
export type DeliveryStatus = 'pending' | 'delivered' | 'partial_delivered' | 'cancelled' | 'unknown' | 'in_review';

export interface DeliveryStatusPayload {
    notification_type: 'delivery_status';
    consignment_id: number;
    invoice: string;
    cod_amount: number;
    status: DeliveryStatus | string; // Use string as a fallback for other statuses from doc
    delivery_charge: number;
    tracking_message: string;
    updated_at: string; // YYYY-MM-DD HH:MM:SS
}

export interface TrackingUpdatePayload {
    notification_type: 'tracking_update';
    consignment_id: number;
    invoice: string;
    tracking_message: string;
    updated_at: string; // YYYY-MM-DD HH:MM:SS
}
