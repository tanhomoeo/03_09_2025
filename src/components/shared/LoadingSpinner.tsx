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
        className={cn("fixed inset-0 bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center z-50", className)}
        role="progressbar"
        aria-label={label || 'পেজ লোড হচ্ছে'}
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="relative flex items-center justify-center">
            {showLogo ? (
              <>
                {/* Animated Ring */}
                <div className="absolute h-20 w-20 rounded-full border-4 border-blue-200/30 dark:border-blue-700/30"></div>
                <div className="absolute h-20 w-20 rounded-full border-4 border-t-blue-600 dark:border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>

                {/* Logo Container */}
                <div className="relative h-12 w-12 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center border-2 border-blue-100 dark:border-blue-900">
                  <Image
                    src="/icons/icon.png"
                    alt={`${APP_NAME} Logo`}
                    width={32}
                    height={32}
                    priority
                    className="rounded-full"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </>
            ) : (
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
            )}
          </div>
          {label && (
            <div className="text-center space-y-2">
              <p className="text-slate-600 dark:text-slate-300 font-medium">{label}</p>
              <div className="flex items-center justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1.5s'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
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
