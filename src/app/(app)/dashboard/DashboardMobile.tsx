'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  FileText,
  BarChart3,
  PlayCircle,
  Calendar,
  Phone,
  MapPin,
  Clock,
  MessageSquareText,
  Activity,
  DollarSign,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatCurrency } from '@/lib/firestoreService';
import { ROUTES } from '@/lib/constants';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MobileDashboardProps {
  stats: {
    totalPatients: number;
    todayPatientCount: number;
    monthlyPatientCount: number;
    todayRevenue: number;
    monthlyIncome: number;
    dailyActivePatients: number;
    dailyOtherRegistered: number;
    monthlyNewPatients: number;
  };
  todaysAppointments: Array<{
    visitId: string;
    patient: { id: string; name: string; phone: string };
    patientName: string;
    diaryNumberDisplay: string;
    address: string;
    time: string;
    reason: string;
    status: 'Completed' | 'Pending';
    paymentMethod: string;
    paymentAmount: number;
    createdAt: string;
  }>;
  clientRenderedTimestamp: Date | null;
  onStartWorkflow: (patientId: string, visitId: string) => void;
}

const QuickStats = ({ stats, showRevenue, onToggleRevenue }: {
  stats: MobileDashboardProps['stats'];
  showRevenue: boolean;
  onToggleRevenue: () => void;
}) => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-100 font-medium">আজকের রোগী</p>
            <p className="text-xl font-bold text-white">
              {stats.todayPatientCount.toLocaleString('bn-BD')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto text-left flex-col items-start hover:bg-transparent"
              onClick={onToggleRevenue}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm text-green-100 font-medium">আজকের আয়</span>
                {showRevenue ? <EyeOff className="h-3 w-3 text-white" /> : <Eye className="h-3 w-3 text-white" />}
              </div>
              <p className="text-xl font-bold text-white transition-all duration-300">
                {showRevenue ? formatCurrency(stats.todayRevenue) : '• • • •'}
              </p>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const QuickActions = () => {
  const router = useRouter();

  const actions = [
    {
      title: 'নতুন রোগী',
      icon: UserPlus,
      color: 'bg-gradient-to-br from-sky-500 to-blue-600',
      hoverColor: 'hover:from-sky-600 hover:to-blue-700',
      href: ROUTES.PATIENT_ENTRY
    },
    {
      title: 'রোগী খুঁজুন',
      icon: Users,
      color: 'bg-gradient-to-br from-teal-500 to-green-600',
      hoverColor: 'hover:from-teal-600 hover:to-green-700',
      href: ROUTES.DICTIONARY
    },
    {
      title: 'AI বিশ্লেষণ',
      icon: MessageSquareText,
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      hoverColor: 'hover:from-purple-600 hover:to-indigo-700',
      href: ROUTES.AI_SUMMARY
    },
    {
      title: 'রিপোর্ট',
      icon: FileText,
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
      hoverColor: 'hover:from-orange-600 hover:to-red-700',
      href: ROUTES.DAILY_REPORT
    }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">দ্রুত কার্যক্রম</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className={cn(
              "h-24 p-4 rounded-2xl border-0 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95",
              action.color,
              action.hoverColor
            )}
            onClick={() => router.push(action.href)}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold tracking-wide">{action.title}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

const TodaysAppointments = ({
  appointments,
  onStartWorkflow
}: {
  appointments: MobileDashboardProps['todaysAppointments'];
  onStartWorkflow: (patientId: string, visitId: string) => void;
}) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">আজকের সাক্ষাৎ</h3>
      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
        {appointments.length} জন
      </Badge>
    </div>

    {appointments.length === 0 ? (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-0 shadow-md">
        <CardContent className="p-8 text-center">
          <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full w-fit mx-auto mb-4">
            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">আজকের জন্য কোন সাক্ষাৎ নেই</p>
        </CardContent>
      </Card>
    ) : (
      <div className="space-y-4">
        {appointments.map((appt) => (
          <Card key={appt.visitId} className="bg-white dark:bg-slate-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border-l-4 border-l-blue-500">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">
                    {appt.patientName}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                        <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span>ডায়েরি: {appt.diaryNumberDisplay}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                        <Clock className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span>{appt.time}</span>
                    </div>
                    {appt.address !== 'N/A' && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="p-1 bg-orange-100 dark:bg-orange-900 rounded">
                          <MapPin className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="truncate">{appt.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="p-1 bg-purple-100 dark:bg-purple-900 rounded">
                        <Phone className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span>{appt.patient.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 ml-4">
                  <Badge
                    variant={appt.status === 'Completed' ? 'default' : 'secondary'}
                    className={cn(
                      "text-xs font-semibold px-3 py-1",
                      appt.status === 'Completed'
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    )}
                  >
                    {appt.status === 'Completed' ? 'সম্পন্ন' : 'অপেক্ষমান'}
                  </Badge>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(appt.paymentAmount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {appt.paymentMethod !== 'N/A' && `পেমেন্ট: ${appt.paymentMethod}`}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStartWorkflow(appt.patient.id, appt.visitId)}
                  className="h-10 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 font-semibold"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  কার্যক্রম শুরু
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </div>
);

const MonthlyOverview = ({ stats }: { stats: MobileDashboardProps['stats'] }) => (
  <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 border-0 shadow-lg">
    <CardHeader className="pb-4">
      <CardTitle className="text-lg flex items-center gap-3 text-white">
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
          <BarChart3 className="h-6 w-6" />
        </div>
        মাসিক সারসংক্ষেপ
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 px-4 bg-white/10 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-400/30 rounded-lg">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-white">নতুন রোগী</span>
          </div>
          <span className="font-bold text-xl text-white">
            {stats.monthlyNewPatients.toLocaleString('bn-BD')}
          </span>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-white/10 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-400/30 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-white">মোট রোগী</span>
          </div>
          <span className="font-bold text-xl text-white">
            {stats.totalPatients.toLocaleString('bn-BD')}
          </span>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-white/10 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-400/30 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-white">মাসিক ভিজিট</span>
          </div>
          <span className="font-bold text-xl text-white">
            {stats.monthlyPatientCount.toLocaleString('bn-BD')}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function DashboardMobile({ 
  stats, 
  todaysAppointments, 
  clientRenderedTimestamp, 
  onStartWorkflow 
}: MobileDashboardProps) {
  const [showRevenue, setShowRevenue] = useState(false);

  const handleToggleRevenue = () => {
    setShowRevenue(!showRevenue);
    if (!showRevenue) {
      setTimeout(() => setShowRevenue(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-md opacity-30"></div>
              <div className="relative p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900">
                <Image
                  src="/icons/icon.png"
                  width={40}
                  height={40}
                  alt="Logo"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">ড্যাশবোর্ড</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">হোমিওপ্যাথিক ক্লিনিক</p>
            </div>
          </div>
          {clientRenderedTimestamp && (
            <div className="inline-block px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full shadow-md border border-blue-100 dark:border-blue-900">
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                {format(clientRenderedTimestamp, "eeee, dd MMMM yyyy", { locale: bn })}
              </p>
            </div>
          )}
        </div>

      {/* Quick Stats */}
      <QuickStats 
        stats={stats} 
        showRevenue={showRevenue} 
        onToggleRevenue={handleToggleRevenue} 
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Today's Appointments */}
      <TodaysAppointments 
        appointments={todaysAppointments} 
        onStartWorkflow={onStartWorkflow} 
      />

        {/* Monthly Overview */}
        <MonthlyOverview stats={stats} />
      </div>
    </div>
  );
}
