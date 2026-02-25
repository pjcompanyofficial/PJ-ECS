import AppHeader from '@/components/shared/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Download } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const employeeDocImage = PlaceHolderImages.find(img => img.id === 'employee-document');

export default function EmployeeDocumentPage() {
    return (
        <div className="flex min-h-screen w-full flex-col">
          <AppHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-slide-in">
            <div className="mx-auto grid w-full max-w-2xl items-start gap-6">
                <h2 className="text-2xl font-bold text-center text-primary">Employee Document</h2>
                {employeeDocImage ? (
                    <Card>
                        <CardContent className="p-4">
                            <Image
                                src={employeeDocImage.imageUrl}
                                alt="Employee Document"
                                width={600}
                                height={800}
                                className="rounded-lg border border-border shadow-md w-full h-auto"
                                data-ai-hint={employeeDocImage.imageHint}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full font-bold">
                                <Link href={employeeDocImage.imageUrl} download target="_blank">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download HD
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <p className="text-center text-muted-foreground">Image not found.</p>
                )}
            </div>
          </main>
        </div>
    );
}

