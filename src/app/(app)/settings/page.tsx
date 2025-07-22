
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { PageHeaderCard } from '@/components/shared/PageHeaderCard';
import { Settings as SettingsIcon, Download, Upload, AlertTriangle, LogOut, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getPatients, getVisits, getPrescriptions, getPaymentSlips, getClinicSettings } from '@/lib/firestoreService';
import { APP_NAME, APP_VERSION } from '@/lib/constants';
import type { Patient, Visit, Prescription, PaymentSlip, ClinicSettings } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AllData {
  patients: Patient[];
  visits: Visit[];
  prescriptions: Prescription[];
  paymentSlips: PaymentSlip[];
  clinicSettings: ClinicSettings; 
}

const THEME_OPTIONS = [
  { value: 'default', label: 'ডিফল্ট', color: 'bg-blue-900' },
  { value: 'serene', label: 'প্রশান্তি', color: 'bg-teal-600' },
  { value: 'vibrant', label: 'স্পন্দন', color: 'bg-orange-600' },
];

export default function AppSettingsPage() {
  const { theme, setTheme, systemTheme } = useTheme();
  const { isAdmin, signOutUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileToImport, setFileToImport] = useState<File | null>(null);

  useEffect(() => setMounted(true), []);
  
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDarkMode = currentTheme === 'dark';

  const toggleDarkMode = (checked: boolean) => {
    const selectedBaseTheme = THEME_OPTIONS.find(t => t.value === (theme?.replace('-dark', '') || 'default'))?.value || 'default';
    
    if (checked) {
      setTheme(`${selectedBaseTheme}-dark`);
    } else {
      setTheme(selectedBaseTheme.replace('-dark',''));
    }
  };


  const handleLogout = async () => {
    try {
      await signOutUser();
      toast({
        title: "সফলভাবে লগ আউট হয়েছে",
        description: "আপনি এখন লগইন পৃষ্ঠায় ফিরে এসেছেন।",
      });
    } catch (error) {
      console.error("Failed to log out:", error);
      toast({
        title: "লগ আউট ব্যর্থ হয়েছে",
        description: "লগ আউট করার সময় একটি সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    try {
      const patients = await getPatients();
      const visits = await getVisits();
      const prescriptions = await getPrescriptions();
      const paymentSlips = await getPaymentSlips();
      const clinicSettings = await getClinicSettings();
      const allData: AllData = { patients, visits, prescriptions, paymentSlips, clinicSettings };
      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateSuffix = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `${APP_NAME.toLowerCase().replace(/\s+/g, '_')}_firestore_export_${dateSuffix}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "ডেটা এক্সপোর্ট সম্পন্ন", description: "Firestore থেকে সকল অ্যাপ্লিকেশন ডেটা ডাউনলোড করা হয়েছে।" });
    } catch (error) {
      console.error("Export error:", error);
      toast({ title: "এক্সপোর্ট ব্যর্থ হয়েছে", description: "ডেটা এক্সপোর্ট করা যায়নি।", variant: "destructive" });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setFileToImport(file);
    } else {
      setSelectedFileName(null);
      setFileToImport(null);
    }
  };

  const handleImportData = () => {
    if (!fileToImport) {
      toast({ title: "কোনো ফাইল নির্বাচন করা হয়নি", description: "অনুগ্রহ করে ইম্পোর্ট করার জন্য একটি JSON ফাইল নির্বাচন করুন।", variant: "destructive" });
      return;
    }
    toast({ title: "ইম্পোর্ট (Firestore)", description: "Firestore-এ ডেটা ইম্পোর্ট করার প্রক্রিয়া জটিল এবং বর্তমানে এই ডেমো অ্যাপে স্বয়ংক্রিয়ভাবে সমর্থিত নয়। ডেটা মাইগ্রেশনের জন্য বিশেষ স্ক্রিপ্ট প্রয়োজন।", variant: "default" });
    setSelectedFileName(null);
    setFileToImport(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };
  
  if (!mounted) return (
    <div className="space-y-6 animate-pulse">
      <Card className="h-24"><CardHeader><div className="h-6 bg-muted rounded w-1/3"></div><div className="h-4 bg-muted rounded w-2/3 mt-1"></div></CardHeader></Card>
      <Card><CardHeader><CardTitle className="h-5 bg-muted rounded w-1/4"></CardTitle><CardDescription className="h-4 bg-muted rounded w-1/2 mt-1"></CardDescription></CardHeader><CardContent className="h-10"></CardContent></Card>
      <Card><CardHeader><CardTitle className="h-5 bg-muted rounded w-1/4"></CardTitle><CardDescription className="h-4 bg-muted rounded w-1/2 mt-1"></CardDescription></CardHeader><CardContent className="space-y-6 h-40"></CardContent></Card>
      <Card><CardHeader><CardTitle className="h-5 bg-muted rounded w-1/4"></CardTitle></CardHeader><CardContent className="h-10"></CardContent></Card>
    </div>
  );

  const handleThemeChange = (baseTheme: string) => {
    if(isDarkMode) {
      setTheme(`${baseTheme}-dark`);
    } else {
      setTheme(baseTheme);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="সেটিংস"
        description="অ্যাপ্লিকেশন কাস্টমাইজ করুন এবং ডেটা পরিচালনা করুন।"
        actions={<SettingsIcon className="h-8 w-8 text-primary" />}
        className="bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-900/30 dark:to-gray-900/30"
      />

      <Card className="bg-card/80 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="font-headline text-lg">অ্যাপের ধরণ</CardTitle>
          <CardDescription>অ্যাপ্লিকেশনের ভিজ্যুয়াল স্টাইল পরিবর্তন করুন।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="font-semibold">অ্যাপ থিম</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {THEME_OPTIONS.map((option) => {
                 const currentBaseTheme = theme?.replace('-dark', '');
                 const isActive = currentBaseTheme === option.value;
                 return (
                    <button
                      key={option.value}
                      onClick={() => handleThemeChange(option.value)}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg border-2 transition-all duration-200 w-full sm:w-auto sm:flex-1",
                        isActive ? "border-primary bg-primary/10" : "border-transparent bg-muted/60 hover:bg-muted"
                      )}
                      aria-pressed={isActive}
                    >
                      <span className={cn("h-6 w-6 rounded-full", option.color)} />
                      <span className="font-medium text-sm">{option.label}</span>
                      {isActive && <Check className="h-5 w-5 text-primary ml-auto" />}
                    </button>
                 )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-4 border-t mt-4">
            <Switch
              id="dark-mode"
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              aria-label="Dark mode toggle"
            />
            <Label htmlFor="dark-mode">ডার্ক মোড</Label>
          </div>
        </CardContent>
      </Card>
      
      {isAdmin && (
        <Card className="bg-card/80 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="font-headline text-lg">ডেটা ম্যানেজমেন্ট (Firestore)</CardTitle>
            <CardDescription>আপনার অ্যাপ্লিকেশন ডেটা এক্সপোর্ট বা ইম্পোর্ট করুন। ইম্পোর্ট করার আগে সতর্কতা অবলম্বন করুন।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-1">ডেটা এক্সপোর্ট (Firestore থেকে)</h3>
              <p className="text-sm text-muted-foreground mb-2">আপনার সকল রোগী, ভিজিট, প্রেসক্রিপশন, এবং স্লিপ ডেটা একটি JSON ফাইল হিসেবে ডাউনলোড করুন।</p>
              <Button onClick={handleExportData} variant="outline">
                <Download className="mr-2 h-4 w-4" /> সকল ডেটা এক্সপোর্ট করুন
              </Button>
            </div>
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-1">ডেটা ইম্পোর্ট (Firestore-এ)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                পূর্বে এক্সপোর্ট করা JSON ফাইল থেকে ডেটা ইম্পোর্ট করুন। 
                <strong className="text-destructive"> এটি Firestore-এ বিদ্যমান ডেটা পরিবর্তন বা মুছে ফেলতে পারে। এই ফিচারটি সতর্কতার সাথে ব্যবহার করুন।</strong>
              </p>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="shrink-0">
                  <Upload className="mr-2 h-4 w-4" /> ফাইল নির্বাচন করুন
                </Button>
                <span className="text-sm text-muted-foreground truncate" title={selectedFileName || "কোনো ফাইল নির্বাচন করা হয়নি"}>
                  {selectedFileName || "কোনো ফাইল নির্বাচন করা হয়নি"}
                </span>
                <Input 
                  type="file" 
                  accept=".json" 
                  onChange={handleFileChange} 
                  ref={fileInputRef} 
                  className="hidden" 
                  id="import-file-input"
                />
              </div>
               {fileToImport && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="mt-3">
                      <Upload className="mr-2 h-4 w-4" /> নির্বাচিত ফাইল ইম্পোর্ট করুন (Placeholder)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center">
                          <AlertTriangle className="mr-2 h-5 w-5 text-destructive"/> ডেটা ইম্পোর্ট নিশ্চিত করুন
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                         আপনি কি &quot;{selectedFileName}&quot; থেকে ডেটা Firestore-এ ইম্পোর্ট করতে চান? এই প্রক্রিয়াটি জটিল এবং বর্তমানে এই ডেমো অ্যাপে সম্পূর্ণ স্বয়ংক্রিয়ভাবে সমর্থিত নয়। এটি শুধুমাত্র একটি প্লেসহোল্ডার।
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>বাতিল</AlertDialogCancel>
                      <AlertDialogAction onClick={handleImportData} className="bg-destructive hover:bg-destructive/90">
                        হ্যাঁ, ইম্পোর্ট করুন (Placeholder)
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/80 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="font-headline text-lg">অ্যাকাউন্ট</CardTitle>
          <CardDescription>আপনার অ্যাকাউন্ট থেকে লগ আউট করুন।</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> লগ আউট
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="font-headline text-lg">সম্পর্কিত</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="font-semibold">{APP_NAME} - রোগী ম্যানেজমেন্ট সিস্টেম</p>
          <p className="text-muted-foreground">ভার্সন {APP_VERSION}</p>
          <p className="text-muted-foreground pt-2">ডেভেলপার: ROY SHAON</p>
        </CardContent>
      </Card>
    </div>
  );
}
