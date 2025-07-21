import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  iconColorClass: string;
  gradientClass: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon: Icon, iconColorClass, href, gradientClass }) => (
  <Link href={href} className="block group">
    <Card className={cn(
        "transition-all duration-300 p-4 h-full flex flex-col items-center justify-center text-center border-0 shadow-lg group-hover:shadow-xl group-hover:-translate-y-1",
        gradientClass
      )}>
        <div className="p-3 bg-white/60 rounded-full mb-3 shadow-md backdrop-blur-sm">
          <Icon className={cn("h-7 w-7 transition-transform duration-200 group-hover:scale-110", iconColorClass)} />
        </div>
        <h3 className="text-sm font-headline font-semibold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-600 mt-1">{description}</p>
    </Card>
  </Link>
);

export default React.memo(QuickActionCard);
