"use client";

import { useState, useRef, useEffect } from 'react';
import { performVerification } from '@/lib/verification';
import type { VerificationOutput } from '@/lib/verification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, CheckCircle, FileImage, Loader2, ShieldX, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEmployees } from '@/hooks/use-employees';

type View = 'choice' | 'camera' | 'verifying' | 'result';

export default function WatermarkVerifier() {
  const [view, setView] = useState<View>('choice');
  const [result, setResult] = useState<VerificationOutput | null>(null);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const { employees } = useEmployees();

  useEffect(() => {
    if (view === 'choice') {
      setResult(null);
    }
  }, [view]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (view === 'result' && (result?.verificationStatus === 'Blank' || result?.verificationStatus === 'Fake')) {
      timer = setTimeout(() => {
        setView('choice');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [view, result]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
        if (view === 'camera' && !stream) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Error accessing camera:', err);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings.',
                });
                setView('choice');
            }
        }
    };
    
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [view, toast]);

  const handleUseCamera = () => {
    setView('camera');
  };

  const handleVerification = async (imageUri: string) => {
    setView('verifying');
    setResult(null);
    try {
      const verificationResult = await performVerification(imageUri, employees);
      setResult(verificationResult);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "An unknown error occurred.";
      setResult({
        verificationStatus: 'Fake',
        analysisDetails: errorMsg
      });
    } finally {
      setView('result');
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video to capture full resolution
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, width, height);
      const dataUri = canvas.toDataURL('image/png');
      handleVerification(dataUri);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleVerification(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'choice':
        return (
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            <Button variant="outline" className="h-24 text-lg" onClick={handleUseCamera}>
              <Camera className="mr-3 h-8 w-8" /> Use Camera
            </Button>
            <Button variant="outline" className="h-24 text-lg" onClick={() => fileInputRef.current?.click()}>
              <FileImage className="mr-3 h-8 w-8" /> Upload from Gallery
            </Button>
            <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </CardContent>
        );

      case 'camera':
        return (
            <CardContent className="p-4 space-y-4">
                {hasCameraPermission === false && (
                     <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access. You may need to grant permission in your browser settings.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="relative w-full max-w-sm mx-auto aspect-[210/297] bg-black rounded-md overflow-hidden border">
                   <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                   <canvas ref={canvasRef} className="hidden" />
                   <div className="absolute inset-0 border-4 md:border-8 border-black/30 rounded-md box-border pointer-events-none"></div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setView('choice')} className="flex-1">Back</Button>
                    <Button onClick={handleCapture} className="flex-1" disabled={hasCameraPermission === false}>
                        <Camera className="mr-2 h-4 w-4" /> Scan Document
                    </Button>
                </div>
            </CardContent>
        );
      
      case 'verifying':
        return (
          <CardContent className="h-48 flex flex-col items-center justify-center p-6 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Authenticating Document...</p>
          </CardContent>
        );

      case 'result':
        if (result?.verificationStatus === 'Approved') {
            return (
                <CardContent className="p-6 space-y-4">
                    <div className="text-center py-8">
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <h3 className="mt-4 text-xl font-bold text-green-500">Approved</h3>
                        <p className="mt-2 text-muted-foreground">{result.analysisDetails}</p>
                    </div>
                    <p className="text-xs text-green-500 text-right w-full">Approved by PJ Authorisation</p>
                    <Button onClick={() => setView('choice')} className="w-full">Verify Another</Button>
                </CardContent>
            );
        }
        if (result?.verificationStatus === 'Fake') {
            return (
                <CardContent className="p-6 space-y-4">
                    <div className="text-center py-8">
                        <ShieldX className="mx-auto h-16 w-16 text-destructive" />
                        <h3 className="mt-4 text-xl font-bold text-destructive">FAKE COPY</h3>
                        <p className="mt-2 text-muted-foreground">{result.analysisDetails}</p>
                    </div>
                     <p className="text-xs text-red-500 font-bold text-right w-full">Unauthorised</p>
                     <Button onClick={() => setView('choice')} className="w-full">Try Again</Button>
                </CardContent>
            );
        }
        if (result?.verificationStatus === 'Blank') {
            return (
                <CardContent className="p-6 space-y-4">
                    <div className="text-center py-8 h-48 flex flex-col justify-center items-center">
                        <h3 className="text-xl font-bold text-destructive">Please fill the details first</h3>
                        <p className="mt-2 text-muted-foreground">{result.analysisDetails}</p>
                    </div>
                </CardContent>
            );
        }
        return null;

      default:
        return null;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Authenticator</CardTitle>
        <CardDescription>
            {view === 'choice' && "Select a method to verify your document."}
            {view === 'camera' && "Position your document within the frame and press scan."}
            {view === 'verifying' && "Please wait while we analyze your document."}
            {view === 'result' && "Here is your verification result."}
        </CardDescription>
      </CardHeader>
      {renderContent()}
    </Card>
  );
}
