
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { appendFinalTranscript } from '@/lib/utils';

export const FloatingVoiceInput: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [listeningMode, setListeningMode] = useState<'click' | 'keyboard' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const activeElementRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const finalTranscriptSinceLastStartRef = useRef<string>("");
  const initialTextRef = useRef<string>("");
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isListeningRef = useRef(isListening);

  const { toast } = useToast();

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const showButton = useCallback(() => {
    clearHideTimer();
    setIsVisible(true);
  }, [clearHideTimer]);

  const startHideTimer = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      if (!isListeningRef.current) {
        setIsVisible(false);
      }
    }, 5000);
  }, [clearHideTimer]);

  const insertTextIntoActiveElement = useCallback((textToInsert: string) => {
    const element = activeElementRef.current;
    if (element) {
        const fullText = appendFinalTranscript(initialTextRef.current, textToInsert);
        const originalValueSetter = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value')?.set;
        
        if (originalValueSetter) {
            originalValueSetter.call(element, fullText);
        }
        
        const eventOptions = { bubbles: true, cancelable: true };
        element.dispatchEvent(new Event('input', eventOptions));
        element.dispatchEvent(new Event('change', eventOptions));
        element.focus();
    }
  }, []);


  const stopRecognition = useCallback(() => {
    if (speechRecognitionRef.current && isListeningRef.current) {
      speechRecognitionRef.current.stop();
    }
  }, []);
  
  const startRecognition = useCallback(async (mode: 'click' | 'keyboard') => {
    if (isListeningRef.current) return;
    
    showButton();

    if (!speechRecognitionRef.current || !isBrowserSupported) {
      toast({ title: 'ভয়েস রিকগনিশন প্রস্তুত নয়', description: 'অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন অথবা একটি সাপোর্টেড ব্রাউজার ব্যবহার করুন।', variant: 'destructive' });
      return;
    }

    activeElementRef.current = document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement
      ? document.activeElement
      : null;

    if (!activeElementRef.current) {
      toast({ title: 'ইনপুট ফিল্ড নির্বাচন করুন', description: 'ভয়েস টাইপিং শুরু করার আগে একটি টেক্সট ফিল্ডে ক্লিক করুন।', variant: "default" });
      startHideTimer();
      return;
    }
    
    finalTranscriptSinceLastStartRef.current = "";
    initialTextRef.current = activeElementRef.current.value;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      speechRecognitionRef.current.start();
      setError(null);
    } catch (permissionError: any) {
      let permErrorMessage = 'মাইক্রোফোন অ্যাক্সেস করা যায়নি।';
      if (permissionError.name === 'NotAllowedError' || permissionError.name === 'PermissionDeniedError') {
        permErrorMessage = 'মাইক্রোফোন ব্যবহারের অনুমতি দেওয়া হয়নি। ব্রাউজার সেটিংস চেক করুন।';
      } else if (permissionError.name === 'NotFoundError' || permissionError.name === 'DevicesNotFoundError') {
        permErrorMessage = 'কোনো মাইক্রোফোন খুঁজে পাওয়া যায়নি।';
      }
      setError(permErrorMessage);
      toast({ title: 'মাইক্রোফোন সমস্যা', description: permErrorMessage, variant: 'destructive' });
      setIsListening(false);
      setListeningMode(null);
      startHideTimer();
    }
  }, [isBrowserSupported, toast, showButton, startHideTimer]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsBrowserSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'bn-BD';

    recognition.onstart = () => {
        setIsListening(true);
        setListeningMode(null); // Reset listening mode on start
        showButton();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            finalTranscriptSinceLastStartRef.current = appendFinalTranscript(finalTranscriptSinceLastStartRef.current, event.results[i][0].transcript);
        } else {
            interimTranscript += event.results[i][0].transcript;
        }
      }
      insertTextIntoActiveElement(appendFinalTranscript(finalTranscriptSinceLastStartRef.current, interimTranscript));
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'একটি অজানা ভয়েস টাইপিং ত্রুটি হয়েছে।';
      if (event.error === 'no-speech') {
        errorMessage = 'কোনো কথা শোনা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'মাইক্রোফোন থেকে অডিও নিতে সমস্যা হচ্ছে।';
      } else if (event.error === 'network') {
        errorMessage = 'নেটওয়ার্ক সমস্যার কারণে ভয়েস টাইপিং ব্যর্থ হয়েছে।';
      }
      setError(errorMessage);
      toast({ title: 'ভয়েস টাইপিং ত্রুটি', description: errorMessage, variant: 'destructive', duration: 7000 });
      setIsListening(false);
      setListeningMode(null);
      startHideTimer();
    };

    recognition.onend = () => {
      setIsListening(false);
      setListeningMode(null);
      if (activeElementRef.current) {
        insertTextIntoActiveElement(finalTranscriptSinceLastStartRef.current);
      }
      finalTranscriptSinceLastStartRef.current = "";
      initialTextRef.current = "";
      startHideTimer();
    };

    speechRecognitionRef.current = recognition;

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.onstart = null;
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.abort();
      }
      clearHideTimer();
    };
  }, [toast, insertTextIntoActiveElement, startHideTimer, showButton, clearHideTimer]);

  const handleButtonClick = () => {
    if (!isBrowserSupported) return;
    if (isListening) {
      stopRecognition();
    } else {
      startRecognition('click').then(() => setListeningMode('click'));
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Control' && !event.repeat && !isListeningRef.current) {
        showButton();
        startRecognition('keyboard').then(() => setListeningMode('keyboard'));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Control' && isListeningRef.current && listeningMode === 'keyboard') {
        stopRecognition();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (listeningMode === 'keyboard' && speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }
    };
  }, [listeningMode, startRecognition, stopRecognition, showButton]); 


  if (!isBrowserSupported) {
    return null; 
  }

  const buttonTitle = isListening 
    ? (listeningMode === 'click' ? "শোনা বন্ধ করতে ক্লিক করুন" : "Control কী ছাড়ুন...")
    : (error && !isListening ? `ত্রুটি: ${error} (পুনরায় চেষ্টা করুন)` : "ভয়েস টাইপিং শুরু করতে ক্লিক করুন (অথবা Control কী ধরে রাখুন)");

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleButtonClick}
      className={cn(
        "fixed bottom-5 left-5 z-50 h-14 w-14 rounded-full shadow-xl bg-background hover:bg-muted text-primary border-2 border-primary",
        "transition-all duration-300 ease-in-out transform",
        isListening && "bg-red-500 text-white hover:bg-red-600 border-red-600 animate-pulse",
        error && !isListening && "bg-yellow-400 text-yellow-900 border-yellow-500 hover:bg-yellow-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
      title={buttonTitle}
      aria-label={isListening ? "ভয়েস ইনপুট বন্ধ করুন" : "ভয়েস ইনপুট শুরু করুন"}
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
};
