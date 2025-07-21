
'use client';
import React from 'react';
import { format, isValid } from 'date-fns';
import { bn } from 'date-fns/locale';
import type { Patient, ClinicSettings, PrescriptionItem } from '@/lib/types';
import { APP_NAME } from '@/lib/constants';

interface PrescriptionFormValues {
    items: PrescriptionItem[];
    followUpDays?: number;
    advice?: string;
    diagnosis?: string;
    doctorName?: string;
}

interface PrintLayoutProps {
  patient: Patient | null;
  clinicSettings: ClinicSettings | null;
  formValues: PrescriptionFormValues;
  visitDate: string | null;
  prescriptionDate: string | null;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({
  patient,
  clinicSettings,
  formValues,
  visitDate,
  prescriptionDate,
}) => {
  const dateToFormat = prescriptionDate || visitDate || new Date();
  const validDate = isValid(new Date(dateToFormat)) ? new Date(dateToFormat) : new Date();

  return (
    <>
      <div className="print-only-block print-prescription-container bg-white text-black">
        <div className="print-header">
          <h1 className="font-headline text-2xl font-bold">{clinicSettings?.clinicName || APP_NAME}</h1>
          {clinicSettings?.clinicAddress && <p className="text-sm">{clinicSettings.clinicAddress}</p>}
          {clinicSettings?.clinicContact && <p className="text-sm">যোগাযোগ: {clinicSettings.clinicContact}</p>}
          <h2 className="print-title text-lg font-semibold mt-2 underline">প্রেসক্রিপশন</h2>
        </div>

        <div className="patient-info-grid">
          <div><strong>রোগী:</strong> {patient?.name || 'N/A'}</div>
          <div><strong>বয়স/লিঙ্গ:</strong> {patient?.age || 'N/A'} / {patient?.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'N/A'}</div>
          <div><strong>ডায়েরি নং:</strong> {patient?.diaryNumber || 'N/A'}</div>
          <div><strong>তারিখ:</strong> {format(validDate, "dd MMM, yyyy", { locale: bn })}</div>
        </div>

        <div className="print-section">
          {formValues.diagnosis && (
            <div className="mb-2">
              <strong className="section-title">প্রধান অভিযোগ / রোগ নির্ণয়:</strong>
              <p className="whitespace-pre-line text-sm">{formValues.diagnosis}</p>
            </div>
          )}
        </div>

        <div className="print-section rx-section">
          <div className="flex justify-between items-baseline">
            <strong className="text-xl font-bold section-title">Rx</strong>
          </div>
          <table className="medicines-table">
            <thead>
              <tr>
                <th className="w-[35%]">ঔষধের নাম ও শক্তি</th>
                <th className="w-[15%]">মাত্রা</th>
                <th className="w-[15%]">পুনরাবৃত্তি</th>
                <th className="w-[15%]">সময়কাল</th>
                <th className="w-[20%]">নোট/নির্দেশনা</th>
              </tr>
            </thead>
            <tbody>
              {formValues.items.filter((item) => item.medicineName.trim() !== '').map((item, index) => (
                <tr key={index}>
                  <td>{item.medicineName}</td>
                  <td>{item.dosage}</td>
                  <td>{item.frequency}</td>
                  <td>{item.duration}</td>
                  <td>{item.notes}</td>
                </tr>
              ))}
              {[...Array(Math.max(0, 6 - formValues.items.filter((item) => item.medicineName.trim() !== '').length))].map((_, i) => (
                <tr key={`empty-${i}`} className="empty-row"><td className="empty-cell">&nbsp;</td><td></td><td></td><td></td><td></td></tr>
              ))}
            </tbody>
          </table>
        </div>

        {formValues.advice && (
          <div className="print-section">
            <strong className="section-title">পরামর্শ:</strong>
            <p className="whitespace-pre-line text-sm">{formValues.advice}</p>
          </div>
        )}

        {formValues.followUpDays && (
          <div className="print-section follow-up">
            <strong>ফলো-আপ:</strong> {formValues.followUpDays?.toLocaleString('bn-BD')} দিন পর।
          </div>
        )}

        <div className="print-footer">
          <div className="signature-area">
            <p className="signature-line"></p>
            <p>{formValues.doctorName || clinicSettings?.doctorName || 'ডাক্তারের নাম'}</p>
            {clinicSettings?.bmRegNo && <p>বিএমডিসি রেজি. নং: {clinicSettings.bmRegNo}</p>}
          </div>
        </div>
      </div>
      <style jsx global>{`
        .print-only-block { display: none; }
        @media print {
          .hide-on-print { display: none !important; }
          .print-only-block { display: block !important; }
          body.printing-prescription-active {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0; padding: 0;
            background-color: #fff !important;
          }
          .print-prescription-container {
            width: 100%;
            margin: 0 auto;
            padding: 0;
            box-sizing: border-box;
            font-family: 'PT Sans', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #000 !important;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .print-header { 
            text-align: center; 
            margin-bottom: 6mm; 
            border-bottom: 1px solid #555; 
            padding-bottom: 4mm;
            padding-top: 4mm;
            background: linear-gradient(to bottom, #f3f4f6, #ffffff) !important;
            border-radius: 8px 8px 0 0;
          }
          .print-header h1 { font-family: 'Poppins', 'PT Sans', sans-serif; margin: 0 0 1mm 0; }
          .print-header p { font-size: 9pt; margin: 0.5mm 0; }
          .print-title { margin-top: 3mm; }

          .patient-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1mm 5mm;
            font-size: 9.5pt;
            padding: 3mm 12mm;
            border-bottom: 1px solid #ccc;
            margin-bottom: 4mm;
          }
          .patient-info-grid div { padding: 0.5mm 0; }

          .print-section { 
            margin-bottom: 4mm;
            padding: 0 12mm;
          }
          .section-title { font-weight: bold; font-size: 11pt; display: block; margin-bottom: 1mm; }
          .rx-section { 
            margin-top: 2mm;
            padding: 2mm;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            margin-left: 10mm;
            margin-right: 10mm;
          }
          .rx-section .section-title { margin-bottom: 0.5mm; }

          .medicines-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 2mm; table-layout: fixed; }
          .medicines-table th, .medicines-table td { border: 1px solid #777; padding: 1.5mm 2mm; text-align: left; vertical-align: top; word-wrap: break-word; }
          .medicines-table th { 
            background-color: #f3f4f6 !important;
            font-weight: bold; 
            font-size: 9.5pt; 
          }
          .medicines-table .empty-row td { height: 1.8em; }
          .medicines-table .empty-cell { border-left: 1px solid #777; border-right: 1px solid #777; }

          .whitespace-pre-line { white-space: pre-line; }
          .follow-up { font-size: 9.5pt; margin-top: 3mm; }

          .print-footer {
            margin-top: 12mm;
            padding: 0 12mm 4mm 12mm;
            position: relative;
            height: 40mm;
          }
          .signature-area {
            text-align: right;
            font-size: 9.5pt;
            position: absolute;
            bottom: 5mm;
            right: 12mm;
          }
          .signature-line {
            display: block;
            width: 150px;
            border-bottom: 1px solid #333;
            margin-bottom: 2mm;
            margin-left: auto;
          }
          .signature-area p { margin: 1mm 0; }
        }
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
      `}</style>
    </>
  );
};
