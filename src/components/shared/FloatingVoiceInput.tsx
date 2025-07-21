
'use client';
import React from 'react';
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
    start,
    stop,
    activeElement,
  } = useVoiceContext();

  const handleButtonClick = () => {
    if (isListening) {
      stop();
    } else {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        start();
      } else {
        toast({
          title: 'ইনপুট ফিল্ড নির্বাচন করুন',
          description:
            'ভয়েস টাইপিং শুরু করার আগে অনুগ্রহ করে একটি লেখার জায়গায় ক্লিক করুন।',
          variant: 'default',
        });
      }
    }
  };
  
  React.useEffect(() => {
     if (isListening && !activeElement) {
        stop();
     }
  }, [isListening, activeElement, stop]);

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
      onClick={handleButtonClick}
      className={cn(
        'fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-xl bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-800 border-2 border-blue-300 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-200 dark:border-blue-700',
        'transition-all duration-300 ease-in-out transform hover:-translate-y-px hover:shadow-2xl',
        isListening &&
          'bg-red-500 text-white hover:bg-red-600 border-red-600 animate-pulse',
        error &&
          !isListening &&
          'bg-yellow-400 text-yellow-900 border-yellow-500 hover:bg-yellow-500',
      )}
      title={buttonTitle}
      aria-label={
        isListening ? 'ভয়েস ইনপুট বন্ধ করুন' : 'ভয়েস ইনপুট শুরু করুন'
      }
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
