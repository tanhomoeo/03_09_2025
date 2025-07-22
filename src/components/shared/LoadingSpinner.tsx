
'use client';
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';

interface LoadingSpinnerProps {
  variant?: 'page' | 'component' | 'button';
  label?: string;
  className?: string;
  showLogo?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'component',
  label,
  className,
  showLogo = false,
}) => {
  if (variant === 'page') {
    return (
      <div
        className={cn("flex h-screen w-full flex-col items-center justify-center bg-background", className)}
        role="progressbar"
        aria-label={label || 'পেজ লোড হচ্ছে'}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            {showLogo && (
              <div className="absolute h-[100px] w-[100px] rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
            )}
            {showLogo ? (
              <div className="relative h-16 w-16">
                <Image
                  src="/icons/icon.png"
                  alt={`${APP_NAME} Logo`}
                  fill={true}
                  priority
                  sizes="64px"
                  data-ai-hint="logo"
                />
              </div>
            ) : (
               <Loader2 className="h-12 w-12 animate-spin text-primary" />
            )}
          </div>
          {label && <p className="text-muted-foreground mt-2">{label}</p>}
        </div>
      </div>
    );
  }

  if (variant === 'button') {
    return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
  }
  
  // component variant
  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {label && <p className="ml-2 text-muted-foreground">{label}</p>}
    </div>
  );
};

LoadingSpinner.displayName = "LoadingSpinner";
