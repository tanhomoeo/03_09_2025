'use client';

import React from 'react';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ModernLoadingScreenProps {
  message?: string;
  progress?: number;
  variant?: 'splash' | 'loading' | 'minimal';
  className?: string;
}

export function ModernLoadingScreen({ 
  message = 'অ্যাপ লোড হচ্ছে...', 
  progress,
  variant = 'splash',
  className 
}: ModernLoadingScreenProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn(
        "fixed inset-0 bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center z-50",
        className
      )}>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
          </div>
          {message && (
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed inset-0 bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex flex-col items-center justify-center z-50 transition-all duration-300",
      className
    )}>
      {/* Main Content */}
      <div className="flex flex-col items-center space-y-8 px-6 max-w-sm mx-auto">
        
        {/* Logo Section */}
        <div className="relative flex items-center justify-center">
          {/* Animated Ring */}
          <div className="absolute h-24 w-24 rounded-full border-4 border-blue-200/30 dark:border-blue-700/30"></div>
          <div className="absolute h-24 w-24 rounded-full border-4 border-t-blue-600 dark:border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          
          {/* Inner Pulsing Ring */}
          <div className="absolute h-20 w-20 rounded-full bg-blue-600/10 dark:bg-blue-400/10 animate-pulse"></div>
          
          {/* Logo */}
          <div className="relative h-16 w-16 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center border-2 border-blue-100 dark:border-blue-900">
            <Image
              src="/icons/icon.png"
              alt={`${APP_NAME} Logo`}
              width={48}
              height={48}
              priority
              className="rounded-full"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* App Name */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-headline">
            {APP_NAME}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            হোমিওপ্যাথিক ক্লিনিক ম্যানেজমেন্ট
          </p>
        </div>

        {/* Loading Message */}
        {message && (
          <div className="text-center space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {message}
            </p>
            
            {/* Progress Bar */}
            {progress !== undefined && (
              <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
            
            {/* Animated Dots */}
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

      {/* Bottom Section */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          আধুনিক হোমিওপ্যাথিক সমাধান
        </p>
      </div>
    </div>
  );
}

// Alternative compact loading for in-app usage
export function CompactModernLoading({ 
  message = 'লোড হচ্ছে...',
  size = 'md'
}: {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: { container: 'h-32', logo: 'h-8 w-8', ring: 'h-12 w-12' },
    md: { container: 'h-40', logo: 'h-10 w-10', ring: 'h-16 w-16' },
    lg: { container: 'h-48', logo: 'h-12 w-12', ring: 'h-20 w-20' }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", sizes[size].container)}>
      <div className="relative flex items-center justify-center">
        <div className={cn("absolute rounded-full border-4 border-blue-200/30", sizes[size].ring)}></div>
        <div className={cn("absolute rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin", sizes[size].ring)}></div>
        
        <div className={cn("relative rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-blue-100", sizes[size].logo)}>
          <Image
            src="/icons/icon.png"
            alt="Logo"
            width={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
            height={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
            className="rounded-full"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>
      
      {message && (
        <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
          {message}
        </p>
      )}
    </div>
  );
}
