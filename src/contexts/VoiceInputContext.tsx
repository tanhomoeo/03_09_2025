
'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useVoiceInput } from '@/hooks/use-voice-input';

type VoiceInputContextType = ReturnType<typeof useVoiceInput>;

const VoiceInputContext = createContext<VoiceInputContextType | undefined>(undefined);

export function VoiceInputProvider({ children }: { children: ReactNode }) {
  const voiceInput = useVoiceInput();

  return (
    <VoiceInputContext.Provider value={voiceInput}>
      {children}
    </VoiceInputContext.Provider>
  );
}

export function useVoiceContext() {
  const context = useContext(VoiceInputContext);
  if (context === undefined) {
    throw new Error('useVoiceContext must be used within a VoiceInputProvider');
  }
  return context;
}
