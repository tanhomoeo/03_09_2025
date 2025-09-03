'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Users,
  UserPlus,
  FileText,
  BarChart3,
  TrendingUp,
  Search as SearchIcon,
  Printer,
  CalendarDays,
  MessageSquareText,
  PlayCircle,
  Loader2,
} from 'lucide-react';
import {
  getVisitsWithinDateRange,
  getPaymentSlipsWithinDateRange,
  getPatientsRegisteredWithinDateRange,
  formatCurrency,
  getPaymentMethodLabel,
  getClinicSettings,
  getPatientsByQuery,
} from '@/lib/firestoreService';
import type {
  ClinicSettings,
  Patient,
  Visit,
  PaymentSlip,
  PaymentMethod,
} from '@/lib/types';
import { ROUTES, APP_NAME } from '@/lib/constants';
import {
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  isValid,
} from 'date-fns';
import { bn } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import QuickActionCard from '@/components/dashboard/QuickActionCard';
import ActivityCard from '@/components/dashboard/ActivityCard';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useDebounce } from '@/hooks/use-debounce';
import { DashboardSkeleton } from './DashboardSkeleton';

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

interface ClinicStats {
  totalPatients: number;
  todayPatientCount: number;
  monthlyPatientCount: number;
  todayRevenue: number;
  monthlyIncome: number;
  dailyActivePatients: number;
  dailyOtherRegistered: number;
  monthlyNewPatients: number;
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
    monthlyNewPatients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [todaysAppointments, setTodaysAppointments] = useState<
    AppointmentDisplayItem[]
  >([]);
  const router = useRouter();

  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(
    null,
  );

  const [showRevenue, setShowRevenue] = useState(false);
  const revenueTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toggleSidebar } = useSidebar();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearchLoading(true);
      try {
        const filtered = await getPatientsByQuery(debouncedSearchQuery);
        setSearchResults(filtered);
      } catch (error) {
        console.error('Failed to search patients', error);
      } finally {
        setIsSearchLoading(false);
      }
    };
    fetchSearchResults();
  }, [debouncedSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchFormRef.current &&
        !searchFormRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRevenueClick = () => {
    if (revenueTimeoutRef.current) {
      clearTimeout(revenueTimeoutRef.current);
    }
    setShowRevenue(true);
    revenueTimeoutRef.current = setTimeout(() => {
      setShowRevenue(false);
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (revenueTimeoutRef.current) {
        clearTimeout(revenueTimeoutRef.current);
      }
    };
  }, []);

  const processAppointments = useCallback(
    (
      todayVisits: Visit[],
      todaySlips: PaymentSlip[],
      patientsDataMap: Map<string, Patient>,
    ): AppointmentDisplayItem[] => {
      const appointmentsData = todayVisits
        .map((visit) => {
          const patient = patientsDataMap.get(visit.patientId);
          if (!patient) return null;

          const paymentSlipForVisit = todaySlips.find(
            (s) => s.visitId === visit.id && (s.amount ?? 0) > 0,
          );
          const currentStatus: 'Completed' | 'Pending' = paymentSlipForVisit
            ? 'Completed'
            : 'Pending';
          const paymentAmount = paymentSlipForVisit
            ? paymentSlipForVisit.amount
            : 0;

          const visitCreatedAtDate = visit.createdAt
            ? new Date(visit.createdAt)
            : null;
          const timeString =
            visitCreatedAtDate && isValid(visitCreatedAtDate)
              ? format(visitCreatedAtDate, 'p', { locale: bn })
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
            paymentMethod: paymentSlipForVisit
              ? getPaymentMethodLabel(
                  paymentSlipForVisit.paymentMethod as PaymentMethod,
                )
              : 'N/A',
            paymentAmount: paymentAmount,
            createdAt: visit.createdAt,
          };
        })
        .filter((item): item is AppointmentDisplayItem => item !== null)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      return appointmentsData;
    },
    [],
  );

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    try {
      const [
        todayVisits,
        monthVisits,
        todaySlips,
        monthSlips,
        patientsCreatedThisMonth,
        patientsCreatedToday,
        settings,
      ] = await Promise.all([
        getVisitsWithinDateRange(todayStart, todayEnd),
        getVisitsWithinDateRange(monthStart, monthEnd),
        getPaymentSlipsWithinDateRange(todayStart, todayEnd),
        getPaymentSlipsWithinDateRange(monthStart, monthEnd),
        getPatientsRegisteredWithinDateRange(monthStart, monthEnd),
        getPatientsRegisteredWithinDateRange(todayStart, todayEnd),
        getClinicSettings(),
      ]);

      setClinicSettings(settings);
      const allPatientIds = new Set([
        ...todayVisits.map((v) => v.patientId),
        ...monthVisits.map((v) => v.patientId),
      ]);

      const patientsMap = new Map<string, Patient>();
      if (allPatientIds.size > 0) {
        // This could be optimized further by a `getPatientsByIds` function if needed
        const allPatients = await getPatientsByQuery(''); // Simplified: gets all patients if needed
        allPatients.forEach((p) => {
          if (allPatientIds.has(p.id)) {
            patientsMap.set(p.id, p);
          }
        });
      }

      const uniqueTodayPatientIds = new Set(
        todayVisits.map((v) => v.patientId),
      );

      const todayRevenue = todaySlips.reduce(
        (sum, s) => sum + (s.amount || 0),
        0,
      );
      const monthlyIncome = monthSlips.reduce(
        (sum, s) => sum + (s.amount || 0),
        0,
      );

      const dailyOtherRegisteredPatientIds = new Set(
        patientsCreatedToday
          .map((p) => p.id)
          .filter((id) => !uniqueTodayPatientIds.has(id)),
      );

      setStats({
        totalPatients: (await getPatientsByQuery('')).length, // Simplified count
        todayPatientCount: uniqueTodayPatientIds.size,
        monthlyPatientCount: new Set(monthVisits.map((v) => v.patientId)).size,
        todayRevenue: todayRevenue,
        monthlyIncome: monthlyIncome,
        dailyActivePatients: uniqueTodayPatientIds.size,
        dailyOtherRegistered: dailyOtherRegisteredPatientIds.size,
        monthlyNewPatients: patientsCreatedThisMonth.length,
      });

      const processedAppointments = processAppointments(
        todayVisits,
        todaySlips,
        patientsMap,
      );
      setTodaysAppointments(processedAppointments);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to load dashboard data', error.message);
      } else {
        console.error('An unknown error occurred while loading dashboard data');
      }
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
      window.removeEventListener(
        'firestoreDataChange',
        handleExternalDataChange,
      );
    };
  }, [loadDashboardData]);

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

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery) {
      router.push(`${ROUTES.PATIENT_SEARCH}?q=${searchQuery}`);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(
      `${ROUTES.PATIENT_SEARCH}?q=${patient.diaryNumber || patient.phone || patient.name}&tab=history`,
    );
  };

  const todaysTotalRevenue = todaysAppointments.reduce(
    (sum, appt) => sum + appt.paymentAmount,
    0,
  );

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 md:space-y-8 content-auto">
        <div
          className={cn(
            'md:hidden hide-on-print py-3 sticky top-0 z-40 backdrop-blur-md -mx-4 sm:-mx-6',
            'bg-background/70 shadow-sm',
          )}
        >
          <div className="flex items-center justify-between px-4 sm:px-6">
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex items-center gap-3 flex-shrink-0 -ml-1"
            >
              <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded-full shadow-md">
                <Image
                  src="/icons/icon.png"
                  width={28}
                  height={28}
                  alt="Logo"
                  data-ai-hint="clinic health logo"
                  className="flex-shrink-0"
                />
              </div>
              <span className="font-bold text-lg text-primary">{APP_NAME}</span>
            </button>

            <Button
              onClick={handleRevenueClick}
              variant="outline"
              className={cn(
                'relative h-auto rounded-full text-[11px] font-bold transition-all duration-300 ease-in-out py-1 px-2.5',
                'bg-card/80 border-border shadow-md hover:bg-muted',
              )}
            >
              <div className="relative h-4 flex items-center overflow-hidden">
                <span
                  className={cn(
                    'transition-all duration-300',
                    showRevenue
                      ? 'opacity-0 -translate-y-full'
                      : 'opacity-100 translate-y-0',
                  )}
                >
                  ব্যালেন্স
                </span>
                <span
                  className={cn(
                    'absolute inset-0 transition-all duration-300 font-semibold',
                    showRevenue
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-full',
                  )}
                >
                  {formatCurrency(stats.todayRevenue || 0)}
                </span>
              </div>
            </Button>
          </div>
        </div>

        <div
          className="flex items-center justify-center my-4 md:my-0 hide-on-print"
          ref={searchFormRef}
        >
          <Command
            className={cn(
              'relative w-full max-w-[280px] lg:max-w-xs transition-all duration-300 ease-in-out focus-within:max-w-md lg:focus-within:max-w-lg',
              'rounded-full bg-card/80 border-2 border-transparent shadow-lg backdrop-blur-sm overflow-visible',
            )}
          >
            <form onSubmit={handleSearchSubmit}>
              <CommandInput
                value={searchQuery}
                onValueChange={setSearchQuery}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="রোগী অনুসন্ধান করুন (নাম, ডায়েরি নং...)"
                className="w-full h-11 text-sm pl-4 pr-12 rounded-full focus:outline-none"
                aria-label="Search patients"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center justify-center w-11 h-11 rounded-full bg-blue-600 text-primary-foreground shadow-md transition-transform hover:bg-blue-700 active:scale-95"
                aria-label="Submit search"
              >
                <SearchIcon className="h-5 w-5" />
              </button>
            </form>
            {isSearchOpen && (
              <CommandList className="absolute top-full mt-2 w-full rounded-lg border bg-background shadow-lg z-10">
                {isSearchLoading && (
                  <div className="p-2 text-center text-sm text-muted-foreground flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> অনুসন্ধান
                    চলছে...
                  </div>
                )}
                {!isSearchLoading &&
                  debouncedSearchQuery.length > 1 &&
                  searchResults.length === 0 && (
                    <CommandEmpty>কোনো রোগী পাওয়া যায়নি।</CommandEmpty>
                  )}
                {searchResults.length > 0 && (
                  <CommandGroup heading="অনুসন্ধানের ফলাফল">
                    {searchResults.map((p) => (
                      <CommandItem
                        key={p.id}
                        onSelect={() => handlePatientSelect(p)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ফোন: {p.phone}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            )}
          </Command>
        </div>

        <div className="hide-on-print">
          <h2 className="text-lg md:text-xl font-semibold font-headline mb-3">
            দ্রুত কার্যক্রম
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickActionCard
              title="নতুন রোগী ভর্তি"
              description="নতুন রোগীদের নিবন্ধন করুন"
              icon={UserPlus}
              iconColorClass="text-sky-500"
              href={ROUTES.PATIENT_ENTRY}
              gradientClass="bg-gradient-to-br from-sky-100 to-blue-200"
            />
            <QuickActionCard
              title="রোগীর তালিকা"
              description="সকল রোগীদের খুঁজুন"
              icon={Users}
              iconColorClass="text-teal-500"
              href={ROUTES.DICTIONARY}
              gradientClass="bg-gradient-to-br from-teal-100 to-green-200"
            />
            <QuickActionCard
              title="দৈনিক প্রতিবেদন"
              description="দৈনিক কার্যক্রম দেখুন"
              icon={FileText}
              iconColorClass="text-green-500"
              href={ROUTES.DAILY_REPORT}
              gradientClass="bg-gradient-to-br from-green-100 to-lime-200"
            />
            <QuickActionCard
              title="AI সারাংশ"
              description="অভিযোগ বিশ্লেষণ করুন"
              icon={MessageSquareText}
              iconColorClass="text-purple-500"
              href={ROUTES.AI_SUMMARY}
              gradientClass="bg-gradient-to-br from-purple-100 to-indigo-200"
            />
          </div>
        </div>

        <Card className="dashboard-appointments-card">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 hide-on-print">
            <div>
              <CardTitle className="font-headline text-lg md:text-xl">
                আজকের সাক্ষাৎকার
              </CardTitle>
              <CardDescription className="text-sm">
                {format(new Date(), 'eeee, MMMM dd, yyyy', { locale: bn })}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintAppointments}
            >
              <Printer className="mr-2 h-4 w-4" /> প্রিন্ট তালিকা
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[15%]">রোগীর নাম</TableHead>
                    <TableHead className="w-[10%] hidden md:table-cell">
                      সময়
                    </TableHead>
                    <TableHead className="w-[10%]">ডায়েরি নং</TableHead>
                    <TableHead className="w-[15%] hidden sm:table-cell">
                      ঠিকানা
                    </TableHead>
                    <TableHead className="w-[10%] hidden lg:table-cell">
                      পেমেন্ট মাধ্যম
                    </TableHead>
                    <TableHead className="w-[10%] text-right">পরিমাণ</TableHead>
                    <TableHead className="w-[20%] text-center hide-on-print">
                      অব���্থা ও কার্যক্রম
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaysAppointments.length > 0 ? (
                    todaysAppointments.map((appt) => (
                      <TableRow key={appt.visitId} className="text-sm">
                        <TableCell className="font-medium">
                          {appt.patientName}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {appt.time}
                        </TableCell>
                        <TableCell>{appt.diaryNumberDisplay}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {appt.address}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {appt.paymentMethod}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(appt.paymentAmount)}
                        </TableCell>
                        <TableCell className="text-center hide-on-print">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <Badge
                              variant={
                                appt.status === 'Completed'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className={`text-xs ${
                                appt.status === 'Completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 border-green-300 dark:border-green-600'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 border-yellow-300 dark:border-yellow-600'
                              }`}
                            >
                              {appt.status === 'Completed'
                                ? 'কার্যক্রম শেষ'
                                : 'অপেক্ষমান'}
                            </Badge>
                            <div className="flex items-center gap-1 mt-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      handleStartWorkflow(
                                        appt.patient.id,
                                        appt.visitId,
                                      )
                                    }
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        আজকের জন্য কোন সাক্ষাৎ নেই।
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-right font-bold hide-on-print"
                    >
                      মোট আয়:
                    </TableCell>
                    <TableCell
                      colSpan={6}
                      className="text-right font-bold print-only-block"
                    >
                      মোট আয়:
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(todaysTotalRevenue)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 hide-on-print">
          <ActivityCard
            title="দৈনিক কার্যকলাপ"
            icon={CalendarDays}
            iconColorClass="text-blue-500"
            gradientClass="bg-gradient-to-br from-blue-100 to-violet-200"
            stats={[
              {
                label: 'আজকের মোট আয়',
                value: formatCurrency(stats.todayRevenue || 0),
                icon: TrendingUp,
              },
              {
                label: 'আজকের সক্রিয় রোগী',
                value: stats.dailyActivePatients.toLocaleString('bn-BD'),
                icon: UserPlus,
              },
              {
                label: 'অন্যান্য নিবন্ধিত রোগী',
                value: stats.dailyOtherRegistered.toLocaleString('bn-BD'),
                icon: Users,
              },
            ]}
            detailsLink={ROUTES.DAILY_REPORT}
          />
          <ActivityCard
            title="মাসিক কার্যকলাপ"
            icon={BarChart3}
            iconColorClass="text-green-500"
            gradientClass="bg-gradient-to-br from-green-100 to-lime-200"
            stats={[
              {
                label: 'চলতি মাসের মোট আয়',
                value: formatCurrency(stats.monthlyIncome || 0),
                icon: TrendingUp,
              },
              {
                label: 'এই মাসে নতুন রোগী',
                value: stats.monthlyNewPatients.toLocaleString('bn-BD'),
                icon: UserPlus,
              },
              {
                label: 'মোট নিবন্ধিত রোগী',
                value: stats.totalPatients.toLocaleString('bn-BD'),
                icon: Users,
              },
            ]}
          />
        </div>

        {/* --- Print-Only View --- */}
        <div className="print-only-block print-dashboard-container bg-white text-black">
          <div className="print-header">
            <h1 className="font-headline text-xl font-bold">
              {clinicSettings?.clinicName || APP_NAME}
            </h1>
            <h2 className="print-title text-lg font-semibold mt-1">
              আজকের সাক্ষাৎকার
            </h2>
            <p className="text-xs">
              {format(new Date(), 'eeee, dd MMMM, yyyy', { locale: bn })}
            </p>
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
              {todaysAppointments.length > 0 ? (
                todaysAppointments.map((appt, index) => (
                  <TableRow key={appt.visitId}>
                    <TableCell>{(index + 1).toLocaleString('bn-BD')}</TableCell>
                    <TableCell className="font-medium">
                      {appt.patientName}
                    </TableCell>
                    <TableCell>{appt.diaryNumberDisplay}</TableCell>
                    <TableCell>{appt.patient.phone}</TableCell>
                    <TableCell>{appt.address}</TableCell>
                    <TableCell>{appt.paymentMethod}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(appt.paymentAmount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    আজকের জন্য কোন ��াক্ষাৎ নেই।
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="font-bold bg-gray-100">
                <TableCell colSpan={6} className="text-right">
                  সর্বমোট আয়:
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(todaysTotalRevenue)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}
