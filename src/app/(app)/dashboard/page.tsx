
'use client';
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Users, UserPlus, FileText, BarChart3, TrendingUp, Search as SearchIcon, Printer, CalendarDays, Loader2,
    MessageSquareText, PlayCircle
} from 'lucide-react';
import {
    getPatients,
    getVisitsWithinDateRange,
    getPaymentSlipsWithinDateRange,
    getPatientsRegisteredWithinDateRange,
    formatCurrency,
    getPaymentMethodLabel,
    getClinicSettings,
} from '@/lib/firestoreService';
import type { ClinicSettings, Patient, Visit, PaymentSlip, PaymentMethod } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { bn } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';


const CreatePaymentSlipModal = dynamic(() =>
  import('@/components/slip/CreatePaymentSlipModal').then((mod) => mod.CreatePaymentSlipModal),
  {
    ssr: false,
    loading: () => <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /> <span className="ml-2">পেমেন্ট মডাল লোড হচ্ছে...</span></div>
  }
);

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  iconColorClass: string;
  gradientClass: string;
}

const QuickActionCardMemoized: React.FC<QuickActionCardProps> = React.memo(({ title, description, icon: Icon, iconColorClass, href, gradientClass }) => (
  <Link href={href} className="block group">
    <Card className={cn(
        "transition-all duration-300 p-4 h-full flex flex-col items-center justify-center text-center border-0 shadow-lg group-hover:shadow-xl group-hover:-translate-y-1",
        gradientClass
      )}>
        <div className="p-3 bg-white/60 rounded-full mb-3 shadow-md backdrop-blur-sm">
          <Icon className={cn("h-7 w-7 transition-transform duration-200 group-hover:scale-110", iconColorClass)} />
        </div>
        <h3 className="text-md font-headline font-semibold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-600 mt-1">{description}</p>
    </Card>
  </Link>
));
QuickActionCardMemoized.displayName = 'QuickActionCard';


interface ActivityStat {
  label: string;
  value: string | number;
  icon?: React.ElementType;
}

interface ActivityCardProps {
  title: string;
  stats: ActivityStat[];
  detailsLink?: string;
  icon?: React.ElementType;
  iconColorClass: string;
  gradientClass: string;
}

const ActivityCardMemoized: React.FC<ActivityCardProps> = React.memo(({ title, stats, detailsLink, icon: TitleIcon, iconColorClass, gradientClass }) => (
    <Card className={cn("h-full border-0 shadow-lg", gradientClass)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white/60 rounded-lg shadow-md backdrop-blur-sm">
            {TitleIcon && <TitleIcon className={cn("h-6 w-6", iconColorClass)} />}
          </div>
          <CardTitle className="text-lg font-headline text-slate-800">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm pt-0">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center text-slate-600 justify-between">
            <div className="flex items-center">
              {stat.icon && <stat.icon className="h-4 w-4 mr-2" />}
              <span>{stat.label}:</span>
            </div>
            <span className="font-semibold ml-1 text-slate-800">{stat.value}</span>
          </div>
        ))}
      </CardContent>
      {detailsLink && (
        <CardFooter className="pt-2">
          <Link href={detailsLink} className="text-sm text-primary hover:underline">
            বিস্তারিত দেখুন →
          </Link>
        </CardFooter>
      )}
    </Card>
));
ActivityCardMemoized.displayName = 'ActivityCard';


interface AppointmentDisplayItem {
  visitId: string;
  patient: Patient;
  patientName: string;
  diaryNumberDisplay: string;
  address: string;
  time: string;
  reason: string;
  status: 'Completed' | 'Pending';
  paymentMethod: string;
  paymentAmount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<ClinicStats>({
    totalPatients: 0,
    todayPatientCount: 0,
    monthlyPatientCount: 0,
    todayRevenue: 0,
    monthlyIncome: 0,
    dailyActivePatients: 0,
    dailyOtherRegistered: 0,
    monthlyNewPatients:0,
    monthlyTotalRegistered:0,
  });
  const [loading, setLoading] = useState(true);
  const [todaysAppointments, setTodaysAppointments] = useState<AppointmentDisplayItem[]>([]);
  const [dashboardSearchTerm, setDashboardSearchTerm] = useState('');
  const router = useRouter();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPatientForPaymentModal, setSelectedPatientForPaymentModal] = useState<Patient | null>(null);
  const [currentVisitIdForPaymentModal, setCurrentVisitIdForPaymentModal] = useState<string | undefined>();
  const [clientRenderedTimestamp, setClientRenderedTimestamp] = useState<Date | null>(null);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);

  useEffect(() => {
    setClientRenderedTimestamp(new Date());
  }, []);

  const processAppointments = useCallback((todayVisits: Visit[], todaySlips: PaymentSlip[], allPatients: Patient[]): AppointmentDisplayItem[] => {
    const patientsDataMap = new Map(allPatients.map(p => [p.id, p]));

    const appointmentsData = todayVisits
      .map(visit => {
        const patient = patientsDataMap.get(visit.patientId);
        if (!patient) return null;

        const paymentSlipForVisit = todaySlips.find(s => s.visitId === visit.id && (s.amount ?? 0) > 0);
        const currentStatus: 'Completed' | 'Pending' = paymentSlipForVisit ? 'Completed' : 'Pending';
        const paymentAmount = paymentSlipForVisit ? paymentSlipForVisit.amount : 0;

        const visitCreatedAtDate = visit.createdAt ? new Date(visit.createdAt) : null;
        const timeString = visitCreatedAtDate && isValid(visitCreatedAtDate)
          ? format(visitCreatedAtDate, "p", { locale: bn })
          : 'N/A';

        return {
          visitId: visit.id,
          patient: patient,
          patientName: patient.name,
          diaryNumberDisplay: patient.diaryNumber || 'N/A',
          address: patient.villageUnion || 'N/A',
          time: timeString,
          reason: visit.symptoms || 'N/A',
          status: currentStatus,
          paymentMethod: paymentSlipForVisit ? getPaymentMethodLabel(paymentSlipForVisit.paymentMethod as PaymentMethod) : 'N/A',
          paymentAmount: paymentAmount,
          createdAt: visit.createdAt,
        };
      })
      .filter((item): item is AppointmentDisplayItem => item !== null)
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return appointmentsData;
  }, []);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    try {
        const [
            allPatients,
            todayVisits,
            monthVisits,
            todaySlips,
            monthSlips,
            patientsCreatedThisMonth,
            patientsCreatedToday,
            settings
        ] = await Promise.all([
            getPatients(),
            getVisitsWithinDateRange(todayStart, todayEnd),
            getVisitsWithinDateRange(monthStart, monthEnd),
            getPaymentSlipsWithinDateRange(todayStart, todayEnd),
            getPaymentSlipsWithinDateRange(monthStart, monthEnd),
            getPatientsRegisteredWithinDateRange(monthStart, monthEnd),
            getPatientsRegisteredWithinDateRange(todayStart, todayEnd),
            getClinicSettings()
        ]);
    
        setClinicSettings(settings);
        const uniqueTodayPatientIds = new Set(todayVisits.map(v => v.patientId));
    
        const todayRevenue = todaySlips.reduce((sum, s) => sum + s.amount, 0);
        const monthlyIncome = monthSlips.reduce((sum, s) => sum + s.amount, 0);
    
        const dailyOtherRegisteredPatientIds = new Set(
            patientsCreatedToday
            .map(p => p.id)
            .filter(id => !uniqueTodayPatientIds.has(id))
        );
    
    
        setStats({
          totalPatients: allPatients.length,
          todayPatientCount: uniqueTodayPatientIds.size,
          monthlyPatientCount: new Set(monthVisits.map(v => v.patientId)).size,
          todayRevenue: todayRevenue,
          monthlyIncome: monthlyIncome,
          dailyActivePatients: uniqueTodayPatientIds.size,
          dailyOtherRegistered: dailyOtherRegisteredPatientIds.size,
          monthlyNewPatients: patientsCreatedThisMonth.length,
          monthlyTotalRegistered: allPatients.length,
        });

        const processedAppointments = processAppointments(todayVisits, todaySlips, allPatients);
        setTodaysAppointments(processedAppointments);

    } catch(error) {
        console.error("Failed to load dashboard data", error);
    } finally {
        setLoading(false);
    }
  }, [processAppointments]);

  useEffect(() => {
    loadDashboardData();
    const handleExternalDataChange = () => {
        loadDashboardData();
    };
    window.addEventListener('firestoreDataChange', handleExternalDataChange);
    return () => {
        window.removeEventListener('firestoreDataChange', handleExternalDataChange);
    };
  }, [loadDashboardData]);

  const handleDashboardSearch = () => {
    if (dashboardSearchTerm.trim()) {
      router.push(`${ROUTES.PATIENT_SEARCH}?q=${encodeURIComponent(dashboardSearchTerm)}`);
    }
  };

  const handlePrintAppointments = () => {
    if (typeof window !== 'undefined') {
      document.body.classList.add('printing-dashboard-active');
      window.print();
      document.body.classList.remove('printing-dashboard-active');
    }
  };

  const handleStartWorkflow = (patientId: string, visitId: string) => {
    router.push(`${ROUTES.PRESCRIPTION}/${patientId}?visitId=${visitId}`);
  };
  
  const todaysTotalRevenue = todaysAppointments.reduce((sum, appt) => sum + appt.paymentAmount, 0);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="mb-6">
          <div className="h-10 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-6"></div>
          <div className="mt-6 max-w-xl">
            <div className="h-11 bg-muted rounded-md"></div>
          </div>
        </div>
        <div>
          <div className="h-8 bg-muted rounded w-1/3 mb-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-muted rounded-lg"></div>)}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-muted rounded-lg p-4 h-48"></div>
          ))}
        </div>
        <div className="bg-muted rounded-lg p-4">
          <div className="h-8 bg-muted-foreground/30 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted-foreground/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="space-y-8">
      <div className="mb-6 hide-on-print">
        <h1 className="text-2xl font-bold font-headline text-blue-900 dark:text-blue-300 text-shadow-3d">ড্যাশবোর্ড</h1>
        <p className="text-muted-foreground">আপনার ক্লিনিকের কার্যক্রমের একটি সারসংক্ষেপ।</p>
      </div>
       
      <div className="hide-on-print flex justify-center my-2">
          <div className="group relative w-72 lg:w-80 focus-within:w-full lg:focus-within:w-3/4 transition-all duration-200 ease-in-out
                bg-background/60 backdrop-blur-sm rounded-lg shadow-xl shadow-black/20 focus-within:shadow-2xl focus-within:shadow-black/30">
             <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <SearchIcon className="h-5 w-5 text-muted-foreground" />
             </div>
             <Input
                id="dashboardSearchInput"
                type="search"
                placeholder="রোগী অনুসন্ধান করুন..."
                className="w-full pl-12 h-12 text-base bg-transparent shadow-none border-none focus-visible:ring-0 rounded-lg"
                value={dashboardSearchTerm}
                onChange={(e) => setDashboardSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDashboardSearch()}
              />
          </div>
       </div>

      <div className="hide-on-print">
        <h2 className="text-xl font-semibold font-headline text-foreground mb-3">দ্রুত কার্যক্রম</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <QuickActionCardMemoized
            title="নতুন রোগী ভর্তি"
            description="সিস্টেমে নতুন রোগীদের নিবন্ধন করুন।"
            icon={UserPlus}
            iconColorClass="text-sky-500"
            href={ROUTES.PATIENT_ENTRY}
            gradientClass="bg-gradient-to-br from-sky-100 to-blue-200"
          />
          <QuickActionCardMemoized
            title="রোগীর তালিকা"
            description="সকল নিবন্ধিত রোগীদের খুঁজুন।"
            icon={Users}
            iconColorClass="text-teal-500"
            href={ROUTES.DICTIONARY}
            gradientClass="bg-gradient-to-br from-teal-100 to-green-200"
          />
          <QuickActionCardMemoized
            title="দৈনিক প্রতিবেদন"
            description="দৈনিক কার্যক্রমের বিস্তারিত সারসংক্ষেপ।"
            icon={FileText}
            iconColorClass="text-green-500"
            href={ROUTES.DAILY_REPORT}
            gradientClass="bg-gradient-to-br from-green-100 to-lime-200"
          />
          <QuickActionCardMemoized
            title="AI অভিযোগ সারাংশ"
            description="AI দ্বারা অভিযোগ বিশ্লেষণ করুন।"
            icon={MessageSquareText}
            iconColorClass="text-purple-500"
            href={ROUTES.AI_SUMMARY}
            gradientClass="bg-gradient-to-br from-purple-100 to-indigo-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 hide-on-print">
        <ActivityCardMemoized
          title="মাসিক কার্যকলাপ"
          icon={BarChart3}
          iconColorClass="text-blue-500"
          gradientClass="bg-gradient-to-br from-blue-100 to-violet-200"
          stats={[
            { label: 'এই মাসে নতুন রোগী', value: stats.monthlyNewPatients || 0, icon: UserPlus },
            { label: 'মোট নিবন্ধিত রোগী', value: stats.monthlyTotalRegistered || 0, icon: Users },
            { label: 'আনুমানিক মাসিক আয়', value: formatCurrency(stats.monthlyIncome || 0), icon: TrendingUp },
          ]}
          detailsLink={ROUTES.DAILY_REPORT}
        />
        <ActivityCardMemoized
          title="দৈনিক কার্যকলাপ"
          icon={CalendarDays}
          iconColorClass="text-lime-600"
          gradientClass="bg-gradient-to-br from-lime-100 to-amber-200"
          stats={[
            { label: 'আজ নতুন/সক্রিয় রোগী', value: stats.dailyActivePatients || 0, icon: UserPlus },
            { label: 'অন্যান্য নিবন্ধিত রোগী', value: stats.dailyOtherRegistered || 0, icon: Users },
            { label: 'আজকের আয়', value: formatCurrency(stats.todayRevenue || 0), icon: TrendingUp },
          ]}
          detailsLink={ROUTES.DAILY_REPORT}
        />
      </div>

      <Card className="shadow-neumorphic-outset dashboard-appointments-card hide-on-print">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-xl">আজকের সাক্ষাৎকার</CardTitle>
            <CardDescription>
              {clientRenderedTimestamp ? format(clientRenderedTimestamp, "eeee, MMMM dd, yyyy", { locale: bn }) : 'লোড হচ্ছে...'}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrintAppointments}><Printer className="mr-2 h-4 w-4" /> প্রিন্ট তালিকা</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%]">রোগীর নাম</TableHead>
                  <TableHead className="w-[10%]">সময়</TableHead>
                  <TableHead className="w-[10%]">ডায়েরি নং</TableHead>
                  <TableHead className="w-[15%]">ঠিকানা</TableHead>
                  <TableHead className="w-[10%]">পেমেন্ট মাধ্যম</TableHead>
                  <TableHead className="w-[10%] text-right">পরিমাণ</TableHead>
                  <TableHead className="w-[20%] text-center">অবস্থা ও কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todaysAppointments.length > 0 ? todaysAppointments.map((appt) => (
                  <TableRow key={appt.visitId}>
                    <TableCell className="font-medium">{appt.patientName}</TableCell>
                    <TableCell>{appt.time}</TableCell>
                    <TableCell>{appt.diaryNumberDisplay}</TableCell>
                    <TableCell>{appt.address}</TableCell>
                    <TableCell>{appt.paymentMethod}</TableCell>
                    <TableCell className="text-right">{formatCurrency(appt.paymentAmount)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                         <Badge variant={appt.status === 'Completed' ? 'default' : 'secondary'}
                              className={
                                appt.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 border-green-300 dark:border-green-600' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 border-yellow-300 dark:border-yellow-600'
                              }
                        >
                          {appt.status === 'Completed' ? 'কার্যক্রম শেষ' : 'অপেক্ষমান'}
                        </Badge>
                        <div className="flex items-center gap-1 mt-1">
                           <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleStartWorkflow(appt.patient.id, appt.visitId)}
                                        className="h-7 w-7 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-700/30"
                                    >
                                        <PlayCircle className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>কার্যক্রম শুরু করুন</p>
                                </TooltipContent>
                           </Tooltip>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      আজকের জন্য কোন সাক্ষাৎ নেই।
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
               <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} className="text-right font-bold">মোট আয়:</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(todaysTotalRevenue)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* --- Print-Only View --- */}
      <div className="print-only-block print-dashboard-container bg-white text-black">
        <div className="print-header">
          <h1 className="font-headline text-xl font-bold">{clinicSettings?.clinicName || APP_NAME}</h1>
          <h2 className="print-title text-lg font-semibold mt-1">আজকের সাক্ষাৎকার</h2>
          {clientRenderedTimestamp && <p className="text-xs">{format(clientRenderedTimestamp, "eeee, dd MMMM, yyyy", { locale: bn })}</p>}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[5%]">নং</TableHead>
              <TableHead className="w-[20%]">রোগীর নাম</TableHead>
              <TableHead className="w-[10%]">ডায়েরি নং</TableHead>
              <TableHead className="w-[15%]">ফোন</TableHead>
              <TableHead className="w-[20%]">ঠিকানা</TableHead>
              <TableHead className="w-[15%]">পেমেন্ট মাধ্যম</TableHead>
              <TableHead className="w-[15%] text-right">পরিমাণ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {todaysAppointments.length > 0 ? todaysAppointments.map((appt, index) => (
              <TableRow key={appt.visitId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{appt.patientName}</TableCell>
                <TableCell>{appt.diaryNumberDisplay}</TableCell>
                <TableCell>{appt.patient.phone}</TableCell>
                <TableCell>{appt.address}</TableCell>
                <TableCell>{appt.paymentMethod}</TableCell>
                <TableCell className="text-right">{formatCurrency(appt.paymentAmount)}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">আজকের জন্য কোন সাক্ষাৎ নেই।</TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold bg-gray-100">
              <TableCell colSpan={6} className="text-right">সর্বমোট আয়:</TableCell>
              <TableCell className="text-right">{formatCurrency(todaysTotalRevenue)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>


      {isPaymentModalOpen && selectedPatientForPaymentModal && (
        <CreatePaymentSlipModal
          patient={selectedPatientForPaymentModal}
          visitId={currentVisitIdForPaymentModal}
          isOpen={isPaymentModalOpen}
          onClose={(slipCreated) => {
            setIsPaymentModalOpen(false);
            if (slipCreated) loadDashboardData();
          }}
        />
      )}
    </div>
    </TooltipProvider>
  );
}
