'use client';

import React, { useState, useEffect, type ReactNode, useRef, useMemo } from 'react';
import emailjs from '@emailjs/browser';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { deletionReasons } from '@/lib/data';
import { HelpCircle, CheckCircle2, XCircle, Check, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { saveOTPToFirestore, verifyOTPFromFirestore } from '@/lib/otpService';

const CORRECT_MASTER_PASSWORD = "PJ-ECC dashboard*432Hz";

const securityQuestions = [
    {
      id: 'q1',
      question: "What is the owner's birth year? (DD/MM/YYYY)",
      validate: (val: string) => {
        const cleanVal = val.toLowerCase().replace(/[\s,.-]/g, '');
        const dayMatch = cleanVal.includes('14');
        const monthMatch = cleanVal.includes('mar') || cleanVal.includes('03') || cleanVal.includes('3');
        const yearMatch = cleanVal.includes('2008');
        return dayMatch && monthMatch && yearMatch;
      }
    },
    {
      id: 'q2',
      question: "What is the company's registration city?",
      validate: (val: string) => {
        const cleanVal = val.toLowerCase().replace(/[\s,.-]/g, '');
        const cityMatch = cleanVal.includes('diglipur');
        const regionMatch = cleanVal.includes('nandaman') || cleanVal.includes('northandaman');
        return cityMatch && regionMatch;
      }
    },
    {
      id: 'q3',
      question: "Paste the company's official YouTube channel link",
      validate: (val: string) => {
        return val.trim() === 'https://www.youtube.com/@PJCompany-432';
      }
    },
];

const watermarkImage = PlaceHolderImages.find(img => img.id === 'bill-watermark');


interface SecureDeleteDialogProps {
  imageName: string;
  onDeleteConfirm: (reason: string) => void;
  trigger: ReactNode;
}

type Step = 'password' | 'reason' | 'otp' | 'questions' | 'deleting' | 'success';
type OtpSubStep = 'enter_email' | 'verify_otp';

export default function SecureDeleteDialog({ imageName, onDeleteConfirm, trigger }: SecureDeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('password');
  const [otpSubStep, setOtpSubStep] = useState<OtpSubStep>('enter_email');
  const [passwordInput, setPasswordInput] = useState('');
  const [reason, setReason] = useState("");
  const [email, setEmail] = useState("");
  const [otpInput, setOtpInput] = useState(Array(6).fill(''));
  const [questionAnswers, setQuestionAnswers] = useState(Array(securityQuestions.length).fill(''));
  const [answersStatus, setAnswersStatus] = useState<('correct' | 'incorrect' | 'neutral')[]>(Array(securityQuestions.length).fill('neutral'));
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [isStopped, setIsStopped] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const { toast } = useToast();

  const bubbles = useMemo(() => Array.from({ length: 20 }).map((_, i) => {
      const size = `${Math.random() * 20 + 5}px`;
      const left = `${Math.random() * 100}%`;
      const duration = `${Math.random() * 8 + 5}s`;
      const delay = `${Math.random() * 5}s`;
      return <span key={i} className="bubble" style={{ 
          width: size, 
          height: size, 
          left: left, 
          animationDuration: duration,
          animationDelay: delay,
      }} />;
  }), []);

  const areAllAnswersCorrect = answersStatus.every(s => s === 'correct');

  useEffect(() => {
    if (step !== 'deleting' || isStopped) return;

    const startTime = Date.now();
    const duration = 30000; // 30 seconds

    const updateProgress = () => {
        const elapsedTime = Date.now() - startTime;
        const currentProgress = Math.min((elapsedTime / duration) * 100, 100);
        setProgress(currentProgress);

        if (currentProgress >= 100) {
            onDeleteConfirm(reason);
            setStep('success');
        } else {
            timerRef.current = setTimeout(updateProgress, 50);
        }
    };

    timerRef.current = setTimeout(updateProgress, 50);

    return () => {
        if(timerRef.current) clearTimeout(timerRef.current);
    }
  }, [step, isStopped, onDeleteConfirm, reason]);

  useEffect(() => {
    if (step !== 'success') return;
    const timer = setTimeout(() => {
        handleClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [step]);


  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === '') {
        const newOtp = [...otpInput];
        newOtp[index] = value;
        setOtpInput(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.match(/\d/g);

    if (digits && digits.length > 0) {
        const newOtp = Array(6).fill('');
        const pastedDigits = digits.slice(0, 6);
        pastedDigits.forEach((digit, index) => {
            newOtp[index] = digit;
        });
        setOtpInput(newOtp);

        const focusIndex = pastedDigits.length < 6 ? pastedDigits.length : 5;
        document.getElementById(`otp-${focusIndex}`)?.focus();
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newAnswers = [...questionAnswers];
    newAnswers[index] = e.target.value;
    setQuestionAnswers(newAnswers);

    const newStatuses = [...answersStatus];
    const isCorrect = securityQuestions[index].validate(e.target.value);

    if (e.target.value === '') {
        newStatuses[index] = 'neutral';
    } else {
        newStatuses[index] = isCorrect ? 'correct' : 'incorrect';
    }
    setAnswersStatus(newStatuses);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
        setTimeout(() => {
            setStep('password');
            setOtpSubStep('enter_email');
            setPasswordInput('');
            setReason('');
            setEmail('');
            setOtpInput(Array(6).fill(''));
            setQuestionAnswers(Array(securityQuestions.length).fill(''));
            setAnswersStatus(Array(securityQuestions.length).fill('neutral'));
            setError('');
            setProgress(0);
            setIsStopped(false);
            if (timerRef.current) clearTimeout(timerRef.current);
        }, 300);
    }
  }


  const handlePasswordSubmit = () => {
    if (passwordInput === CORRECT_MASTER_PASSWORD) {
      setError("");
      setStep('reason');
    } else {
      setError("Incorrect password. Please try again.");
      setPasswordInput('');
    }
  };

  const handlePasswordKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
        handlePasswordSubmit();
    }
  };

  const handleReasonSubmit = () => {
    if (!reason) {
      setError("Please select a reason for deletion.");
      return;
    }
    setError("");
    setStep('otp');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingOtp(true);
    setError('');

    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        await saveOTPToFirestore(email, newOTP);
        console.log("Firebase: OTP saved successfully.");

        const templateParams = {
            to_email: email,
            passcode: newOTP,
        };

        await emailjs.send(
            "service_4mpzhc6",
            "template_wof8h28",
            templateParams,
            "EevqJ2-cX2wrZXXJO"
        );
        console.log("EmailJS: Email sent successfully.");

        setOtpSubStep('verify_otp');
        toast({ title: "OTP Sent!", description: `A 6-digit code has been sent to ${email}.` });

    } catch (err: any) {
        console.error("OTP Sending Failed:", err);
        
        const detailError = err.text || err.message || JSON.stringify(err);
        
        setError(detailError);
        toast({
            variant: 'destructive',
            title: "Operation Failed",
            description: detailError,
            duration: 9000,
        });
    } finally {
        setIsSendingOtp(false);
    }
};


  const handleOtpSubmit = async () => {
    const enteredOtp = otpInput.join('');
    if (enteredOtp.length !== 6) {
        setError("Please enter a 6-digit OTP.");
        return;
    }
    
    setIsVerifyingOtp(true);
    setError("");

    try {
        const isValid = await verifyOTPFromFirestore(email, enteredOtp);
        if (isValid) {
            setOtpInput(otpInput.map(() => '✔'));
            setTimeout(() => setStep('questions'), 500);
        } else {
            setError("Invalid or expired OTP. Please try again.");
            setOtpInput(Array(6).fill(''));
            document.getElementById('otp-0')?.focus();
        }
    } catch (err) {
        console.error("OTP Verification Error:", err);
        setError("An error occurred during verification. Please try again.");
    } finally {
        setIsVerifyingOtp(false);
    }
  };

  const handleQuestionsSubmit = () => {
    if (areAllAnswersCorrect) {
      setStep('deleting');
    }
  }

  const handleStopDeletion = () => {
    setIsStopped(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    handleClose();
  }

  const renderContent = () => {
    switch (step) {
      case 'password':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Secure Access Required</DialogTitle>
              <DialogDescription>
                Please enter the master password to initiate the deletion process.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password-input" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password-input"
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyDown={handlePasswordKeyPress}
                    className="col-span-3"
                    autoFocus
                  />
              </div>
              {error && <p className="text-sm text-destructive text-center pt-2">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handlePasswordSubmit}>Continue</Button>
            </DialogFooter>
          </>
        );
      case 'reason':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                You are about to delete <span className="font-semibold text-foreground">{imageName}</span>. This is irreversible. Please provide a reason.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Select onValueChange={setReason} value={reason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {deletionReasons.map((r, i) => (
                    <SelectItem key={i} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => { setError(""); setStep('password'); }}>Back</Button>
              <Button onClick={handleReasonSubmit}>Continue</Button>
            </DialogFooter>
          </>
        );
      case 'otp':
        if (otpSubStep === 'enter_email') {
          return (
            <>
              <DialogHeader>
                <DialogTitle>Email Verification</DialogTitle>
                <DialogDescription>
                  Enter your email address to receive a one-time password.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendOTP}>
                <div className="py-4 space-y-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email-input" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="col-span-3"
                      placeholder="you@example.com"
                      required
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-sm text-destructive text-center pt-2">{error}</p>}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setError(""); setStep('reason'); }}>Back</Button>
                  <Button type="submit" disabled={isSendingOtp}>
                    {isSendingOtp ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : 'Send OTP'}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )
        }
        return (
           <>
            <DialogHeader>
              <DialogTitle>OTP Verification</DialogTitle>
              <DialogDescription>
                A 6-digit code has been sent to <span className="font-semibold text-foreground">{email}</span>. Please enter it below.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <div className="flex justify-center gap-2">
                  {otpInput.map((digit, index) => (
                      <Input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          onPaste={handleOtpPaste}
                          className={cn('w-12 h-14 text-center text-2xl font-bold transition-all',
                              error ? 'border-destructive ring-destructive' : '',
                              digit === '✔' ? 'bg-green-500/20 text-green-500 border-green-500' : ''
                          )}
                          disabled={digit === '✔'}
                      />
                  ))}
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setError(""); setOtpSubStep('enter_email'); }}>Back</Button>
              <Button onClick={handleOtpSubmit} disabled={isVerifyingOtp}>
                {isVerifyingOtp ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</> : 'Verify'}
              </Button>
            </DialogFooter>
          </>
        );
    case 'questions':
        return (
            <>
                <DialogHeader>
                    <DialogTitle>Security Questions</DialogTitle>
                    <DialogDescription>
                        Please answer the following questions to proceed.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {securityQuestions.map((q, i) => (
                        <div key={q.id} className="grid gap-2">
                            <Label htmlFor={q.id} className="flex items-center gap-2 text-muted-foreground">
                                <HelpCircle className='h-4 w-4' />
                                {q.question}
                            </Label>
                            <div className="relative">
                                <Input
                                    id={q.id}
                                    value={questionAnswers[i]}
                                    onChange={(e) => handleAnswerChange(e, i)}
                                    className={cn(
                                        'pr-8',
                                        answersStatus[i] === 'incorrect' && 'border-destructive',
                                        answersStatus[i] === 'correct' && 'border-green-500'
                                    )}
                                />
                                {answersStatus[i] === 'correct' && <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />}
                                {answersStatus[i] === 'incorrect' && <XCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />}
                            </div>
                        </div>
                    ))}
                    {error && <p className="text-sm text-destructive text-center">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => { setError(""); setStep('otp'); }}>Back</Button>
                    <Button onClick={handleQuestionsSubmit} disabled={!areAllAnswersCorrect}>Verify Answers</Button>
                </DialogFooter>
            </>
        );
    case 'deleting':
        const conicGradient = `conic-gradient(hsl(var(--primary)) ${progress}%, transparent ${progress}%)`;

        return (
            <div className="w-full h-full bg-background relative flex items-center justify-center overflow-hidden">
                <DialogHeader className="sr-only">
                    <DialogTitle>Deleting Image</DialogTitle>
                    <DialogDescription>The image is being securely deleted. This process may take up to 30 seconds.</DialogDescription>
                </DialogHeader>

                <div className="liquid-container" style={{ height: `${progress}%` }}>
                    <div className="wave wave1"></div>
                    <div className="wave wave2"></div>
                    <div className="bubbles">
                        {bubbles}
                    </div>
                </div>
                
                <div className="relative z-20 flex flex-col items-center gap-6">
                    <div className="w-48 h-48 rounded-full flex items-center justify-center bg-primary/10 shadow-lg relative">
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{ background: conicGradient }}
                                              ></div>
                        <div className="relative w-[calc(100%-24px)] h-[calc(100%-24px)] bg-background rounded-full flex items-center justify-center text-4xl font-bold text-primary shadow-inner">
                            {Math.round(progress)}%
                        </div>
                    </div>
                    <Button variant="ghost" onClick={handleStopDeletion} className="text-white text-lg hover:bg-primary/10">
                        Stop
                    </Button>
                </div>

                <style jsx>{`
                    .liquid-container {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        background: hsl(var(--primary));
                        z-index: 10;
                        transition: height 0.1s linear;
                        overflow: hidden;
                    }
                    .wave {
                        position: absolute;
                        top: -100px;
                        left: 50%;
                        width: 200vw;
                        height: 100px;
                        background: hsl(var(--background));
                        border-radius: 45%;
                        transform: translateX(-50%);
                        animation: wave-anim 7s linear infinite;
                    }
                    .wave.wave2 {
                        border-radius: 40%;
                        opacity: 0.5;
                        animation: wave-anim 13s linear infinite reverse;
                    }
                    @keyframes wave-anim {
                        from { transform: translateX(-50%) rotate(0deg); }
                        to { transform: translateX(-50%) rotate(360deg); }
                    }

                    .bubbles .bubble {
                        position: absolute;
                        bottom: -100px; /* Start from below the screen */
                        background: hsl(var(--primary-foreground) / 0.15);
                        border-radius: 50%;
                        pointer-events: none;
                        animation: bubble-anim 15s linear infinite;
                    }
                    @keyframes bubble-anim {
                        0% {
                            transform: translateY(0) scale(0.1);
                            opacity: 0;
                        }
                        10% {
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(-110vh) scale(1);
                            opacity: 0;
                        }
                    }

                    /* Styles from other steps to keep */
                    @keyframes tick-in {
                        from { transform: scale(0.5); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    .tick-animate { animation: tick-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
                `}</style>
            </div>
        );
       case 'success':
        return (
            <div className="w-full h-full bg-background flex flex-col items-center justify-center gap-4 text-center">
                <DialogHeader className="sr-only">
                    <DialogTitle>Deletion Successful</DialogTitle>
                    <DialogDescription>The image has been successfully deleted.</DialogDescription>
                </DialogHeader>
                 <div className="w-48 h-48 rounded-full flex items-center justify-center bg-green-500/10 tick-animate">
                    <Check className="h-24 w-24 text-green-500" />
                 </div>
                 <h2 className="text-2xl font-bold text-foreground mt-4 tick-animate" style={{ animationDelay: '0.2s' }}>{imageName}</h2>
                 <p className="text-lg text-muted-foreground tick-animate" style={{ animationDelay: '0.3s' }}>deleting successful!</p>
            </div>
        )
    }
  }

  const isFullScreenStep = step === 'deleting' || step === 'success';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => {if(step === 'deleting') e.preventDefault()}}
        onEscapeKeyDown={(e) => {
            if (isFullScreenStep) e.preventDefault();
            else handleClose();
        }}
        className={cn(
            isFullScreenStep ? 'w-screen h-screen max-w-full rounded-none border-0 p-0' : 'sm:max-w-md'
        )}
        hideCloseButton={isFullScreenStep}
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
