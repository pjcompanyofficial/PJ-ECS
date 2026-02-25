import AppHeader from '@/components/shared/AppHeader';
import MenuButton from '@/components/shared/MenuButton';

export default function ProductPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-slide-in">
        <div className="mx-auto grid w-full max-w-2xl items-start gap-6">
            <h2 className="text-2xl font-bold text-center text-primary">Product Details & Rate</h2>
            <div className="grid gap-3">
                <MenuButton href="/products/flute-rates">Flutes Rate</MenuButton>
                <MenuButton href="/products/polish-rates">Polishing Rate List</MenuButton>
            </div>
        </div>
      </main>
    </div>
  );
}

