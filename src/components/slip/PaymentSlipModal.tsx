
'use client';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { PaymentSlip, ClinicSettings, PaymentMethod } from '@/lib/types';
import { formatDate, formatCurrency, getClinicSettings, getPaymentMethodLabel } from '@/lib/firestoreService';
import { Printer } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

interface PaymentSlipModalProps {
  slip: PaymentSlip & { patientName?: string };
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentSlipModal({ slip, isOpen, onClose }: PaymentSlipModalProps) {
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchSettings = async () => {
        const settings = await getClinicSettings();
        setClinicSettings(settings);
      };
      fetchSettings();
    }
  }, [isOpen]);

  if (!slip) return null;

  const handlePrint = () => {
     if (typeof window !== 'undefined') {
      const printArea = document.getElementById('slip-print-area-content');
      if (printArea && clinicSettings) {
        const paymentMethodDisplay = getPaymentMethodLabel(slip.paymentMethod);
        
        const iframe = document.createElement('iframe');
        iframe.style.visibility = 'hidden';
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(`
            <html>
            <head>
              <title>Payment Slip - ${slip.slipNumber}</title>
              <style>
                @media print {
                  @page { size: 90mm 140mm; margin: 5mm; }
                  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                body {
                  font-family: 'PT Sans', Arial, sans-serif;
                  margin: 0;
                  font-size: 9pt;
                  color: #000;
                }
                .slip-container {
                  border: 1px dashed #777;
                  padding: 5mm;
                  width: 100%;
                  box-sizing: border-box;
                  background-color: #fff;
                }
                .slip-header { text-align: center; margin-bottom: 5mm; }
                .slip-header h1 { font-family: 'Poppins', 'PT Sans', sans-serif; font-size: 11pt; font-weight: bold; margin:0 0 1mm 0; }
                .slip-header p { font-size: 8pt; margin: 0.5mm 0; }
                .slip-title { font-size: 10pt; font-weight: bold; text-decoration: underline; margin: 3mm 0 4mm 0; text-align: center;}

                .slip-details { margin-bottom: 5mm; font-size: 9pt; }
                .slip-details div { margin: 2mm 0; display: flex; justify-content: space-between; align-items: flex-start; line-height: 1.3; }
                .slip-details strong { font-weight: normal; color: #333; margin-right: 3mm; display: inline-block; min-width: 70px; }
                .slip-details .value { text-align: right; word-break: break-word; }

                .amount-line { border-top: 1px solid #ccc; padding-top: 2mm; margin-top: 3mm; }
                .amount-line strong { font-size: 10pt; font-weight: bold; }

                .slip-footer { margin-top: 7mm; font-size: 8.5pt; color: #333; }
                .received-by { margin-top: 10mm; text-align: right; }
                .signature-line { display: inline-block; width: 120px; border-bottom: 1px solid #555; margin-bottom: 1mm; }
                .footer-note { text-align: center; margin-top: 5mm; font-size: 7.5pt; color: #666; }
              </style>
            </head>
            <body>
              <div class="slip-container">
                <div class="slip-header">
                  <h1>${clinicSettings?.clinicName || APP_NAME}</h1>
                  ${clinicSettings?.clinicAddress ? `<p>${clinicSettings.clinicAddress}</p>` : ''}
                  ${clinicSettings?.clinicContact ? `<p>Contact: ${clinicSettings.clinicContact}</p>` : ''}
                </div>
                <div class="slip-title">MONEY RECEIPT</div>
                <div class="slip-details">
                  <div><strong>Slip No:</strong> <span class="value">${slip.slipNumber}</span></div>
                  <div><strong>Date:</strong> <span class="value">${formatDate(slip.date)}</span></div>
                  <div><strong>Patient ID:</strong> <span class="value">${slip.patientId ? slip.patientId.substring(0,8) + '...' : 'N/A'}</span></div>
                  <div><strong>Patient Name:</strong> <span class="value">${slip.patientName || 'N/A'}</span></div>
                  <div><strong>Purpose:</strong> <span class="value">${slip.purpose}</span></div>
                  <div><strong>Paid Via:</strong> <span class="value">${paymentMethodDisplay}</span></div>
                  <div class="amount-line"><strong>Amount:</strong> <span class="value">${formatCurrency(slip.amount)}</span></div>
                </div>
                <div class="slip-footer">
                  <div class="received-by">
                    <span class="signature-line"></span><br/>
                    Received By: ${slip.receivedBy || clinicSettings?.doctorName || ''}
                  </div>
                  <div class="footer-note">
                    Thank you! This is a computer-generated receipt.
                  </div>
                </div>
              </div>
            </body>
            </html>
          `);
          iframeDoc.close();

          iframe.onload = () => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 500);
          };
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg w-full">
          <DialogHeader className="text-center border-b pb-3 mb-3">
            <DialogTitle className="font-headline text-xl text-primary">Payment Slip Details</DialogTitle>
            <DialogDescription>পেমেন্ট স্লিপের বিস্তারিত তথ্য এখানে দেখানো হচ্ছে।</DialogDescription>
          </DialogHeader>

        <div id="slip-print-area-content">
            <div className="print-slip-header text-center mb-4">
                <h2 className="text-lg font-bold font-headline">{clinicSettings?.clinicName || APP_NAME}</h2>
                {clinicSettings?.clinicAddress && <p className="text-xs text-muted-foreground">{clinicSettings.clinicAddress}</p>}
                {clinicSettings?.clinicContact && <p className="text-xs text-muted-foreground">Contact: {clinicSettings.clinicContact}</p>}
                 <h3 className="text-md font-semibold mt-2 underline">MONEY RECEIPT</h3>
            </div>

          <div className="slip-details space-y-1.5 text-sm mb-5">
            <div className="flex justify-between"><strong className="text-muted-foreground min-w-[100px]">Slip No:</strong> <span className="font-medium text-right">{slip.slipNumber}</span></div>
            <div className="flex justify-between"><strong className="text-muted-foreground min-w-[100px]">Date:</strong> <span className="font-medium text-right">{formatDate(slip.date)}</span></div>
            <div className="flex justify-between"><strong className="text-muted-foreground min-w-[100px]">Patient ID:</strong> <span className="font-medium text-right font-mono text-xs">{slip.patientId}</span></div>
            <div className="flex justify-between"><strong className="text-muted-foreground min-w-[100px]">Patient Name:</strong> <span className="font-medium text-right">{slip.patientName || 'N/A'}</span></div>
            <div className="flex justify-between"><strong className="text-muted-foreground min-w-[100px]">Purpose:</strong> <span className="font-medium text-right">{slip.purpose}</span></div>
            <div className="flex justify-between"><strong className="text-muted-foreground min-w-[100px]">Paid Via:</strong> <span className="font-medium text-right">{getPaymentMethodLabel(slip.paymentMethod)}</span></div>
            <div className="flex justify-between text-md font-semibold pt-2 border-t mt-2"><strong className="text-muted-foreground">Total Amount:</strong> <span>{formatCurrency(slip.amount)}</span></div>
          </div>

          <div className="slip-footer text-xs text-muted-foreground mt-4">
            <div className="text-right">
                <p className="mb-1">Received By: {slip.receivedBy || clinicSettings?.doctorName || ''}</p>
                <p className="italic">(Signature area for manual signing if needed)</p>
            </div>
            <p className="text-center mt-3">This is a computer-generated receipt. Thank you!</p>
          </div>
        </div>

        <DialogFooter className="mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Slip</Button>
          <DialogClose asChild>
            <Button variant="default">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
