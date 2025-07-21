
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPatients, createVisitForPrescription } from '@/lib/firestoreService';
import type { Patient } from '@/lib/types';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import {
  CreditCard,
  History,
  ClipboardList,
  Loader2,
  Search as SearchIconLucide,
  X,
  FileHeart,
  CalendarPlus,
} from 'lucide-react';

import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';
import type { PatientDetailsModalProps } from '@/components/patient/PatientDetailsModal';
import type { CreatePaymentSlipModalProps } from '@/components/slip/CreatePaymentSlipModal';


const PatientDetailsModal = dynamic<PatientDetailsModalProps>(() =>
 import('@/components/patient/PatientDetailsModal').then(mod => mod.PatientDetailsModal),
  {
 loading: () => <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading Details...</span></div>,
 ssr: false,
  }
);


const CreatePaymentSlipModal = dynamic<CreatePaymentSlipModalProps>(() =>
 import('@/components/slip/CreatePaymentSlipModal').then(mod => mod.CreatePaymentSlipModal),
  { ssr: false,
    loading: () => <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading Payment Form...</span></div>
});

const SearchResultSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="bg-card/70">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted"></div>
            <div>
              <div className="h-6 w-48 rounded bg-muted"></div>
              <div className="h-3 w-64 rounded bg-muted mt-1"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-5 w-32 rounded bg-muted mb-3"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="h-9 rounded-md bg-muted"></div>
            <div className="h-9 rounded-md bg-muted"></div>
            <div className="h-9 rounded-md bg-muted"></div>
            <div className="h-9 rounded-md bg-muted"></div>
            <div className="h-9 rounded-md bg-muted"></div>
            <div className="h-9 rounded-md bg-muted"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

type ModalTab = 'info' | 'history';

export default function SearchPageClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const searchParams = useSearchParams();
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatientForModal, setSelectedPatientForModal] = useState<Patient | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<ModalTab>('info');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingVisit, setIsCreatingVisit] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const doFetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const patientsData = await getPatients();
      setAllPatients(patientsData);
    } catch (error) {
      console.error("Failed to fetch patients", error);
      toast({ title: "ত্রুটি", description: "রোগীর তালিকা আনতে সমস্যা হয়েছে।", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    doFetchPatients();

    const handleDataChange = () => {
      doFetchPatients();
    };
    window.addEventListener('firestoreDataChange', handleDataChange);

    return () => {
      window.removeEventListener('firestoreDataChange', handleDataChange);
    };
  }, [doFetchPatients]);

  useEffect(() => {
    const querySearchTerm = searchParams.get('q');
    const queryPhone = searchParams.get('phone');
    const term = querySearchTerm || queryPhone || '';
    if (term) {
      setSearchTerm(term);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients([]);
      return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const results = allPatients.filter(patient => {
      const diaryNumString = (patient.diaryNumber || '').toString().toLowerCase();
      return (
        patient.name.toLowerCase().includes(lowerSearchTerm) ||
        (patient.id && patient.id.toLowerCase().includes(lowerSearchTerm)) ||
        patient.phone.toLowerCase().includes(lowerSearchTerm) ||
        diaryNumString.includes(lowerSearchTerm) ||
        (patient.villageUnion || '').toLowerCase().includes(lowerSearchTerm) ||
        (patient.district || '').toLowerCase().includes(lowerSearchTerm) ||
        (patient.guardianName || '').toLowerCase().includes(lowerSearchTerm)
      );
    });
    setFilteredPatients(results);

    const tabParam = searchParams.get('tab');
    if ((tabParam === 'history' || tabParam === 'info') && results.length === 1) {
        handleOpenDetailsModal(results[0], tabParam as ModalTab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, allPatients]);

  const handleOpenDetailsModal = (patient: Patient, tab: ModalTab) => {
    setSelectedPatientForModal(patient);
    setActiveModalTab(tab);
    setIsDetailsModalOpen(true);
  };

  const handleOpenPaymentModal = (patient: Patient) => {
    setSelectedPatientForModal(patient);
    setIsPaymentModalOpen(true);
  };

  const handleOpenMedicineInstructions = (patient: Patient) => {
    router.push(`${ROUTES.MEDICINE_INSTRUCTIONS}?patientId=${patient.id}&name=${encodeURIComponent(patient.name)}`);
  };

  const handlePatientUpdatedInModal = useCallback((updatedPatient: Patient) => {
    setAllPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    window.dispatchEvent(new CustomEvent('firestoreDataChange'));
  }, []);

  const handleAddPatientToTodaysQueue = async (patient: Patient) => {
    setIsCreatingVisit(patient.id);
    try {
      const newVisitId = await createVisitForPrescription(patient.id, "পুনরায় সাক্ষাৎ / Follow-up", 'direct');
      if (newVisitId) {
        toast({
          title: "রোগী তালিকায় যুক্ত হয়েছে",
          description: `${patient.name}-কে আজকের সাক্ষাতের তালিকায় যুক্ত করা হয়েছে।`,
        });
        window.dispatchEvent(new CustomEvent('firestoreDataChange'));
        router.push(ROUTES.DASHBOARD);
      } else {
        throw new Error("Failed to create visit ID.");
      }
    } catch (error) {
      console.error("Error creating today's visit:", error);
      toast({
        title: "ত্রুটি",
        description: "আজকের ভিজিট তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsCreatingVisit(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="রোগী অনুসন্ধান"
        description="রোগীর রেকর্ড খুঁজুন"
        actions={<SearchIconLucide className="h-8 w-8 text-primary" />}
        className="bg-gradient-to-br from-indigo-100 to-blue-200 dark:from-indigo-900/30 dark:to-blue-900/30"
        titleClassName="text-indigo-900 dark:text-indigo-300"
      >
        <p className="text-sm text-muted-foreground mt-1">
          নাম, ডায়েরি নম্বর, ফোন, ঠিকানা বা অভিভাবকের নাম দ্বারা বিদ্যমান রোগীর রেকর্ড খুঁজতে নীচের অনুসন্ধান বার ব্যবহার করুন।
        </p>
      </PageHeaderCard>

      <div className="flex h-11 items-center w-full rounded-md border border-input bg-card shadow-inner overflow-hidden focus-within:ring-1 focus-within:ring-ring focus-within:border-primary">
        <div className="pl-3 pr-2 flex items-center pointer-events-none h-full">
          <SearchIconLucide className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder="রোগীর নাম, ডায়েরি নং, ফোন, ঠিকানা দিয়ে খুঁজুন..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-full flex-1 border-0 bg-transparent shadow-none focus:ring-0 focus-visible:ring-0 px-2 text-base placeholder-muted-foreground"
          aria-label="Search term"
          id="patientSearchPageInput"
        />
        {searchTerm && (
          <Button variant="ghost" size="icon" className="h-full w-10 text-muted-foreground hover:text-foreground" onClick={() => setSearchTerm('')}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <SearchResultSkeleton />
      ) : searchTerm.trim() && filteredPatients.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          &quot;{searchTerm}&quot; এর জন্য কোন রোগী খুঁজে পাওয়া যায়নি।
        </div>
      ) : !searchTerm.trim() ? (
         <div className="text-center py-10 text-muted-foreground">
          রোগী খুঁজতে উপরে অনুসন্ধান করুন।
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="bg-card/80 backdrop-blur-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 md:h-12 md:w-12">
                    <AvatarImage src={`https://placehold.co/100x100.png?text=${patient.name.charAt(0)}`} alt={patient.name} data-ai-hint="profile person" />
                    <AvatarFallback>{patient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="font-headline text-base md:text-lg">{patient.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      ডায়েরি নং: {patient.diaryNumber?.toString() || 'N/A'} | ফোন: {patient.phone}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold text-sm mb-3 text-foreground">রোগীর কার্যক্রম</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleAddPatientToTodaysQueue(patient)}
                    disabled={isCreatingVisit === patient.id}
                    className="h-8 px-2.5 text-xs rounded-md shadow-md hover:shadow-lg hover:-translate-y-px bg-gradient-to-r from-green-100 to-lime-200 text-green-800 transition-all"
                  >
                    {isCreatingVisit === patient.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarPlus className="mr-2 h-4 w-4" />}
                    {isCreatingVisit === patient.id ? 'প্রসেসিং...' : 'আজকের কার্যক্রমে যুক্ত করুন'}
                  </Button>
                   <Button onClick={() => handleOpenDetailsModal(patient, 'info')} className="h-8 px-2.5 text-xs rounded-md shadow-md hover:shadow-lg hover:-translate-y-px bg-gradient-to-r from-amber-100 to-orange-200 text-amber-800 transition-all">
                    <FileHeart className="mr-2 h-4 w-4" /> কেস হিস্ট্রি দেখুন
                  </Button>
                  <Button onClick={() => handleOpenDetailsModal(patient, 'history')} className="h-8 px-2.5 text-xs rounded-md shadow-md hover:shadow-lg hover:-translate-y-px bg-gradient-to-r from-purple-100 to-indigo-200 text-purple-800 transition-all">
                    <History className="mr-2 h-4 w-4" /> ভিজিটের বিবরণ
                  </Button>
                   <Button onClick={() => handleOpenMedicineInstructions(patient)} className="h-8 px-2.5 text-xs rounded-md shadow-md hover:shadow-lg hover:-translate-y-px bg-gradient-to-r from-indigo-100 to-blue-200 text-indigo-800 transition-all">
                    <ClipboardList className="mr-2 h-4 w-4" /> ঔষধের নিয়মাবলী
                  </Button>
                  <Button onClick={() => handleOpenPaymentModal(patient)} className="h-8 px-2.5 text-xs rounded-md shadow-md hover:shadow-lg hover:-translate-y-px bg-gradient-to-r from-sky-100 to-cyan-200 text-sky-800 transition-all">
                    <CreditCard className="mr-2 h-4 w-4" /> সাধারণ পেমেন্ট
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedPatientForModal && isDetailsModalOpen && (
        <PatientDetailsModal
          patient={selectedPatientForModal}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          defaultTab={activeModalTab}
          onPatientUpdate={handlePatientUpdatedInModal}
        />
      )}

      {selectedPatientForModal && isPaymentModalOpen && (
        <CreatePaymentSlipModal
          patient={selectedPatientForModal}
          isOpen={isPaymentModalOpen}
          onClose={(slipCreated) => { 
            setIsPaymentModalOpen(false);
            if (slipCreated) window.dispatchEvent(new CustomEvent('firestoreDataChange'));
          }}
        />
      )}
    </div>
  );
}
