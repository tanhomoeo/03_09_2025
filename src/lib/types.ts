
export interface Patient {
  id: string;
  diaryNumber?: string;
  name: string;
  phone: string;
  district?: string;
  createdAt: string;
  updatedAt:string;

  registrationDate: string;
  age?: string;
  gender?: 'male' | 'female' | 'other' | '';
  occupation?: string;
  guardianRelation?: 'father' | 'husband' | '';
  guardianName?: string;
  thanaUpazila?: string;
  villageUnion?: string;

  // Case History TextAreas
  chiefComplaints?: string; // বর্তমান সমস্যা
  patientHistory?: string; // রোগীর পূর্ব ইতিহাস
  familyHistory?: string; // রোগীর পারিবারিক ইতিহাস
  mentalState?: string; // বর্তমান মানসিক অবস্থা

  // Generalities
  thermalReaction?: ('chilly' | 'hot')[]; // কাতরতা
  thirst?: 'normal' | 'less' | 'more' | 'none' | ''; // পিপাসা
  sleep?: 'normal' | 'less' | 'more' | 'none' | ''; // ঘুম
  foodAndCraving?: string; // পছন্দের খাদ্য ও লবন খাবার প্রবণতা
  perspiration?: 'normal' | 'less' | 'more' | 'none' | ''; // ঘাম
  likesDislikes?: string; // পছন্দের বিষয়
  
  // Excretions
  stoolDetails?: string; // পায়খানা সংক্রান্ত
  urineDetails?: string; // প্রস্রাব সংক্রান্ত
  mensesDetails?: string; // স্রাব সংক্রান্ত (for female)
}

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
  medicineDeliveryMethod?: 'direct' | 'courier';
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
  prescriptionType: 'adult' | 'child';
  items: PrescriptionItem[];
  followUpDays?: number;
  advice?: string;
  serialNumber?: string;
  createdAt: string;
  diagnosis?: string;
}

// Updated PaymentMethod type
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
  createdAt: string;
}

export interface ClinicStats {
  totalPatients: number;
  todayPatientCount: number;
  monthlyPatientCount: number;
  todayRevenue: number;
  monthlyIncome?: number;
  dailyActivePatients?: number;
  dailyOtherRegistered?: number;
  monthlyNewPatients?: number;
  monthlyTotalRegistered?: number;
}


export interface DiagnosisSuggestion {
  id: string;
  suggestion: string;
  confidence?: number;
}


export interface ClinicSettings {
  clinicName?: string;
  doctorName?: string;
  clinicAddress?: string;
  clinicContact?: string;
  bmRegNo?: string;
}

export interface EnrichedVisit extends Visit {
  prescription?: Prescription | null;
  slips?: PaymentSlip[];
}

// Old Complaint Summary Types - will be replaced by ComplaintAnalyzer types
export interface ComplaintSummaryInput {
  complaintText: string;
}
export interface ComplaintSummaryOutput {
  summary: string;
}

// New types for the enhanced complaint analyzer flow
export interface ComplaintAnalyzerInput {
  complaintText: string;
}
export interface ComplaintAnalyzerOutput {
  summaryPoints: string[];
  medicineSuggestions: string[];
}


export interface MedicineInstruction {
    id: string;
    patientName: string;
    patientActualId?: string;
    visitId?: string;
    instructionDate: string;
    drops: string;
    interval: string;
    intakeTime: string;
    followUpDays: string;
    generatedInstructionText: string;
    serialNumber: string;
    createdAt: string;
}
