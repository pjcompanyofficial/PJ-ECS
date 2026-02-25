import AppHeader from '@/components/shared/AppHeader';
import RateCard from '@/components/shared/RateCard';
import { baseMeasurements } from '@/lib/data';

export default function BaseMeasurePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-slide-in">
        <div className="mx-auto grid w-full max-w-2xl items-start gap-6">
            <h2 className="text-2xl font-bold text-center text-primary">Base Measurements</h2>
            <div className="grid gap-3">
                {baseMeasurements.map(item => (
                    <RateCard key={item.scale} label={item.scale} value={item.length} />
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
