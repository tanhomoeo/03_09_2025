import React from 'react';
import {
  Activity,
  Dna,
  HeartPulse,
  Syringe,
  Stethoscope,
  Info,
  Sparkles,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

interface SymptomDisplayProps {
  categorizedNotes: any;
}

export const sectionConfig: {
  [key: string]: {
    title: string;
    icon: React.ElementType;
    subs: { [key: string]: string };
  };
} = {
  chiefComplaints: {
    title: 'প্রধান প্রধান লক্ষণ',
    icon: Stethoscope,
    subs: {
      mainSymptoms: 'প্রধান লক্ষণ',
      symptomDetails: 'লক্ষণের বিস্তারিত বিবরণ',
      locationAndSensation: 'অবস্থান ও অনুভূতি',
    },
  },
  underlyingCauses: {
    title: 'রোগের অন্তর্নিহিত কারণ',
    icon: Sparkles,
    subs: {
      possibleRootCause: 'সম্ভাব্য মূল কারণ',
      aggravatingFactors: 'যেসব কারণে রোগ বৃদ্ধি পায়',
      amelioratingFactors: 'যেসব কারণে রোগ উপশম হয়',
    },
  },
  maintainingCause: {
    title: 'রোগ স্থায়ী হওয়ার কারণ',
    icon: Activity,
    subs: {
      lifestyle: 'অনিয়মিত জীবনযাপন',
      mentalStress: 'অতিরিক্ত মানসিক চাপ',
      habits: 'অভ্যাসগত কারণ',
    },
  },
  familyAndHereditaryHistory: {
    title: 'পারিবারিক বা বংশগত ইতিহাস',
    icon: Dna,
    subs: {
      diabetes: 'ডায়াবেটিস',
      highBloodPressure: 'উচ্চ রক্তচাপ',
      cancer: 'ক্যান্সার',
      allergies: 'অ্যালার্জি',
    },
  },
  pastMedicalHistory: {
    title: 'রোগীর পূর্বের রোগের ইতিহাস',
    icon: HeartPulse,
    subs: {
      majorIllnesses: 'বড় কোনো পূর্বের রোগ',
      operationsOrTrauma: 'অপারেশন বা ট্রমা',
      chronicIssues: 'দীর্ঘমেয়াদি সমস্যা',
    },
  },
  pastTreatmentHistory: {
    title: 'ওষুধের/চিকিৎসার ইতিহাস',
    icon: Syringe,
    subs: {
      previousMedication: 'পূর্বে কোনো ওষুধ নিয়েছেন',
      treatmentSystems: 'পূর্বে কোনো চিকিৎসা পদ্ধতি নিয়েছেন',
      otherTreatments: 'অন্য কোনো চিকিৎসা পদ্ধতি',
    },
  },
};

const renderSymptoms = (data: any, subConfig: { [key: string]: string }) => {
  if (!data) return <p className="text-sm text-gray-500">N/A</p>;

  const items = Object.entries(data)
    .map(([key, value]) => {
      const label = subConfig[key] || key;
      if (value) {
        return (
          <li key={key} className="flex items-start">
            <Info className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" />
            <span>
              <span className="font-semibold">{label}:</span> {Array.isArray(value) ? value.join(', ') : String(value)}
            </span>
          </li>
        );
      }
      return null;
    })
    .filter(Boolean);

  return items.length > 0 ? (
    <ul className="space-y-2 pl-4 list-inside">{items}</ul>
  ) : (
    <p className="text-sm text-gray-500 italic px-4">এই সেকশনে কোনো তথ্য পাওয়া যায়নি।</p>
  );
};

const CategorizedSymptomsDisplay: React.FC<SymptomDisplayProps> = ({ categorizedNotes }) => {
  if (!categorizedNotes || typeof categorizedNotes !== 'object' || Object.keys(categorizedNotes).length === 0) {
    return (
      <div className="border rounded-lg p-4 text-center bg-gray-50">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-800">AI দ্বারা কোনো লক্ষণ পাওয়া যায়নি</h3>
        <p className="mt-1 text-sm text-gray-500">রোগীর বিস্তারিত তথ্য প্রদান করলে AI স্বয়ংক্রিয়ভাবে লক্ষণগুলো বিশ্লেষণ করবে।</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(sectionConfig).map(([key, { title, icon: Icon, subs }]) => {
        const data = categorizedNotes[key];
        if (data && Object.values(data).some(v => v)) {
          return (
            <div key={key} className="border rounded-xl shadow-sm overflow-hidden bg-white">
              <div className="flex items-center p-3 bg-gray-50 border-b">
                <Icon className="h-6 w-6 text-gray-600 mr-3" />
                <h3 className="text-md font-bold text-gray-800">{title}</h3>
              </div>
              <div className="p-4">
                {renderSymptoms(data, subs)}
              </div>
            </div>
          );
        }
        return null;
      })}
       {categorizedNotes.keySymptomsForRepertorization && (
        <div className="border rounded-xl shadow-sm overflow-hidden bg-yellow-50 border-yellow-200">
          <div className="flex items-center p-3 bg-yellow-100 border-b border-yellow-200">
            <AlertTriangle className="h-6 w-6 text-yellow-700 mr-3" />
            <h3 className="text-md font-bold text-yellow-800">গুরুত্বপূর্ণ লক্ষণ (রেপার্টরাইজেশনের জন্য)</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-2 pl-4 list-disc marker:text-yellow-600">
              {categorizedNotes.keySymptomsForRepertorization.map((symptom: string, index: number) => (
                <li key={index} className="text-yellow-900">{symptom}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorizedSymptomsDisplay;
