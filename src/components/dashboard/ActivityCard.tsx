import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

const ActivityCard: React.FC<ActivityCardProps> = ({ title, stats, detailsLink, icon: TitleIcon, iconColorClass, gradientClass }) => (
    <Card className={cn("h-full border-0 shadow-lg", gradientClass)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white/60 rounded-lg shadow-md backdrop-blur-sm">
            {TitleIcon && <TitleIcon className={cn("h-6 w-6", iconColorClass)} />}
          </div>
          <CardTitle className="text-base font-headline text-slate-800">{title}</CardTitle>
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
          <Link href={detailsLink} className="text-sm text-blue-800 dark:text-blue-300 font-medium hover:underline">
            বিস্তারিত দেখুন →
          </Link>
        </CardFooter>
      )}
    </Card>
);

export default React.memo(ActivityCard);
