'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PageHeaderCardProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode; // For content within the card
  className?: string; // Applied to root Card
  wrapperClassName?: string; // Merged with className for root Card
  titleClassName?: string; // New: For CardTitle
  descriptionClassName?: string; // New: For CardDescription
}

const PageHeaderCardComponent: React.FC<PageHeaderCardProps> = ({ title, description, actions, children, className, wrapperClassName, titleClassName, descriptionClassName }) => {
  return (
    <Card className={cn("mb-6 shadow-sm", wrapperClassName, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className={cn("font-headline text-2xl md:text-3xl", titleClassName || "text-primary")}>{title}</CardTitle>
          {description && <CardDescription className={cn("text-sm", descriptionClassName || "text-muted-foreground")}>{description}</CardDescription>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}

PageHeaderCardComponent.displayName = 'PageHeaderCard';
export const PageHeaderCard = React.memo(PageHeaderCardComponent);
