
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Home,
  UserPlus,
  ListChecks,
  MessageSquareText,
  FileText,
  Settings,
  Store,
  DollarSign,
} from 'lucide-react';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';


const mainNavItems = [
  { href: ROUTES.DASHBOARD, label: 'ড্যাশবোর্ড', icon: Home },
  { href: ROUTES.PATIENT_ENTRY, label: 'নতুন রোগী ভর্তি', icon: UserPlus },
  { href: ROUTES.DICTIONARY, label: 'রোগীর তালিকা', icon: ListChecks },
  { href: ROUTES.DAILY_REPORT, label: 'প্রতিবেদন', icon: FileText },
  { href: ROUTES.AI_SUMMARY, label: 'AI অভিযোগ সারাংশ', icon: MessageSquareText },
  { href: ROUTES.STORE_MANAGEMENT, label: 'ঔষধ ব্যবস্থাপনা', icon: Store },
  { href: ROUTES.PERSONAL_EXPENSES, label: 'ব্যক্তিগত খরচ', icon: DollarSign },
  { href: ROUTES.APP_SETTINGS, label: 'সেটিংস', icon: Settings },
];

const navGradients = [
  'from-sky-100 to-blue-200',
  'from-violet-100 to-indigo-200',
  'from-teal-100 to-green-200',
  'from-green-100 to-lime-200',
  'from-purple-100 to-indigo-200',
  'from-amber-100 to-orange-200',
  'from-rose-100 to-pink-200',
  'from-slate-100 to-gray-200',
];

const navIconColors = [
  'text-sky-500',
  'text-violet-500',
  'text-teal-500',
  'text-green-500',
  'text-purple-500',
  'text-amber-500',
  'text-rose-500',
  'text-slate-500',
];


export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile, toggleSidebar, state } = useSidebar();
  const { isAdmin } = useAuth();
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const renderNavItems = (items: typeof mainNavItems) => (
    <SidebarMenu className="gap-3">
      {items.map((item, index) => {
        const adminOnlyRoutes = [ROUTES.CLINIC_INFORMATION];
        if (adminOnlyRoutes.includes(item.href) && !isAdmin) {
          return null;
        }

        return (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href !== ROUTES.DASHBOARD && pathname.startsWith(item.href))}
              tooltip={{ children: item.label, side: 'right', align: 'center' }}
              onClick={() => setOpenMobile(false)}
              className={cn(
                'p-0 h-11 transition-all duration-300 ease-in-out group rounded-full shadow-neumorphic-outset hover:brightness-95 active:shadow-neumorphic-inset',
                'data-[active=true]:scale-105 data-[active=true]:shadow-neumorphic-inset'
              )}
            >
              <Link href={item.href} className="flex items-center w-full h-full rounded-full group-data-[active=true]:flex-row-reverse transition-all duration-300 group-data-[collapsible=icon]:justify-center">
                <div className="z-10 h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/80 shadow-md transition-all duration-300 group-hover:scale-110 group-data-[active=true]:scale-110 backdrop-blur-sm">
                  <item.icon className={cn(
                      "h-5 w-5 transition-colors duration-300",
                      navIconColors[index % navIconColors.length]
                    )} />
                </div>
                <div className={cn(
                  "flex-grow h-full -ml-5 pl-8 pr-4 flex items-center rounded-r-full transition-all duration-300 group-hover:brightness-105 bg-gradient-to-r group-data-[collapsible=icon]:hidden",
                  "group-data-[active=true]:ml-0 group-data-[active=true]:-mr-5 group-data-[active=true]:pl-4 group-data-[active=true]:pr-8 group-data-[active=true]:rounded-l-full group-data-[active=true]:rounded-r-none",
                  navGradients[index % navGradients.length],
                  "group-data-[active=true]:brightness-110"
                )}>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {item.label}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className={cn("p-4 flex flex-col items-center gap-4 text-center relative")}>
        <div
          onClick={toggleSidebar}
          className="cursor-pointer"
          title={state === 'expanded' ? 'সাইডবার ছোট করুন' : 'সাইডবার বড় করুন'}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') toggleSidebar()}}
        >
          <Link 
            href={ROUTES.DASHBOARD} 
            className="flex flex-col items-center gap-3 text-center"
            onClick={(e) => { if (state === 'expanded') e.preventDefault(); }}
          >
              <div className="p-3 bg-card rounded-full shadow-neumorphic-outset group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
                  <Image
                  src="/icons/icon.png"
                  alt={`${APP_NAME} Logo`}
                  width={48}
                  height={48}
                  priority
                  className="object-contain transition-all group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
                  data-ai-hint="clinic health logo"
                  />
              </div>
              <div className="space-y-0.5 group-data-[collapsible=icon]:hidden">
                  <p className="text-lg font-bold whitespace-nowrap text-blue-900 dark:text-blue-300 font-headline tracking-tight text-shadow-3d">
                  {APP_NAME}
                  </p>
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                  একটি আদর্শ হোমিওপ্যাথিক চিকিৎসালয়
                  </p>
              </div>
          </Link>
        </div>
        <SidebarTrigger className="absolute top-3 right-3 h-7 w-7 md:hidden" />
      </SidebarHeader>

      <SidebarContent className="flex-grow px-4 space-y-4 py-2">
        {renderNavItems(mainNavItems)}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border flex items-center justify-center h-16 group-data-[collapsible=icon]:p-2">
        <div className="text-center text-xs text-blue-900/80 dark:text-blue-300/80 font-semibold group-data-[collapsible=icon]:hidden">
          {year && <p>&copy; {year} Developed by ROY SHAON</p>}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
