'use client';

import { useState } from 'react';
import AppHeader from '@/components/shared/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPolishRate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface ResultItem {
  length: number;
  rate: number;
}

export default function PolishCalculatorPage() {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [total, setTotal] = useState(0);

  const calculatePolish = () => {
    const lengths = inputValue.split(/[\s,]+/).filter(x => x.trim() !== "").map(Number);
    if (lengths.length === 0) {
      setResults([]);
      setTotal(0);
      return;
    }

    const newResults = lengths.map(len => ({
      length: len,
      rate: getPolishRate(len),
    }));

    const newTotal = newResults.reduce((acc, item) => acc + item.rate, 0);

    setResults(newResults);
    setTotal(newTotal);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-slide-in">
        <div className="mx-auto grid w-full max-w-2xl items-start gap-6">
          <h2 className="text-2xl font-bold text-center text-primary">Polish Calculator</h2>
          
          <Card className="bg-card/50">
            <CardHeader>
              <Label htmlFor="lengthInput" className="text-sm text-muted-foreground">
                Enter lengths (e.g. 18, 25, 45)
              </Label>
              <Input
                id="lengthInput"
                type="text"
                placeholder="Separated by space or comma"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </CardHeader>
            <CardContent>
              <Button onClick={calculatePolish} className="w-full font-bold uppercase" variant="secondary">
                Calculate Total
              </Button>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Polish Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                {results.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-muted-foreground">
                    <span>#{index + 1} ({item.length}")</span>
                    <span>₹{item.rate}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-2">
                <Separator/>
                 <div className="mt-4 flex items-center justify-center rounded-md bg-primary/10 p-4 text-center text-lg font-bold text-primary">
                    Total: ₹{total}
                </div>
              </CardFooter>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
}
