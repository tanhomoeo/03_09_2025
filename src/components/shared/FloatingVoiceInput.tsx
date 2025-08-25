
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { useVoiceContext } from '@/contexts/VoiceInputContext';

export function FloatingVoiceInput() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const {
    isListening,
    error,
    isSupported,
    toggle,
    activeElement,
  } = useVoiceContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        setIsVisible(true);
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      if (!isListening && (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        // Use a short delay to allow clicking on the button itself without it disappearing
        setTimeout(() => {
          // Check if the new active element is the button itself
          if (document.activeElement?.closest('.floating-voice-btn') === null) {
             setIsVisible(false);
          }
        }, 200);
      }
    };
    
    document.body.addEventListener('focusin', handleFocusIn);
    document.body.addEventListener('focusout', handleFocusOut);

    return () => {
      document.body.removeEventListener('focusin', handleFocusIn);
      document.body.removeEventListener('focusout', handleFocusOut);
    };
  }, [isListening]);
  
  useEffect(() => {
     // If recognition is active but there is no focused text element, stop it.
     if (isListening && !activeElement) {
        toggle();
     }
  }, [isListening, activeElement, toggle]);

  if (!isSupported || isMobile) {
    return null;
  }

  const buttonTitle = isListening
    ? "শোনা বন্ধ করতে ক্লিক করুন অথবা 'V' চাপুন"
    : "ভয়েস টাইপিং শুরু করতে ক্লিক করুন অথবা 'V' চাপুন";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      className={cn(
        'fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-xl bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-800 border-2 border-blue-300 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-200 dark:border-blue-700',
        'transition-all duration-300 ease-in-out transform hover:-translate-y-px hover:shadow-2xl',
        isListening &&
          'bg-red-500 text-white hover:bg-red-600 border-red-600 animate-pulse',
        error &&
          !isListening &&
          'bg-yellow-400 text-yellow-900 border-yellow-500 hover:bg-yellow-500',
        'data-[state=visible]:animate-in data-[state=visible]:fade-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out',
        'floating-voice-btn'
      )}
      title={buttonTitle}
      aria-label={
        isListening ? 'ভয়েস ইনপুট বন্ধ করুন' : 'ভয়েস ইনপুট শুরু করুন'
      }
      data-state={isVisible || isListening ? 'visible' : 'hidden'}
    >
      {isListening ? (
        <Loader2 className="h-7 w-7 animate-spin" />
      ) : error && !isListening ? (
        <AlertCircle className="h-7 w-7" />
      ) : (
        <Mic className="h-6 w-6" />
      )}
    </Button>
  );
}
