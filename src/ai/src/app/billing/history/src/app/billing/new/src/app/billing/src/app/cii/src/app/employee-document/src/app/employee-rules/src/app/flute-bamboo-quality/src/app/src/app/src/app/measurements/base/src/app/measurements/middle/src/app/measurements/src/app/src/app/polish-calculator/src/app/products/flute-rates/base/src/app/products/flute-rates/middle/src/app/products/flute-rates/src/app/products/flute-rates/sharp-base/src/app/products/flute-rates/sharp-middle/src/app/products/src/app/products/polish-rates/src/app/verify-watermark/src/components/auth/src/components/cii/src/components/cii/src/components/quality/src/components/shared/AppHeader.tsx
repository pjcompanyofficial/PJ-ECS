"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      {!isHomePage && (
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 text-primary">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
      )}
      <div className="flex-1">
        <h1 className={`text-2xl font-bold tracking-wider bg-gradient-to-r from-primary via-orange-400 to-yellow-500 bg-clip-text text-transparent ${isHomePage ? 'text-center' : ''}`}>
          PJ Official Dashboard
        </h1>
      </div>
      {!isHomePage && <div className="w-8"></div>}
    </header>
  );
}
