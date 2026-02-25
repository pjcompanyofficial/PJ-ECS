'use client';

import { useState, useRef } from 'react';
import AppHeader from '@/components/shared/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@/hooks/use-local-storage';
import Image from 'next/image';
import { PlusCircle, Trash2, Download, UserPlus, FileUp } from 'lucide-react';
import SecureDeleteDialog from '@/components/cii/SecureDeleteDialog';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useEmployees, type Employee } from '@/hooks/use-employees';
import AddEmployeeForm from '@/components/cii/AddEmployeeForm';


interface CiiImage {
  id: string;
  name: string;
  dataUrl: string;
}

const initialCiiImages: CiiImage[] = PlaceHolderImages.map(img => ({
  id: img.id,
  name: img.description,
  dataUrl: img.imageUrl,
}));

export default function CIIPage() {
  const [images, setImages] = useLocalStorage<CiiImage[]>('pjCiiImages', initialCiiImages);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { employees } = useEmployees();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageData, setNewImageData] = useState<{ dataUrl: string; file: File } | null>(null);

  const [actionsOpen, setActionsOpen] = useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
title: "File too large",
          description: "Please upload an image smaller than 5MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImageData({ dataUrl: e.target?.result as string, file });
        setNewImageTitle(file.name); // Pre-fill title with file name
        setUploadDialogOpen(true);
        setActionsOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveImage = () => {
    if (!newImageData || !newImageTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Title is required",
        description: "Please provide a title for the image.",
      });
      return;
    }
    
    const newImage: CiiImage = {
        id: `cii-${Date.now()}`,
        name: newImageTitle.trim(),
        dataUrl: newImageData.dataUrl,
    };

    setImages((prevImages) => [newImage, ...prevImages]);
    toast({
        title: "Image Saved",
        description: `"${newImage.name}" has been saved to the gallery.`,
    });

    setUploadDialogOpen(false);
    setNewImageData(null);
    setNewImageTitle('');

    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleAddNewEmployee = () => {
    setActionsOpen(false);
    setAddEmployeeOpen(true);
  };

const handleDeleteImage = (id: string, reason: string) => {
    const imageToDelete = images.find(img => img.id === id);
    setImages(images.filter((image) => image.id !== id));
    toast({
      title: "Image Deleted",
      description: `"${imageToDelete?.name}" was deleted. Reason: ${reason}`,
    });
  };

  const handleDownloadImage = (image: CiiImage) => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    const fileName = image.name.includes('.') ? image.name.split('.')[0] : image.name;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
        title: "Image Downloading...",
        description: `"${image.name}" is being saved.`,
    })
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-slide-in">
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">Company Important Images</h2>
             <Dialog open={actionsOpen} onOpenChange={setActionsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <PlusCircle className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                        <DialogTitle>Actions</DialogTitle>
                        <DialogDescription>
                            What would you like to add?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4">
                        <Button variant="outline" onClick={handleUploadClick}>
                            <FileUp className="mr-2 h-4 w-4" />
                            Upload Image
                        </Button>
                        <Button variant="outline" onClick={handleAddNewEmployee}>
                           <UserPlus className="mr-2 h-4 w-4" />
                           Add New Employee
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />
          </div>

{images.length === 0 ? (
            <Card>
              <CardContent className="p-10">
                <p className="text-center text-muted-foreground">No images found. Click '+' to add new ones.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="group relative overflow-hidden shadow-lg border-2 border-transparent hover:border-primary transition-all duration-300">
                  <CardContent className="p-0">
                    <Image
                      src={image.dataUrl}
                      alt={image.name}
                      width={400}
                      height={400}
                      className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                      crossOrigin="anonymous"
                    />
                  </CardContent>
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3">
                     <p className="text-white text-sm font-semibold truncate">{image.name}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <SecureDeleteDialog 
                        imageName={image.name} 
                        onDeleteConfirm={(reason) => handleDeleteImage(image.id, reason)}
                        trigger={
                            <Button variant="destructive" size="icon" className="h-9 w-9 rounded-full shadow-md">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        }
                      />
                  </div>
                   <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full shadow-md" onClick={() => handleDownloadImage(image)}>
                        <Download className="h-4 w-4" />
                     </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-primary">Employee Records</h2>
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Current Employees</CardTitle>
                    <CardDescription>This is the list of employees used for document verification.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {employees.map(emp => (
                            <div key={emp.id} className="flex justify-between items-center p-3 rounded-lg border bg-secondary/30">
                                <div>
                                    <p className="font-semibold text-foreground">{emp.name}</p>
                                    <p className="text-sm text-muted-foreground">{emp.refNumber}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">{emp.address}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialog for adding title to new image */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Image Title</DialogTitle>
                <DialogDescription>
                    Provide a title for your image before saving it to the gallery.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {newImageData && (
                    <Image
                        src={newImageData.dataUrl}
                        alt="Upload preview"
                        width={400}
                        height={200}
                        className="rounded-md border aspect-video object-contain w-full"
                    />
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="image-title" className="text-right">
                        Title
                    </Label>
                    <Input
                        id="image-title"
                        value={newImageTitle}
                        onChange={(e) => setNewImageTitle(e.target.value)}
                        className="col-span-3"
                        autoFocus
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveImage} disabled={!newImageTitle.trim()}>Save Image</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for adding new employee */}
      <Dialog open={addEmployeeOpen} onOpenChange={setAddEmployeeOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                      Fill in the details for the new employee. This will be saved locally.
                  </DialogDescription>
              </DialogHeader>
              <AddEmployeeForm onFinished={() => setAddEmployeeOpen(false)} />
          </DialogContent>
      </Dialog>

    </div>
  );
}
