'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UserPlus, Wand2, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

const navItems = [
  { href: ROUTES.DASHBOARD, label: 'হোম', icon: Home },
  { href: ROUTES.PATIENT_ENTRY, label: 'নতুন রোগী', icon: UserPlus },
  { href: ROUTES.AI_SUMMARY, label: 'AI রেপার্টরি', icon: Wand2 },
  { href: ROUTES.COURIER, label: 'কুরিয়ার', icon: Truck },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-14 bg-background/70 border-t border-border/20 backdrop-blur-md">
        <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'inline-flex flex-col items-center justify-center px-2 hover:bg-muted/50 group',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
