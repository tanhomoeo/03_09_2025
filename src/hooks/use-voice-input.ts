'use client';
import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useToast } from './use-toast';

export function useVoiceInput() {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false); 
  const [activeElement, setActiveElement] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef<string>('');
  
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const startRecognition = useCallback(() => {
    const currentActiveElement = document.activeElement;
    if (!(currentActiveElement instanceof HTMLInputElement || currentActiveElement instanceof HTMLTextAreaElement)) {
        toast({
            title: 'ইনপুট ফিল্ড নির্বাচন করুন',
            description: 'ভয়েস টাইপিং শুরু করার আগে অনুগ্রহ করে একটি লেখার জায়গায় ক্লিক করুন।',
            variant: 'default',
        });
        return;
    }
    setActiveElement(currentActiveElement);
    
    if (recognitionRef.current) {
        transcriptRef.current = currentActiveElement.value;
        try {
          recognitionRef.current.start();
        } catch(e) {
          console.error("Error starting recognition: ", e);
          stopRecognition();
          try {
             recognitionRef.current.start();
          } catch(e2) {
             console.error("Error on second attempt to start recognition: ", e2);
             setError("ভয়েস রিকগনিশন শুরু করতে সমস্যা হয়েছে।");
          }
        }
    }
  }, [toast, stopRecognition]);

  const toggleRecognition = useCallback(() => {
     if (isListening) {
        stopRecognition();
      } else {
        startRecognition();
      }
  }, [isListening, startRecognition, stopRecognition]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const isInputFocused = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

    if (
      event.key && event.key.toLowerCase() === 'control' &&
      isInputFocused
    ) {
      event.preventDefault();
      toggleRecognition();
    }
  }, [toggleRecognition]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const SpeechRecognitionAPI = (window as unknown as { SpeechRecognition: typeof SpeechRecognition }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);

    const recognition = new SpeechRecognitionAPI() as SpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'bn-BD';
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'একটি অজানা ভয়েস টাইপিং ত্রুটি হয়েছে।';
      if (event.error === 'no-speech') errorMessage = 'কোনো কথা শোনা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।';
      else if (event.error === 'audio-capture') errorMessage = 'মাইক্রোফোন থেকে অডিও নিতে সমস্যা হচ্ছে।';
      else if (event.error === 'network') errorMessage = 'নেটওয়ার্ক সমস্যার কারণে ভয়েস টাইপিং ব্যর্থ হয়েছে।';
      else if (event.error === 'not-allowed') errorMessage = 'মাইক্রোফোন ব্যবহারের অনুমতি বাতিল করা হয়েছে।';
      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const currentActiveElement = activeElement || document.activeElement;
      if (!(currentActiveElement instanceof HTMLInputElement || currentActiveElement instanceof HTMLTextAreaElement)) {
        stopRecognition();
        return;
      }
      
      let final_transcript_chunk = '';
      let interim_transcript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript_chunk += event.results[i][0].transcript.trim() + ' ';
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }

      if(final_transcript_chunk) {
        transcriptRef.current = (transcriptRef.current ? transcriptRef.current.trim() + ' ' : '') + final_transcript_chunk.trim();
      }

      const newText = transcriptRef.current + (interim_transcript ? (transcriptRef.current ? ' ' : '') + interim_transcript.trim() : '');
      if(currentActiveElement.value !== newText) {
          currentActiveElement.value = newText;
          const inputEvent = new Event('input', { bubbles: true, cancelable: true });
          currentActiveElement.dispatchEvent(inputEvent);
      }
    };

    const handleStopEvent = () => {
      stopRecognition();
    };
    window.addEventListener('stop-voice-input', handleStopEvent);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.removeEventListener('stop-voice-input', handleStopEvent);
    };
  }, [stopRecognition, activeElement]);

  return { isListening, error, isSupported, start: startRecognition, stop: stopRecognition, toggle: toggleRecognition, activeElement };
}
