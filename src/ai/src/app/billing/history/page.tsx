"use client";

import { useLocalStorage } from '@/hooks/use-local-storage';
import AppHeader from '@/components/shared/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

type BillHistoryItem = { date: string; worker: string; total: number };

export default function BillHistoryPage() {
  const [bills, setBills] = useLocalStorage<BillHistoryItem[]>("pjBills", []);
  const { toast } = useToast();

  const deleteBill = (index: number) => {
    const updatedBills = [...bills];
    updatedBills.splice(index, 1);
    setBills(updatedBills);
    toast({ title: "Success", description: "Bill record deleted." });
  };
  
  const reversedBills = [...bills].reverse();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-slide-in">
        <div className="mx-auto grid w-full max-w-2xl items-start gap-6">
          <h2 className="text-2xl font-bold text-center text-primary">Saved Bills</h2>
          
          <div className="grid gap-4">
            {bills.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">No Saved Bills found.</p>
                </CardContent>
              </Card>
            ) : (
                reversedBills.map((bill, i) => {
                    const originalIndex = bills.length - 1 - i;
                    return (
                        <Card key={originalIndex} className="border-l-4 border-primary">
                            <CardHeader>
                                <CardDescription>{bill.date}</CardDescription>
                                <CardTitle>Worker: {bill.worker}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-bold text-primary">Total: ₹{bill.total}</p>
                            </CardContent>
                            <CardFooter>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">Delete Record</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this bill record.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteBill(originalIndex)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

