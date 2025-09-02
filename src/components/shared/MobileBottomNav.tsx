
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, UserPlus, Wand2, Truck, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import type { HandwrittenFormOutput } from '@/ai/flows/handwritten-patient-form-parser-flow';
import dynamic from 'next/dynamic';
import type { ScanPatientFormModalProps } from '@/components/patient/ScanPatientFormModal';

const navItems = [
  { href: ROUTES.DASHBOARD, label: 'হোম', icon: Home },
  { href: ROUTES.PATIENT_ENTRY, label: 'নতুন রোগী', icon: UserPlus },
  { href: 'SCAN_ACTION', label: 'স্ক্যান', icon: Camera },
  { href: ROUTES.AI_SUMMARY, label: 'AI রেপার্টরি', icon: Wand2 },
  { href: ROUTES.COURIER, label: 'কুরিয়ার', icon: Truck },
];

const ScanPatientFormModal = dynamic<ScanPatientFormModalProps>(
  () => import('@/components/patient/ScanPatientFormModal').then((mod) => mod.default),
  { ssr: false }
);

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const handleDataExtracted = (extractedData: HandwrittenFormOutput) => {
    const query = new URLSearchParams();
    if (extractedData.name) query.set('name', extractedData.name);
    if (extractedData.phone) query.set('phone', extractedData.phone);
    if (extractedData.guardianName) query.set('guardianName', extractedData.guardianName);
    if (extractedData.villageUnion) query.set('villageUnion', extractedData.villageUnion);
    if (extractedData.thanaUpazila) query.set('thanaUpazila', extractedData.thanaUpazila);
    if (extractedData.district) query.set('district', extractedData.district);
    if (extractedData.age) query.set('age', extractedData.age);
    
    setIsCameraModalOpen(false);
    
    toast({
      title: "ফর্ম ডেটা প্রস্তুত",
      description: "শনাক্ত করা তথ্য দিয়ে নিবন্ধন ফর্মটি পূরণ করা হচ্ছে।",
    });

    router.push(`${ROUTES.PATIENT_ENTRY}?${query.toString()}`);
  };

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background/70 border-t border-border/20 backdrop-blur-lg">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
          {navItems.map((item) => {
            if (item.href === 'SCAN_ACTION') {
              return (
                <div key={item.label} className="relative flex items-center justify-center -top-4">
                  <button
                    onClick={() => setIsCameraModalOpen(true)}
                    type="button"
                    className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full text-primary-foreground shadow-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
                    aria-label={item.label}
                  >
                    <Camera className="w-6 h-6" />
                    <span className="sr-only">{item.label}</span>
                  </button>
                </div>
              );
            }

            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'inline-flex flex-col items-center justify-center px-2 hover:bg-muted/50 group',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {isCameraModalOpen && (
         <ScanPatientFormModal
            isOpen={isCameraModalOpen}
            onClose={() => setIsCameraModalOpen(false)}
            onDataExtracted={handleDataExtracted}
        />
      )}
    </>
  );
}
