
'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useVoiceInput } from '@/hooks/use-voice-input';

// Define the shape of the context data
type VoiceInputContextType = ReturnType<typeof useVoiceInput>;

// Create the context, providing a default value matching the type shape
const VoiceInputContext = createContext<VoiceInputContextType | undefined>(undefined);

// Create the provider component
export function VoiceInputProvider({ children }: { children: ReactNode }) {
  const voiceInput = useVoiceInput();

  return (
    <VoiceInputContext.Provider value={voiceInput}>
      {children}
    </VoiceInputContext.Provider>
  );
}

// Create a custom hook to use the context
export function useVoiceContext() {
  const context = useContext(VoiceInputContext);
  if (context === undefined) {
    throw new Error('useVoiceContext must be used within a VoiceInputProvider');
  }
  return context;
}
