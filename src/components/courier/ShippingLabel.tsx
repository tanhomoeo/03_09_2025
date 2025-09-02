
'use client';
import React from 'react';
import type { SteadfastConsignment, ClinicSettings } from '@/lib/types';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Printer } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';

interface ShippingLabelProps {
  consignment: SteadfastConsignment;
  clinicSettings: ClinicSettings | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShippingLabel({ consignment, clinicSettings, isOpen, onClose }: ShippingLabelProps) {

  const handlePrint = () => {
    const printContent = document.getElementById('shipping-label-print-area');
    if (printContent) {
      const iframe = document.createElement('iframe');
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      document.body.appendChild(iframe);
      const pri = iframe.contentWindow;

      if (pri) {
        pri.document.open();
        pri.document.write('<html><head><title>Print Shipping Label</title>');
        pri.document.write('<style>');
        pri.document.write(`
          @page {
            size: 100mm 150mm;
            margin: 5mm;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .label-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            border: 2px solid black;
            padding: 4mm;
            box-sizing: border-box;
          }
          .header, .footer {
            text-align: center;
            flex-shrink: 0;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            border-bottom: 2px solid black;
            padding-bottom: 3mm;
          }
          .logo {
            width: 40px;
            height: 40px;
          }
          .clinic-name {
            font-size: 14pt;
            font-weight: bold;
          }
          .content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 3mm 0;
          }
          .section {
            border-bottom: 1px dashed black;
            padding: 3mm 0;
          }
          .section:last-child {
            border-bottom: none;
          }
          .section-title {
            font-weight: bold;
            font-size: 9pt;
            margin-bottom: 1mm;
          }
          .recipient-details, .sender-details {
            font-size: 11pt;
            line-height: 1.4;
          }
          .cod-amount {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            margin: 2mm 0;
          }
          .barcode-container, .qrcode-container {
            text-align: center;
            margin: 3mm 0;
          }
          .footer {
            border-top: 2px solid black;
            padding-top: 3mm;
            font-size: 8pt;
          }
          strong { font-weight: bold; }
        `);
        pri.document.write('</style></head><body>');
        pri.document.write(printContent.innerHTML);
        pri.document.write('</body></html>');
        pri.document.close();
        pri.focus();
        pri.print();
        document.body.removeChild(iframe);
      }
    }
  };

  const qrCodeValue = `${process.env.NEXT_PUBLIC_STEADFAST_TRACKING_URL || 'https://steadfast.com.bd/track/'}${consignment.tracking_code}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Shipping Label - {consignment.invoice}</DialogTitle>
          <DialogDescription>
            This label is ready to be printed and attached to the parcel.
          </DialogDescription>
        </DialogHeader>

        <div id="shipping-label-print-area" className="label-container p-4 border-2 border-black rounded-lg">
          <div className="header flex items-center justify-center gap-4 border-b-2 border-black pb-3 mb-3">
             {clinicSettings?.clinicLogo ? (
                 <img src={clinicSettings.clinicLogo} alt="Clinic Logo" className="logo h-12 w-12" />
             ) : (
                 <div className="logo h-12 w-12 bg-gray-200 flex items-center justify-center rounded-full">
                     <span className="text-sm font-bold text-gray-500">Logo</span>
                 </div>
             )}
            <h1 className="clinic-name text-2xl font-bold">{clinicSettings?.clinicName || APP_NAME}</h1>
          </div>

          <div className="content py-3">
            <div className="grid grid-cols-2 gap-4">
                 <div className="section sender-details border-r pr-4 border-dashed">
                    <p className="section-title text-sm font-bold">FROM:</p>
                    <p><strong>{clinicSettings?.doctorName || clinicSettings?.clinicName}</strong></p>
                    <p>{clinicSettings?.clinicAddress}</p>
                    <p>Phone: {clinicSettings?.clinicContact}</p>
                </div>
                 <div className="section recipient-details">
                    <p className="section-title text-sm font-bold">TO:</p>
                    <p><strong>{consignment.recipient_name}</strong></p>
                    <p>{consignment.recipient_address}</p>
                    <p>Phone: {consignment.recipient_phone}</p>
                </div>
            </div>
            <div className="section cod-section text-center py-3">
                <p className="section-title text-sm">CASH ON DELIVERY</p>
                <p className="cod-amount text-2xl font-bold">৳ {consignment.cod_amount.toLocaleString('bn-BD')}</p>
            </div>
             <div className="grid grid-cols-2 gap-4 items-center">
                 <div className="barcode-container text-center py-3">
                   <Barcode value={consignment.tracking_code} height={50} displayValue={true} fontSize={12} />
                 </div>
                 <div className="qrcode-container text-center py-3">
                    <QRCodeSVG value={qrCodeValue} size={80} />
                    <p className="text-xs mt-1">Track Order</p>
                 </div>
             </div>
          </div>
          
          <div className="footer border-t-2 border-black pt-3 text-center">
            <p className="font-bold text-lg">Thank You For Your Order!</p>
            <p className="text-xs">Powered by Steadfast Courier</p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Label</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
