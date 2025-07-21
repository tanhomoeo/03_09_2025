
export type CategorizedCaseNotes = {
  physicalSymptoms?: string;
  mentalAndEmotionalSymptoms?: string;
  excitingCause?: string;
  maintainingCause?: string;
  familyAndHereditaryHistory?: string;
  pastMedicalHistory?: string;
  pastTreatmentHistory?: string;
};

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

export type PaymentMethod =
  | 'cash'
  | 'bkash'
  | 'nagad'
  | 'rocket'
  | 'other'
  | '';

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

export type SuggestRemediesOutput = {
  caseAnalysis: string;
  remedies: {
    name: string;
    description: string;
    score: number;
    justification: string;
    source: string;
  }[];
};
