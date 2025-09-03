'use client';

import React from 'react';
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
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  UserPlus,
  ListChecks,
  FileText,
  Settings,
  Store,
  DollarSign,
  Wand2,
  BookMarked,
  Menu,
  Truck,
} from 'lucide-react';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '../ui/button';

const mainNavItems = [
  { href: ROUTES.DASHBOARD, label: 'ড্যাশবোর্ড', icon: Home },
  { href: ROUTES.PATIENT_ENTRY, label: 'নতুন রোগী ভর্তি', icon: UserPlus },
  { href: ROUTES.DICTIONARY, label: 'রোগীর তালিকা', icon: ListChecks },
  { href: ROUTES.DAILY_REPORT, label: 'প্রতিবেদন', icon: FileText },
  { href: ROUTES.AI_SUMMARY, label: 'AI রেপার্টরি', icon: Wand2 },
  { href: ROUTES.REPERTORY_BROWSER, label: 'রেপার্টরি ব্রাউজার', icon: BookMarked },
  { href: ROUTES.COURIER, label: 'কুরিয়ার সার্ভিস', icon: Truck },
  { href: ROUTES.STORE_MANAGEMENT, label: 'ঔষধ ব্যবস্থাপনা', icon: Store },
  { href: ROUTES.PERSONAL_EXPENSES, label: 'ব্যক্তিগত খরচ', icon: DollarSign },
  { href: ROUTES.APP_SETTINGS, label: 'সেটিংস', icon: Settings },
];

const navGradients = [
  'from-sky-100 to-blue-200',
  'from-violet-100 to-indigo-200',
  'from-teal-100 to-green-200',
  'from-lime-100 to-yellow-200',
  'from-purple-100 to-fuchsia-200',
  'from-cyan-100 to-sky-200',
  'from-blue-100 to-indigo-200', // Courier
  'from-amber-100 to-orange-200',
  'from-rose-100 to-pink-200',
  'from-slate-100 to-gray-200',
];

const navIconColors = [
  'text-sky-500',
  'text-violet-500',
  'text-teal-500',
  'text-lime-600',
  'text-purple-500',
  'text-cyan-500',
  'text-blue-500', // Courier
  'text-amber-500',
  'text-rose-500',
  'text-slate-500',
];


export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile, toggleSidebar, isMobile } = useSidebar();
  const { isAdmin } = useAuth();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderNavItems = (items: typeof mainNavItems) => (
    <SidebarMenu className="gap-2">
      {items.map((item, index) => {
        const adminOnlyRoutes = [ROUTES.CLINIC_INFORMATION];
        if (adminOnlyRoutes.includes(item.href) && !isAdmin) {
          return null;
        }
        
        const isActive = pathname === item.href || (item.href !== ROUTES.DASHBOARD && pathname.startsWith(item.href));

        return (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              size="sm"
              isActive={isActive}
              tooltip={{ children: item.label, side: 'right', align: 'center' }}
              onClick={handleLinkClick}
              className={cn(
                'p-2',
                'transform-gpu will-change-transform transition-transform duration-200 ease-out group w-[96%] rounded-lg',
                'hover:brightness-105 active:shadow-inner',
                 isActive 
                  ? 'shadow-inner brightness-110'
                  : 'shadow-md bg-gradient-to-r',
                navGradients[index % navGradients.length]
              )}
            >
              <Link href={item.href} className="flex items-center w-full h-full gap-2 md:gap-3">
                  <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/80 shadow-md transition-all duration-300 group-hover:scale-105">
                    <item.icon className={cn(
                        "h-5 w-5 transition-colors duration-300",
                        navIconColors[index % navIconColors.length]
                      )} />
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-data-[collapsible=icon]:hidden text-shadow-md text-[102%]">
                      {item.label}
                  </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar side="left" variant="floating" collapsible="icon">
      <SidebarHeader className={cn("flex-col items-center pt-6 pb-4 text-center")}>
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex flex-col items-center w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          aria-label="Toggle sidebar"
        >
          <div className="p-1.5 bg-card rounded-full shadow-md inline-block mb-3">
            <div className="relative h-10 w-10">
              <Image
                src="/icons/icon.png"
                alt={`${APP_NAME} Logo`}
                fill={true}
                priority
                className="object-contain"
                sizes="(max-width: 768px) 10vw, (max-width: 1200px) 5vw, 3vw"
                data-ai-hint="logo"
              />
            </div>
          </div>
          <div className="space-y-0.5 text-center group-data-[collapsible=icon]:hidden">
              <p className="text-md font-bold whitespace-nowrap text-blue-900 dark:text-blue-300 font-headline tracking-tight">
                  {APP_NAME}
              </p>
              <p className="text-[10px] text-muted-foreground/70 font-medium whitespace-nowrap">
                  একটি আদর্শ হোমিওপ্যাথিক চিকিৎসালয়
              </p>
          </div>
        </button>
         <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-8 w-8 md:hidden" onClick={() => setOpenMobile(true)}>
            <Menu className="h-5 w-5" />
         </Button>
      </SidebarHeader>

      <ScrollArea className="flex-grow">
        <SidebarContent className="flex-grow flex flex-col justify-start px-2 md:px-4 pt-4">
          {renderNavItems(mainNavItems)}
        </SidebarContent>
      </ScrollArea>
    </Sidebar>
  );
}
