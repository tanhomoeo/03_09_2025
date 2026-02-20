
'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PageHeaderCardProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const PageHeaderCard: React.FC<PageHeaderCardProps> = ({
  title,
  description,
  actions,
  children,
  className,
  titleClassName,
  descriptionClassName,
}) => {
  return (
    <Card
      className={cn(
        "sticky top-0 z-10 rounded-none border-x-0 border-t-0 shadow-sm transition-all duration-300 sm:rounded-lg sm:border",
        "bg-card/80 backdrop-blur-lg",
        className
      )}
      aria-label={`Header for ${title}`}
    >
      <CardHeader className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <CardTitle className={cn("font-headline text-lg md:text-xl", titleClassName)}>
            {title}
          </CardTitle>
          {description && (
            <CardDescription className={cn("mt-1 text-xs text-muted-foreground", descriptionClassName)}>
              {description}
            </CardDescription>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 self-end sm:self-center">{actions}</div>}
      </CardHeader>
      {children && <CardContent className="p-4 pt-0">{children}</CardContent>}
    </Card>
  );
};

PageHeaderCard.displayName = 'PageHeaderCard';
