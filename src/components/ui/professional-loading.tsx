'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoaderCircle, Brain, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'brain';
  className?: string;
}

export function LoadingSpinner({ size = 'md', variant = 'default', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full bg-primary animate-pulse',
              size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className={cn('rounded-full bg-primary/20', sizeClasses[size])} />
      </div>
    );
  }

  if (variant === 'brain') {
    return (
      <div className={cn('relative', className)}>
        <Brain className={cn(sizeClasses[size], 'text-primary animate-pulse')} />
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <LoaderCircle className={cn(sizeClasses[size], 'animate-spin text-primary', className)} />
  );
}

interface AnalysisLoadingProps {
  stage?: 'parsing' | 'analyzing' | 'matching' | 'finalizing';
  message?: string;
  progress?: number;
}

export function AnalysisLoading({ stage = 'analyzing', message, progress }: AnalysisLoadingProps) {
  const stageMessages = {
    parsing: 'লক্ষণ বিশ্লেষণ করা হচ্ছে...',
    analyzing: 'রেপার্টরি অনুসন্ধান চলছে...',
    matching: 'ঔষধ মিলানো হচ্ছে...',
    finalizing: 'ফলাফল প্রস্তুত করা হচ্ছে...'
  };

  const stageIcons = {
    parsing: <Brain className="h-6 w-6 text-blue-500" />,
    analyzing: <LoaderCircle className="h-6 w-6 text-purple-500 animate-spin" />,
    matching: <RefreshCw className="h-6 w-6 text-green-500 animate-spin" />,
    finalizing: <LoaderCircle className="h-6 w-6 text-indigo-500 animate-spin" />
  };

  return (
    <Card className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          {stageIcons[stage]}
        </div>
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          AI বিশ্লেষণ চলছে
        </h3>
        <p className="text-sm text-blue-600 mb-4">
          {message || stageMessages[stage]}
        </p>
        {progress !== undefined && (
          <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <div className="flex justify-center">
          <LoadingSpinner variant="dots" />
        </div>
      </CardContent>
    </Card>
  );
}

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  variant?: 'destructive' | 'warning' | 'info';
  showRetry?: boolean;
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  variant = 'destructive', 
  showRetry = true 
}: ErrorDisplayProps) {
  const variantStyles = {
    destructive: 'from-red-50 to-pink-100 border-red-200 text-red-800',
    warning: 'from-yellow-50 to-orange-100 border-yellow-200 text-yellow-800',
    info: 'from-blue-50 to-indigo-100 border-blue-200 text-blue-800'
  };

  const iconColors = {
    destructive: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  return (
    <Card className={cn('max-w-md mx-auto bg-gradient-to-br', variantStyles[variant])}>
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className={cn('h-8 w-8', iconColors[variant])} />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {variant === 'destructive' ? 'ত্রুটি ঘটেছে' : variant === 'warning' ? 'সতর্কতা' : 'তথ্য'}
        </h3>
        <p className="text-sm mb-4 leading-relaxed">
          {error}
        </p>
        {showRetry && onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="bg-white/50 hover:bg-white/80"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            আবার চেষ্টা করুন
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface SkeletonProps {
  variant?: 'text' | 'card' | 'circle' | 'button';
  className?: string;
  count?: number;
}

export function Skeleton({ variant = 'text', className, count = 1 }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-muted rounded';
  
  const variantClasses = {
    text: 'h-4 w-full',
    card: 'h-32 w-full',
    circle: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24'
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div 
      key={i} 
      className={cn(baseClasses, variantClasses[variant], className)} 
    />
  ));

  return count === 1 ? skeletons[0] : <div className="space-y-2">{skeletons}</div>;
}

interface PageLoadingProps {
  title?: string;
  description?: string;
}

export function PageLoading({ title = 'লোড হচ্ছে...', description }: PageLoadingProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          <LoadingSpinner size="xl" variant="brain" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground text-sm">
            {description}
          </p>
        )}
        <div className="mt-6">
          <LoadingSpinner variant="dots" />
        </div>
      </div>
    </div>
  );
}
