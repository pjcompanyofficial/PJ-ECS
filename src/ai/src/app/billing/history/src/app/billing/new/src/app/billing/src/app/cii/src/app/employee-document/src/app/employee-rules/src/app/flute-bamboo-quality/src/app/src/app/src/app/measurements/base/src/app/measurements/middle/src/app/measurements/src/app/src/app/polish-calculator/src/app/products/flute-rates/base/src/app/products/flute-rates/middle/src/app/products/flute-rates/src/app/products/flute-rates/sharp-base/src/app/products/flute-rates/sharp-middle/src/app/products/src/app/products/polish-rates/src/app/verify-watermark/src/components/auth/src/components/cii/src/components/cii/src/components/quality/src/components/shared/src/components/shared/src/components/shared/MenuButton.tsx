import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MenuButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function MenuButton({ href, children, className }: MenuButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border border-border bg-gradient-to-r from-stone-900 to-zinc-900 p-4 text-left text-base font-medium transition-transform active:scale-[0.98] hover:border-primary/50",
        className
      )}
    >
      <span>{children}</span>
      <span className="text-primary font-bold">→</span>
    </Link>
  );
}
