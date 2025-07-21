
'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { parseHandwrittenForm, type HandwrittenFormOutput } from '@/ai/flows/handwritten-patient-form-parser-flow';
import Image from 'next/image';

export interface ScanPatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataExtracted: (data: HandwrittenFormOutput) => void;
}

export default function ScanPatientFormModal({ isOpen, onClose, onDataExtracted }: ScanPatientFormModalProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const getCameraPermission = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'ক্যামেরা সমর্থিত নয়',
        description: 'আপনার ব্রাউজার ক্যামেরা অ্যাক্সেস সমর্থন করে না।',
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'ক্যামেরা অ্যাক্সেস ডিনাইড',
        description: 'ফর্ম স্ক্যান করতে অনুগ্রহ করে ব্রাউজার সেটিংসে ক্যামেরা ব্যবহারের অনুমতি দিন।',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null); // Reset on open
      getCameraPermission();
    } else {
      // Stop camera stream when modal is closed
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isOpen, getCameraPermission]);
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUri);
      }
    }
  };

  const handleProcessImage = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    try {
      const result = await parseHandwrittenForm({ photoDataUri: capturedImage });
      onDataExtracted(result);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'ছবি থেকে তথ্য বের করতে একটি সমস্যা হয়েছে।';
      console.error("AI parsing error:", error);
      toast({
        variant: 'destructive',
        title: 'AI প্রসেসিং ব্যর্থ হয়েছে',
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    if (hasCameraPermission === null) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">ক্যামেরা চালু হচ্ছে...</p>
        </div>
      );
    }

    if (hasCameraPermission === false) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ক্যামেরা অ্যাক্সেস আবশ্যক</AlertTitle>
          <AlertDescription>
            এই ফিচারটি ব্যবহার করতে, অনুগ্রহ করে আপনার ব্রাউজারকে ক্যামেরা ব্যবহারের অনুমতি দিন এবং পৃষ্ঠাটি পুনরায় লোড করুন।
          </AlertDescription>
        </Alert>
      );
    }

    if (capturedImage) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground">ছবিটি যাচাই করুন এবং তথ্য প্রসেস করতে &quot;প্রসেস করুন&quot; বাটনে ক্লিক করুন।</p>
                <Image src={capturedImage} alt="Captured patient form" width={1280} height={720} className="w-full h-auto rounded-md border" />
            </div>
        );
    }

    return (
        <>
            <p className="text-sm text-center text-muted-foreground mb-2">হাতে লেখা ফর্মটি ক্যামেরার সামনে পরিষ্কারভাবে ধরে রাখুন এবং ছবি তুলুন।</p>
            <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </>
    );
  };
  
  const renderFooter = () => {
      if (capturedImage) {
          return (
              <>
                  <Button variant="outline" onClick={() => setCapturedImage(null)} disabled={isProcessing}>আবার ছবি তুলুন</Button>
                  <Button onClick={handleProcessImage} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                      {isProcessing ? 'প্রসেসিং...' : 'প্রসেস করুন'}
                  </Button>
              </>
          );
      }
      return (
          <Button onClick={handleCapture} disabled={!hasCameraPermission}>
              <Camera className="mr-2 h-4 w-4" /> ছবি তুলুন
          </Button>
      );
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <Camera className="mr-2 h-5 w-5 text-primary" />
            হাতে লেখা ফর্ম স্ক্যান করুন
          </DialogTitle>
          <DialogDescription>
            রোগীর নিবন্ধন ফর্মের ছবি তুলে স্বয়ংক্রিয়ভাবে ডেটা এন্ট্রি করুন।
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {renderContent()}
        </div>
        <DialogFooter className="pt-4">
          <DialogClose asChild><Button variant="outline" onClick={onClose}>বাতিল</Button></DialogClose>
          {renderFooter()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
