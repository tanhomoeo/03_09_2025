
import React from 'react';

export default function AppLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm" role="progressbar" aria-label="লোড হচ্ছে">
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground mb-4">লোড হচ্ছে...</p>
        <div className="relative h-1 w-56 overflow-hidden rounded-full bg-primary/20">
          <div className="absolute h-full w-full animate-progress-bar rounded-full bg-primary"></div>
        </div>
      </div>
    </div>
  );
}
