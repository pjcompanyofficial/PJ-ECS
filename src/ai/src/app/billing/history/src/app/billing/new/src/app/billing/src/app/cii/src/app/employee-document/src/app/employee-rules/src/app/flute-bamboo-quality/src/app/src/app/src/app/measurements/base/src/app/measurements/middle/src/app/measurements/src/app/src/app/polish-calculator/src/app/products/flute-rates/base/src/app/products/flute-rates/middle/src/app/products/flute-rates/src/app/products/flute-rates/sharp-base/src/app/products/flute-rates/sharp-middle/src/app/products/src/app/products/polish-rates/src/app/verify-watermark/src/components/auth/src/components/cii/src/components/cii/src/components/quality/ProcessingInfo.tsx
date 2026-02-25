"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LockIcon, UnlockIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const CORRECT_PASSWORD = "sonu@jeet";

const processingSteps = [
    { 
        step: 1, 
        english: "The freshly cut bamboo is stored for 4-5 days.",
        hindi: "ताज़े कटे हुए बांस को 4-5 दिनों के लिए संग्रहीत किया जाता है।"
    },
    { 
        step: 2, 
        english: "On the 5th or 6th day, the bamboo is moved to a shady area to dry completely.",
        hindi: "5वें या 6वें दिन, बांस को पूरी तरह से सूखने के लिए छायादार क्षेत्र में ले जाया जाता है।"
    },
    { 
        step: 3, 
        english: "After a few days of drying, the bamboo is polished with paper. Oil is then applied thoroughly, both inside and out.",
        hindi: "कुछ दिनों तक सुखाने के बाद, बांस को कागज से पॉलिश किया जाता है। फिर अंदर और बाहर दोनों तरफ अच्छी तरह से तेल लगाया जाता है।"
    },
    { 
        step: 4, 
        english: "The oil-treated bamboo is left to cure for 5 days.",
        hindi: "तेल लगे बांस को 5 दिनों के लिए ठीक होने के लिए छोड़ दिया जाता है।"
    },
    { 
        step: 5, 
        english: "After 5 days, oil is reapplied. The bamboo is then placed in the morning sun from 7-8 AM until 10 AM.",
        hindi: "5 दिनों के बाद, तेल फिर से लगाया जाता है। फिर बांस को सुबह 7-8 बजे से सुबह 10 बजे तक सुबह की धूप में रखा जाता है।"
    },
    { 
        step: 6, 
        english: "It's brought inside, and then taken out again around 3:30-4:00 PM and left in an open area overnight under the sky.",
        hindi: "इसे अंदर लाया जाता है, और फिर लगभग 3:30-4:00 बजे फिर से बाहर निकाला जाता है और रात भर खुले क्षेत्र में आकाश के नीचे छोड़ दिया जाता है।"
    },
    { 
        step: 7, 
        english: "The next morning at 10 AM, it is brought back into the shade.",
        hindi: "अगली सुबह 10 बजे, इसे वापस छांव में लाया जाता है।"
    },
    { 
        step: 8, 
        english: "This process of sun exposure (7 AM to 10 AM) is repeated daily for 5 more days.",
        hindi: "यह धूप में रखने की प्रक्रिया (सुबह 7 बजे से 10 बजे तक) 5 और दिनों के लिए रोजाना दोहराई जाती है।"
    },
    { 
        step: 9, 
        english: "On the 6th day, the bamboo is finally ready for scale marking and hole drilling to be crafted into a flute.",
        hindi: "6वें दिन, बांस अंत में स्केल मार्किंग और छेद ड्रिलिंग के लिए तैयार होता है ताकि इसे बांसुरी में बनाया जा सके।"
    },
    {
        step: 10,
        english: "Orange and black color threading will be done, then company branding, after which the flute is ready.",
        hindi: "नारंगी और काले रंग की थ्रेडिंग की जाएगी, फिर कंपनी की ब्रांडिंग होगी, जिसके बाद बांसुरी तैयार हो जाती है।"
    }
];


export default function ProcessingInfo() {
  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handlePasswordCheck = () => {
    if (password === CORRECT_PASSWORD) {
      toast({ title: "Access Granted", description: "Viewing processing details." });
      setUnlocked(true);
      setOpen(false);
      setPassword('');
    } else {
      toast({
        variant: 'destructive',
        title: "Access Denied",
        description: "The password you entered is incorrect.",
      });
    }
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handlePasswordCheck();
    }
  };

  if (unlocked) {
    return (
        <Card className="border-accent">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <UnlockIcon className="text-accent" />
                    <CardTitle className="text-accent">Bamboo Processing Details</CardTitle>
                </div>
                <CardDescription>
                    This is the proprietary process for treating our premium bamboo.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {processingSteps.map((item) => (
                        <div key={item.step} className="flex gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold">
                                {item.step}
                            </div>
                            <div className="flex-grow">
                                <div>
                                    <h4 className="font-semibold text-base text-foreground">English</h4>
                                    <p className="text-muted-foreground text-sm mt-1">{item.english}</p>
                                </div>
                                <div className="mt-2">
                                    <h4 className="font-semibold text-base text-foreground">Hindi (हिन्दी)</h4>
                                    <p className="text-muted-foreground text-sm mt-1">{item.hindi}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <LockIcon className="text-primary"/>
                    <CardTitle>Processing Option</CardTitle>
                </div>
                <CardDescription>
                    This section is confidential. Access is restricted to the Owner and CEO only.
                </CardDescription>
            </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Secure Access</DialogTitle>
          <DialogDescription>
            This section is password protected. Enter password to view details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password-input" className="text-right">
              Password
            </Label>
            <Input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handlePasswordCheck}>Unlock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
