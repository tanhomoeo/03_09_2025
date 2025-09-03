
'use client';
import React from 'react';

export const DashboardSkeleton = () => (
    <div className="space-y-8 animate-pulse">
      <div className="mb-6">
        <div className="h-10 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-muted rounded w-1/2 mb-6"></div>
      </div>
      <div className="h-12 bg-muted rounded-full max-w-md mx-auto"></div>
      <div>
        <div className="h-8 bg-muted rounded w-1/3 mb-3"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-lg"></div>)}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-muted rounded-lg p-4 h-48"></div>
        ))}
      </div>
      <div className="bg-muted rounded-lg p-4">
        <div className="h-8 bg-muted-foreground/30 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted-foreground/20 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
  
DashboardSkeleton.displayName = 'DashboardSkeleton';
