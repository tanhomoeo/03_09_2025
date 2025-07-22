
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

export const PageHeaderCard: React.FC<PageHeaderCardProps> = ({ title, description, actions, children, className, titleClassName, descriptionClassName }) => {
  return (
    <Card className={cn("mb-4 shadow-md border-border/20 bg-card/70 backdrop-blur-lg", className)}>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2 p-4">
        <div>
          <CardTitle className={cn("font-headline text-lg md:text-xl", titleClassName)}>{title}</CardTitle>
          {description && <CardDescription className={cn("mt-1 text-xs", descriptionClassName, "text-muted-foreground")}>{description}</CardDescription>}
        </div>
        {actions && <div className="flex items-center gap-2 self-end sm:self-center">{actions}</div>}
      </CardHeader>
      {children && <CardContent className="p-4 pt-0">{children}</CardContent>}
    </Card>
  );
};

PageHeaderCard.displayName = 'PageHeaderCard';
