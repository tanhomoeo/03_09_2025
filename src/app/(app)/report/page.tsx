
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import { getVisits, getPatients, getPaymentSlips, formatDate, formatCurrency, getClinicSettings, PAYMENT_METHOD_LABELS, getPaymentMethodLabel, getWeekRange, getMonthRange } from '@/lib/firestoreService';
import type { Visit, Patient, PaymentSlip, ClinicSettings, PaymentMethod } from '@/lib/types';
import { CalendarIcon, Printer, Loader2, Filter, FileText } from 'lucide-react';
import { format, startOfDay, endOfDay, isValid } from 'date-fns';
import { bn } from 'date-fns/locale';
import { APP_NAME } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface ReportData {
  visit?: Visit;
  patient?: Patient;
  slips: PaymentSlip[];
  totalAmountFromSlips: number;
  deliveryMethod?: 'direct' | 'courier';
}

type ReportType = 'daily' | 'weekly' | 'monthly' | 'custom';

const reportTypeOptions: { value: ReportType; label: string }[] = [
  { value: 'daily', label: 'দৈনিক প্রতিবেদন' },
  { value: 'weekly', label: 'সাপ্তাহিক প্রতিবেদন' },
  { value: 'monthly', label: 'মাসিক প্রতিবেদন' },
  { value: 'custom', label: 'কাস্টম তারিখ পরিসীমা' },
];

const paymentMethodFilterOptions: { value: PaymentMethod | 'all'; label: string }[] = [
  { value: 'all', label: 'সকল পেমেন্ট মাধ্যম' },
  ...Object.entries(PAYMENT_METHOD_LABELS)
    .map(([value, label]) => ({ value: value as Exclude<PaymentMethod, ''>, label }))
];

export default function EnhancedReportPage() {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | 'all'>('all');
  const [courierDeliveryOnly, setCourierDeliveryOnly] = useState(false);

  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [summary, setSummary] = useState({ totalVisits: 0, totalRevenue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const settings = await getClinicSettings();
        setClinicSettings(settings);
        const today = new Date();
        setSelectedDate(today);
        setStartDate(startOfDay(today));
        setEndDate(endOfDay(today));
      } catch (error) {
        console.error("Failed to fetch clinic settings:", error);
        toast({ title: "ত্রুটি", description: "ক্লিনিক সেটিংস লোড করা যায়নি।", variant: "destructive" });
        const today = new Date();
        setSelectedDate(today);
        setStartDate(startOfDay(today));
        setEndDate(endOfDay(today));
      }
    };
    fetchInitialData();
  }, [toast]);


  const generateReport = useCallback(async () => {
    if (!startDate || (reportType === 'custom' && !endDate)) {
        setReportData([]);
        setSummary({ totalVisits: 0, totalRevenue: 0 });
        setIsLoading(false); 
        return;
    }
    setIsLoading(true);

    try {
        const [allVisits, allPatients, allSlips] = await Promise.all([
            getVisits(),
            getPatients(),
            getPaymentSlips()
        ]);
        const patientsMap = new Map(allPatients.map(p => [p.id, p]));

        let currentReportStartDate: Date | null = null;
        let currentReportEndDate: Date | null = null;
        
        const baseDateForRange = (selectedDate && isValid(selectedDate)) ? selectedDate : (startDate && isValid(startDate) ? startDate : new Date());

        if (reportType === 'daily' && startDate && isValid(startDate)) {
          currentReportStartDate = startOfDay(startDate);
          currentReportEndDate = endOfDay(startDate);
        } else if (reportType === 'weekly' && baseDateForRange) {
          const { start, end } = getWeekRange(baseDateForRange);
          currentReportStartDate = startOfDay(start);
          currentReportEndDate = endOfDay(end);
        } else if (reportType === 'monthly' && baseDateForRange) {
          const { start, end } = getMonthRange(baseDateForRange);
          currentReportStartDate = startOfDay(start);
          currentReportEndDate = endOfDay(end);
        } else if (reportType === 'custom' && startDate && isValid(startDate) && endDate && isValid(endDate) && startDate <= endDate) {
          currentReportStartDate = startOfDay(startDate);
          currentReportEndDate = endOfDay(endDate);
        }


        if (!currentReportStartDate || !currentReportEndDate) {
            setReportData([]);
            setSummary({ totalVisits: 0, totalRevenue: 0 });
            setIsLoading(false);
            return;
        }
        
        const finalStartDate = currentReportStartDate;
        const finalEndDate = currentReportEndDate;

        const dateFilteredVisits = allVisits.filter(visit => {
            const visitDate = new Date(visit.visitDate);
            return isValid(visitDate) && visitDate >= finalStartDate && visitDate <= finalEndDate;
        });

        const dateFilteredSlips = allSlips.filter(slip => {
          const slipDate = new Date(slip.date);
          return isValid(slipDate) && slipDate >= finalStartDate && slipDate <= finalEndDate;
        })

        let itemsMap = new Map<string, ReportData>();

        // Process visits
        dateFilteredVisits.forEach(visit => {
            itemsMap.set(visit.id, {
                visit: visit,
                patient: patientsMap.get(visit.patientId),
                slips: [],
                totalAmountFromSlips: 0,
                deliveryMethod: visit.medicineDeliveryMethod
            });
        });

        // Process slips and associate with visits or treat as standalone
        dateFilteredSlips.forEach(slip => {
            if (slip.visitId && itemsMap.has(slip.visitId)) {
                const item = itemsMap.get(slip.visitId)!;
                item.slips.push(slip);
                 if (slip.medicineDeliveryMethod) {
                    item.deliveryMethod = slip.medicineDeliveryMethod;
                }
            } else {
                 const key = `slip_${slip.id}`;
                 if (!itemsMap.has(key)) {
                     itemsMap.set(key, {
                        slips: [],
                        totalAmountFromSlips: 0,
                        patient: patientsMap.get(slip.patientId),
                        deliveryMethod: slip.medicineDeliveryMethod,
                     });
                 }
                 itemsMap.get(key)?.slips.push(slip);
            }
        });
        
        let reportItems = Array.from(itemsMap.values());
        
        // Calculate total amounts and apply filters
        reportItems.forEach(item => {
            if (paymentMethodFilter !== 'all') {
                item.slips = item.slips.filter(s => s.paymentMethod === paymentMethodFilter);
            }
            item.totalAmountFromSlips = item.slips.reduce((acc, slip) => acc + slip.amount, 0);
        });
        
        // Filter out items that don't match after slip filtering
        reportItems = reportItems.filter(item => {
            // Keep if it has a visit or if it has slips (for slip-only entries)
            return item.visit || item.slips.length > 0;
        });

        if (courierDeliveryOnly) {
          reportItems = reportItems.filter(item => item.deliveryMethod === 'courier');
        }

        setReportData(reportItems.sort((a,b) => {
            const dateA = a.visit?.visitDate || a.slips[0]?.date || 0;
            const dateB = b.visit?.visitDate || b.slips[0]?.date || 0;
            return new Date(dateA).getTime() - new Date(dateB).getTime() || (a.patient?.name || '').localeCompare(b.patient?.name || '', 'bn')
        }));

        const totalRevenue = reportItems.reduce((acc, item) => acc + item.totalAmountFromSlips, 0);
        const totalVisits = reportItems.filter(item => item.visit).length;
        setSummary({ totalVisits: totalVisits, totalRevenue });

    } catch (error) {
        console.error("Error generating report:", error);
        toast({ title: "রিপোর্ট তৈরি করতে সমস্যা", description: "ডেটা আনতে ত্রুটি হয়েছে।", variant: "destructive" });
        setReportData([]);
        setSummary({ totalVisits: 0, totalRevenue: 0 });
    } finally {
        setIsLoading(false);
    }
  }, [startDate, endDate, reportType, paymentMethodFilter, courierDeliveryOnly, selectedDate, toast]);

  useEffect(() => {
    const baseDate = (selectedDate && isValid(selectedDate)) ? selectedDate : new Date();
    if (reportType === 'daily') {
        setStartDate(startOfDay(baseDate));
        setEndDate(endOfDay(baseDate));
    } else if (reportType === 'weekly') {
        const { start, end } = getWeekRange(baseDate);
        setStartDate(startOfDay(start));
        setEndDate(endOfDay(end));
    } else if (reportType === 'monthly') {
        const { start, end } = getMonthRange(baseDate);
        setStartDate(startOfDay(start));
        setEndDate(endOfDay(end));
    }
  }, [reportType, selectedDate]);

  useEffect(() => {
    if (startDate && (reportType !== 'custom' || (reportType === 'custom' && endDate && isValid(endDate) && startDate <= endDate))) {
        generateReport();
    } else if (reportType === 'custom' && (!startDate || !endDate || (endDate && isValid(endDate) && startDate && startDate > endDate))) {
        setReportData([]);
        setSummary({ totalVisits: 0, totalRevenue: 0 });
        setIsLoading(false);
    }
  }, [startDate, endDate, reportType, paymentMethodFilter, courierDeliveryOnly, generateReport]);


  const handlePrintReport = () => {
    if (typeof window !== 'undefined') {
      const elementsToHide = document.querySelectorAll('.hide-on-print');
      elementsToHide.forEach(el => (el as HTMLElement).style.display = 'none');
      document.body.classList.add('printing-report-active');
      window.print();
      document.body.classList.remove('printing-report-active');
      elementsToHide.forEach(el => (el as HTMLElement).style.display = '');
    }
  };

  const getReportDateRangeString = useCallback((): string => {
    if (!startDate || !isValid(startDate)) return "একটি তারিখ নির্বাচন করুন";
    if (reportType === 'daily') return format(startDate, "eeee, dd MMMM, yyyy", { locale: bn });
    if (reportType === 'weekly') {
      const { start, end } = getWeekRange(startDate);
      return `${format(start, "dd MMM", { locale: bn })} - ${format(end, "dd MMM, yyyy", { locale: bn })}`;
    }
    if (reportType === 'monthly') return format(startDate, "MMMM, yyyy", { locale: bn });
    if (reportType === 'custom' && endDate && isValid(endDate) && startDate <= endDate) {
      return `${format(startDate, "dd MMM, yyyy", { locale: bn })} থেকে ${format(endDate, "dd MMM, yyyy", { locale: bn })}`;
    }
    if (reportType === 'custom') return `${format(startDate, "dd MMM, yyyy", { locale: bn })} থেকে (শেষ তারিখ নির্বাচন করুন)`;
    
    return format(startDate, "PPP", { locale: bn });
  }, [startDate, endDate, reportType]);

  const currentReportTypeOption = reportTypeOptions.find(opt => opt.value === reportType);
  const pageTitle = currentReportTypeOption ? currentReportTypeOption.label : "প্রতিবেদন";
  
  const reportPageDescriptionText = useMemo(() => {
    if (isLoading) {
      return "রিপোর্টের তথ্য লোড হচ্ছে...";
    }
    const dateStr = getReportDateRangeString();
    const paymentStr = paymentMethodFilter !== 'all' ? ` | পেমেন্ট: ${getPaymentMethodLabel(paymentMethodFilter as PaymentMethod)}` : '';
    const courierStr = courierDeliveryOnly ? ' | শুধু কুরিয়ার' : '';
    return `তারিখ/পরিসীমা: ${dateStr}${paymentStr}${courierStr}`;
  }, [isLoading, getReportDateRangeString, paymentMethodFilter, courierDeliveryOnly]);

  if (isLoading && !clinicSettings) {
    return <LoadingSpinner variant='page' label='প্রতিবেদন লোড হচ্ছে...' />
  }

  return (
    <React.Fragment>
      <div className="space-y-6 print:space-y-2">
        <PageHeaderCard
          title={pageTitle}
          description={reportPageDescriptionText}
          className="hide-on-print bg-gradient-to-br from-green-100 to-lime-200 dark:from-green-900/30 dark:to-lime-900/30"
          actions={
            <div className='flex items-center gap-2'>
              <FileText className="h-8 w-8 text-primary" />
              <Button onClick={handlePrintReport} variant="outline" disabled={isLoading}><Printer className="mr-2 h-4 w-4" /> প্রিন্ট করুন</Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <div className="space-y-1">
              <Label htmlFor="reportType">রিপোর্ট টাইপ</Label>
              <Select value={reportType} onValueChange={(value) => { setReportType(value as ReportType); setSelectedDate(new Date()); }}>
                <SelectTrigger id="reportType"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {reportTypeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {reportType === 'daily' && (
              <div className="space-y-1">
                <Label htmlFor="dailyDate">তারিখ</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="dailyDate" variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate && isValid(startDate) ? format(startDate, "PPP", { locale: bn }) : <span>একটি তারিখ নির্বাচন করুন</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={(date) => { setStartDate(date ? startOfDay(date) : undefined); setSelectedDate(date || new Date()); setEndDate(date ? endOfDay(date) : undefined);}} initialFocus locale={bn} /></PopoverContent>
                </Popover>
              </div>
            )}
             {reportType === 'weekly' && (
              <div className="space-y-1">
                <Label htmlFor="weeklyDate">সপ্তাহের যেকোনো দিন</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button id="weeklyDate" variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate && isValid(selectedDate) ? format(selectedDate, "PPP", { locale: bn }) : <span>একটি তারিখ নির্বাচন করুন</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={(date) => setSelectedDate(date || new Date())} initialFocus locale={bn} /></PopoverContent>
                </Popover>
              </div>
            )}
            {reportType === 'monthly' && (
              <div className="space-y-1">
                <Label htmlFor="monthlyDate">মাসের যেকোনো দিন</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="monthlyDate" variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate && isValid(selectedDate) ? format(selectedDate, "MMMM yyyy", { locale: bn }) : <span>একটি মাস নির্বাচন করুন</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={selectedDate} onSelect={(date) => setSelectedDate(date || new Date())} initialFocus locale={bn} captionLayout="dropdown-buttons" fromYear={2020} toYear={new Date().getFullYear() + 5}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            {reportType === 'custom' && (
              <React.Fragment>
                <div className="space-y-1">
                  <Label htmlFor="startDateCustom">শুরুর তারিখ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="startDateCustom" variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate && isValid(startDate) ? format(startDate, "PPP", { locale: bn }) : <span>শুরুর তারিখ</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={(date) => setStartDate(date ? startOfDay(date) : undefined)} initialFocus locale={bn} /></PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endDateCustom">শেষ তারিখ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="endDateCustom" variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate && isValid(endDate) ? format(endDate, "PPP", { locale: bn }) : <span>শেষ তারিখ</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={(date) => setEndDate(date ? endOfDay(date) : undefined)} initialFocus locale={bn} disabled={(date) => startDate && isValid(startDate) ? date < startDate : false} /></PopoverContent>
                  </Popover>
                </div>
              </React.Fragment>
            )}
             <div className="space-y-1">
              <Label htmlFor="paymentMethodFilter">পেমেন্ট মাধ্যম</Label>
              <Select value={paymentMethodFilter} onValueChange={(value) => setPaymentMethodFilter(value as PaymentMethod | 'all')}>
                <SelectTrigger id="paymentMethodFilter"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  {paymentMethodFilterOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-5">
              <Switch id="courierDeliveryOnly" checked={courierDeliveryOnly} onCheckedChange={setCourierDeliveryOnly} />
              <Label htmlFor="courierDeliveryOnly">শুধু কুরিয়ার ডেলিভারি</Label>
            </div>
          </div>
        </PageHeaderCard>

        <div className="print-only-block print-container bg-white text-black">
          <div className="print-header">
            <h1 className="font-headline text-xl font-bold">{clinicSettings?.clinicName || APP_NAME}</h1>
            {clinicSettings?.clinicAddress && <p className="text-xs">{clinicSettings.clinicAddress}</p>}
            {clinicSettings?.clinicContact && <p className="text-xs">যোগাযোগ: {clinicSettings.clinicContact}</p>}
            <h2 className="print-title text-lg font-semibold mt-1">{pageTitle}</h2>
            <p className="text-xs">{reportPageDescriptionText}</p>
          </div>

          <div className="report-table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[5%] text-center">নং</TableHead>
                    <TableHead className="w-[10%]">তারিখ</TableHead>
                    <TableHead className="w-[20%]">রোগীর নাম</TableHead>
                    <TableHead className="w-[10%]">ডায়েরি নং</TableHead>
                    <TableHead className="w-[15%]">ফোন</TableHead>
                    <TableHead className="w-[20%]">উদ্দেশ্য/উপসর্গ</TableHead>
                    <TableHead className="w-[10%]">মাধ্যম</TableHead>
                    <TableHead className="text-right w-[10%]">পরিমাণ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.length > 0 ? (
                    reportData.map((item, index) => (
                      <TableRow key={item.visit?.id || item.slips[0].id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell>{format(new Date(item.visit?.visitDate || item.slips[0].date), "dd/MM/yy", { locale: bn })}</TableCell>
                        <TableCell className="font-medium">{item.patient?.name || 'N/A'}</TableCell>
                        <TableCell>{item.patient?.diaryNumber || 'N/A'}</TableCell>
                        <TableCell>{item.patient?.phone || 'N/A'}</TableCell>
                        <TableCell className="print:max-w-[120px] print:whitespace-normal print:truncate">{item.visit?.symptoms || item.slips.map(s => s.purpose).join(', ') || 'N/A'}</TableCell>
                        <TableCell className="print:max-w-[70px] print:whitespace-normal print:truncate">
                          {item.slips.length > 0 ? item.slips.map(s => getPaymentMethodLabel(s.paymentMethod)).filter((v, i, a) => a.indexOf(v) === i).join(', ') || '-' : '-'}
                        </TableCell>
                        <TableCell className="text-right">{item.totalAmountFromSlips > 0 ? formatCurrency(item.totalAmountFromSlips) : '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        এই ফিল্টার অনুযায়ী কোনো ডেটা পাওয়া যায়নি।
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow className="font-bold bg-gray-100">
                    <TableCell colSpan={4} className="text-left">মোট ভিজিট: {summary.totalVisits.toLocaleString('bn-BD')}</TableCell>
                    <TableCell colSpan={3} className="text-right">সর্বমোট আয়:</TableCell>
                    <TableCell className="text-right">{formatCurrency(summary.totalRevenue)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
          </div>
        </div>

        {isLoading && (!startDate || (reportType === 'custom' && !endDate)) ? (
          <div className="flex justify-center items-center py-10 hide-on-print">
              <p className="text-muted-foreground">রিপোর্ট দেখতে অনুগ্রহ করে তারিখ নির্বাচন করুন।</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-10 hide-on-print">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">রিপোর্ট ডেটা লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="hide-on-print">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="shadow-sm bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-2"><CardTitle className="text-base md:text-lg font-headline">মোট ভিজিট</CardTitle></CardHeader>
                <CardContent><p className="text-2xl md:text-3xl font-bold text-primary">{summary.totalVisits.toLocaleString('bn-BD')}</p></CardContent>
              </Card>
              <Card className="shadow-sm bg-card/80 backdrop-blur-lg">
                <CardHeader className="pb-2"><CardTitle className="text-base md:text-lg font-headline">মোট আয়</CardTitle></CardHeader>
                <CardContent><p className="text-2xl md:text-3xl font-bold text-primary">{formatCurrency(summary.totalRevenue)}</p></CardContent>
              </Card>
            </div>
            <div className="overflow-x-auto rounded-lg border shadow-sm bg-card/80 backdrop-blur-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px] text-center">Sl.</TableHead>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Diary No.</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Symptoms/Purpose</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.length > 0 ? (
                    reportData.map((item, index) => (
                      <TableRow key={item.visit?.id || item.slips[0].id} className="hover:bg-muted/50">
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell>{formatDate(item.visit?.visitDate || item.slips[0].date)}</TableCell>
                        <TableCell className="font-medium">{item.patient?.name || 'N/A'}</TableCell>
                        <TableCell>{item.patient?.diaryNumber || 'N/A'}</TableCell>
                        <TableCell>{item.patient?.phone || 'N/A'}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{item.visit?.symptoms || item.slips.map(s => s.purpose).join(', ') || 'N/A'}</TableCell>
                         <TableCell className="max-w-[100px] truncate">
                           {item.slips.length > 0 ?
                              item.slips.map(s => getPaymentMethodLabel(s.paymentMethod)).filter((v, i, a) => a.indexOf(v) === i).join(', ') || '-' : '-'
                           }
                         </TableCell>
                        <TableCell className="text-right">{item.totalAmountFromSlips > 0 ? formatCurrency(item.totalAmountFromSlips) : '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                       এই ফিল্টার অনুযায়ী কোনো ডেটা পাওয়া যায়নি।
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow className="font-bold bg-muted/50 dark:bg-muted/30">
                    <TableCell colSpan={4} className="text-left">মোট ভিজিট: {summary.totalVisits.toLocaleString('bn-BD')}</TableCell>
                    <TableCell colSpan={3} className="text-right">মোট আয়:</TableCell>
                    <TableCell className="text-right">{formatCurrency(summary.totalRevenue)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        )}

         <style jsx global>{`
          .print-only-block { display: none; }
          @media print {
            .hide-on-print { display: none !important; }
            .print-only-block { display: block !important; }
            body.printing-report-active {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              margin: 0; padding: 0;
              background-color: #fff !important;
            }
            .print-container {
              width: 100%;
              margin: 0 auto;
              padding: 5mm;
              box-sizing: border-box;
              font-family: 'PT Sans', Arial, sans-serif;
              font-size: 8pt;
              line-height: 1.2;
              color: #000 !important;
            }
            .print-header { text-align: center; margin-bottom: 4mm; border-bottom: 1px solid #666; padding-bottom: 2mm; }
            .print-header h1 { font-size: 12pt; }
            .print-header p { font-size: 7.5pt; }
            .print-title { font-size: 10pt; }
            .report-table-container table { width: 100%; border-collapse: collapse; margin-top: 2mm; table-layout: fixed; }
            .report-table-container th, .report-table-container td { border: 1px solid #bbb; padding: 1mm 1.5mm; text-align: left; vertical-align: top; font-size: 8pt; word-break: break-word; }
            .report-table-container th { background-color: #f0f0f0 !important; font-weight: bold; font-size: 8.5pt; }
            .report-table-container td.text-right, .report-table-container th.text-right { text-align: right; }
            .report-table-container td.text-center, .report-table-container th.text-center { text-align: center; }
            .print\\:hidden { display: table-cell !important; }
            .print\\:max-w-\\[120px\\] { max-width: 120px !important; }
            .print\\:whitespace-normal { white-space: normal !important; }
            .print\\:truncate { overflow: visible !important; white-space: normal !important; text-overflow: clip !important; }
          }
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
        `}</style>
      </div>
    </React.Fragment>
  );
}
