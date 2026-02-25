"use client";

import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useLocalStorage } from '@/hooks/use-local-storage';
import AppHeader from '@/components/shared/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPolishRate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlusIcon, Trash2 } from 'lucide-react';

interface BillItem {
  id: number;
  qty: number;
  inch: number;
  rate: number;
}
type BillHistoryItem = { date: string; worker: string; total: number };

const billWatermark = PlaceHolderImages.find(img => img.id === 'bill-watermark');
const companyLogo = PlaceHolderImages.find(img => img.id === 'company-logo');

export default function BillGeneratorPage() {
  const billRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [worker, setWorker] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [total, setTotal] = useState(0);
  const [billDate, setBillDate] = useState('');
  const [billId, setBillId] = useState('');
  const [bills, setBills] = useLocalStorage<BillHistoryItem[]>("pjBills", []);

  useEffect(() => {
    setBillDate(new Date().toLocaleDateString());
    setBillId(String(Math.floor(1000 + Math.random() * 9000)));
  }, []);

  useEffect(() => {
    const newTotal = billItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    setTotal(newTotal);
  }, [billItems]);

  const addBillRow = () => {
    setBillItems(prev => [...prev, { id: Date.now(), qty: 1, inch: 0, rate: 0 }]);
  };

  const updateItem = (id: number, field: 'qty' | 'inch', value: number) => {
    setBillItems(prev => prev.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        if (field === 'inch') {
          newItem.rate = getPolishRate(value);
        }
        return newItem;
      }
      return item;
    }));
  };
  
  const removeItem = (id: number) => {
    setBillItems(prev => prev.filter(item => item.id !== id));
  }

  const downloadBill = () => {
    if (total === 0) {
      toast({ variant: 'destructive', title: "Cannot save empty bill", description: "Please add items first." });
      return;
    }
    if (!billRef.current) return;

    const billElement = billRef.current;
    const buttonsToHide = billElement.querySelectorAll('.delete-button');
    buttonsToHide.forEach(btn => (btn as HTMLElement).style.visibility = 'hidden');


    html2canvas(billElement, { 
        scale: 2, 
        backgroundColor: '#ffffff',
        useCORS: true,
    }).then(canvas => {
      buttonsToHide.forEach(btn => (btn as HTMLElement).style.visibility = 'visible');
      const link = document.createElement("a");
      link.download = `PJ-Official-Bill-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      // Save to history
      const newBill: BillHistoryItem = {
        date: new Date().toLocaleString(),
        worker: worker || "General",
        total: total
      };
      setBills([...bills, newBill]);

      toast({ title: "Success!", description: "Bill downloaded and saved to history." });
      
      // Reset form
      setWorker('');
      setBillItems([]);
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-slide-in">
        <div className="mx-auto grid w-full max-w-2xl items-start gap-6">
          <h2 className="text-2xl font-bold text-center text-primary">Polish Bill Generator</h2>
          
          <div ref={billRef} className="bg-white text-black p-5 rounded-lg shadow-lg relative overflow-hidden">
            {billWatermark && (
              <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-50"
                style={{ backgroundImage: `url(${billWatermark.imageUrl})` }}
              ></div>
            )}
            <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    {companyLogo && (
                      <img
                        src={companyLogo.imageUrl}
                        alt="Company Logo"
                        width={40}
                        height={40}
                        className="rounded-full"
                        crossOrigin="anonymous"
                      />
                    )}
                    <div>
                        <h3 className="text-lg font-bold tracking-wider">PJ OFFICIAL BILL</h3>
                        <p className="text-xs opacity-70 -mt-1">Official Polish Service Receipt</p>
                    </div>
                </div>
                <div className="text-right text-xs">
                    <p>Date: {billDate}</p>
                    <p>Worker ID: #{billId}</p>
                </div>
              </div>
              
              <Input 
                value={worker}
                onChange={(e) => setWorker(e.target.value)}
                placeholder="Enter Worker Name"
                className="my-2 bg-white text-black border-gray-300" 
              />
              
              <div id="billItems" className="space-y-2 mt-4">
                {billItems.map(item => (
                    <div key={item.id} className="billRow flex items-center gap-2 p-2 bg-gray-50 rounded-md border-l-4 border-primary">
                        <Input type="number" value={item.qty} onChange={e => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)} className="w-16 h-8 bg-white text-black border-gray-300" placeholder="Qty" />
                        <Input type="number" value={item.inch || ''} onChange={e => updateItem(item.id, 'inch', parseInt(e.target.value) || 0)} className="w-20 h-8 bg-white text-black border-gray-300" placeholder="Inch" />
                        <span className="flex-1 text-sm">Rate: ₹{item.rate}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive delete-button" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
              </div>

              <div className="mt-5 text-right font-bold text-xl border-t-2 border-black pt-2">
                Total Amount: ₹{total}
              </div>
            </div>
          </div>

          <Button onClick={addBillRow} variant="secondary" className="w-full">
            <PlusIcon className="mr-2 h-4 w-4" /> Add New Flute
          </Button>
          <Button onClick={downloadBill} className="w-full font-bold uppercase">Download & Save to History</Button>

        </div>
      </main>
    </div>
  );
}

