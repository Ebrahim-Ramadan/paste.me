"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Trash, LogIn, Upload } from "lucide-react";
import Link from "next/link";
import {
  usePaste,
  useUpdatePaste,
  useDeletePaste,
  useUser,
  useSignInWithGoogle,
} from "@/lib/hooks";
import { toast } from "sonner";
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
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";  
import LoadingDots from "@/components/LoadingDots";
import { extractImageFilenames } from "@/lib/utils";

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: user, isLoading: isLoadingUser } = useUser();
  const { data: paste, isLoading: isLoadingPaste } = usePaste(id);
  const updatePaste = useUpdatePaste();
  const deletePaste = useDeletePaste();
  const signInWithGoogle = useSignInWithGoogle();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false); // Track image upload status
  const [FaileduploadingImageError, setFailedUploadingImageError] = useState(false); // Track image upload status
  const [uploadedImageFilenamesThisSession, setUploadedImageFilenamesThisSession] = useState<string[]>([]); // Track uploaded image filenames in current session
  const [updating, setupdating] = useState<Boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden file input

  useEffect(() => {
    if (paste) {
      setTitle(paste.title);
      setContent(paste.content);
    }
  }, [paste]);

  // Check if user is the creator
  const isCreator = user?.id && paste?.user_id === user.id;

  useEffect(() => {
    // If paste is loaded and user is not the creator, redirect
    if (paste && !isLoadingPaste && !isLoadingUser) {
      if (!user) {
        toast.error("You must be signed in to edit a paste");
        router.push(`/paste/${paste.id}`);
      } else if (!isCreator) {
        toast.error("You don't have permission to edit this paste");
        router.push(`/paste/${paste.id}`);
      }
    }
  }, [paste, isLoadingPaste, isLoadingUser, isCreator, router, user]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Only show confirmation if there are unsaved changes
      if (paste && (title !== paste.title || content !== paste.content)) {
        event.preventDefault();
        event.returnValue = 'Are you sure you want to leave? Changes you made may not be saved.';
        return 'Are you sure you want to leave? Changes you made may not be saved.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [paste, title, content]);

  const handleSignIn = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);
    try {
      await signInWithGoogle.mutateAsync();
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast.error(error.message || "Failed to sign in with Google");
      setIsSigningIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setupdating(true);

    if (!user) {
      toast.error("You must be signed in to update a paste");
      setupdating(false);
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      setupdating(false);
      return;
    }

    // Extract image filenames from the markdown content
    const imageFilenamesInContent = extractImageFilenames(content);
    try {
      const initialImageFilenames = paste?.content ? extractImageFilenames(paste.content) : [];

      // Identify images that were in the initial content but are now gone
      const imagesToDeleteFromPrevious = initialImageFilenames.filter(
        (filename) => !imageFilenamesInContent.includes(filename)
      );

      // Identify images from the current session that were uploaded but removed
      const imagesToDeleteFromSession = uploadedImageFilenamesThisSession.filter(
        (filename) => !imageFilenamesInContent.includes(filename)
      );

      // Concatenate arrays to get all images to delete
      const imagesToDelete = [...imagesToDeleteFromPrevious, ...imagesToDeleteFromSession];
      console.log("Images to delete:", imagesToDelete);

      if (imagesToDelete.length > 0) {
        const bucketName = process.env.NEXT_PUBLIC_supabase_bucket_name as string;
        await Promise.all(
          imagesToDelete.map(async (filename) => {
            try {
              const { error: deleteError } = await supabase.storage
                .from(bucketName)
                .remove([filename]);
              if (deleteError) {
                console.error(`Error deleting image ${filename}:`, deleteError);
                toast.error(`Error deleting image ${filename}: ${deleteError.message}`);
              } else {
                console.log(`Deleted image ${filename} from Supabase Storage`);
              }
            } catch (deleteError: any) {
              console.error(`Error deleting image ${filename}:`, deleteError);
              toast.error(`Error deleting image ${filename}: ${deleteError.message}`);
            }
          })
        );
      }

      const updatedPaste = await updatePaste.mutateAsync({
        id,
        title,
        content,
      });

      toast.success("Paste updated successfully!, redirecting...");
      router.push(`/paste/${updatedPaste.id}`);
    } catch (error) {
      console.error("Error updating paste:", error);
      toast.error("Failed to update paste");
    } finally {
      setupdating(false);
      // Clear the uploaded images in this session after successful update
      setUploadedImageFilenamesThisSession([]);
    }
  };

  const handleDelete = async () => {
    if (!user) {
      toast.error("You must be signed in to delete a paste");
      return;
    }

    try {
      await deletePaste.mutateAsync(id);
      toast.success("Paste deleted successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error deleting paste:", error);
      toast.error("Failed to delete paste");
    }
  };

  const handleImagePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const image = items.find((item) => item.type.indexOf("image") !== -1);

    if (image) {
      e.preventDefault();
      setUploadingImage(true);

      const file = image.getAsFile();
      if (file) {
        try {
          const imageUrl = await uploadImage(file);
          if (imageUrl) {
            insertMarkdownImage(imageUrl);
          }
        } catch (error: any) {
          console.error("Error handling pasted image:", error);
          toast.error(`Failed to process pasted image: ${error.message}`);
        } finally {
          setUploadingImage(false);
        }
      } else {
        setUploadingImage(false);
        toast.error("Could not read image from clipboard.");
      }
    }
  };

  const handleImageDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setUploadingImage(true);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      try {
        const imageUrl = await uploadImage(imageFile);
        if (imageUrl) {
          insertMarkdownImage(imageUrl);
        }
      } catch (error: any) {
        console.error("Error handling dropped image:", error);
        toast.error(`Failed to process dropped image: ${error.message}`);
      } finally {
        setUploadingImage(false);
      }
    } else {
      setUploadingImage(false);
      toast.error("No valid image file dropped.");
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setUploadingImage(true);
      try {
        const imageUrl = await uploadImage(file);
        if (imageUrl) {
          insertMarkdownImage(imageUrl);
        }
      } catch (error: any) {
        console.error("Error uploading image:", error);
        toast.error(`Failed to upload image: ${error.message}`);
      } finally {
        setUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
      }
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}-${file.name}`; // Generate unique filename
    const bucketName = process.env.NEXT_PUBLIC_supabase_bucket_name as string;

    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: "99600",
          upsert: false,
        });

      if (error) {
        setFailedUploadingImageError(true);
        console.log("Supabase upload error:", error);
        throw new Error(`Supabase upload error: ${error.message}`);
      }

      // Store the decoded path to match extracted filenames
      const uploadedPath = decodeURIComponent(data.path);
      setUploadedImageFilenamesThisSession((prevFilenames) => [...prevFilenames, uploadedPath]);

      const { data: publicURL } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      console.log("Public URL:", publicURL);

      if (!publicURL?.publicUrl) {
        throw new Error("Could not generate public URL");
      }

      return publicURL.publicUrl;
    } catch (error: any) {
      console.error("Supabase upload error:", error);
      toast.error(`Failed to upload image to Supabase: ${error.message}`);
      return null;
    }
  };

  const insertMarkdownImage = (imageUrl: string) => {
    if (!textareaRef.current) return;

    const textArea = textareaRef.current;
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const imageName = "image";
    const markdown = `![${imageName}](${imageUrl})`;

    const newContent = content.substring(0, start) + markdown + content.substring(end);
    setContent(newContent);

    textArea.focus();
    textArea.selectionStart = textArea.selectionEnd = start + markdown.length;
  };

  const showAlert = () => {
    const confirmNavigation = window.confirm('Are you sure you want to leave?');
    if (!confirmNavigation) {
      return false; // Prevent navigation
    }
    return true; // Allow navigation
  };

  const handleGoingBackAler = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (paste && (title !== paste.title || content !== paste.content)) {
      if (!showAlert()) {
        e.preventDefault(); // Prevent navigation if user cancels
      }
    }
  };

  // If not signed in, show sign in prompt
  if (!user && !isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center mb-6 text-sm font-medium text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Sign in Required</CardTitle>
              <CardDescription>
                You need to sign in with Google to edit pastes
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="mb-6 text-center text-muted-foreground">
                To edit and manage your pastes, please sign in with your Google
                account.
              </p>
              <Button onClick={handleSignIn} disabled={isSigningIn}>
                <LogIn className="mr-2 h-4 w-4" />
                {isSigningIn ? "Signing in..." : "Sign in with Google"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoadingPaste || isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <LoadingDots />
      </div>
    );
  }

  if (!paste) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Paste not found</h1>
          <p className="mb-6">
            The paste you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link
          onClick={handleGoingBackAler}
          href={`/paste/${paste.id}`}
          className="inline-flex items-center mb-6 text-sm font-medium text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to paste
        </Link>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Edit paste</CardTitle>
                <CardDescription>Update your paste content</CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently
                      delete your paste.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="Enter a title for your paste"
                  value={title}
                  autoFocus
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 relative">
                <label htmlFor="content" className="text-sm font-medium">
                  Content (Markdown supported)
                </label>
                <Textarea
                  id="content"
                  placeholder="# Your markdown content here..."
                  className="min-h-[300px] font-mono"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handleImagePaste}
                  onDrop={handleImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                  ref={textareaRef}
                  required
                />
                {uploadingImage && <p className="absolute top-8 right-2"><LoadingDots/></p>}
                {FaileduploadingImageError && <p className="text-red-500">Failed to upload Image (see console)</p>}
                <div className="group text-sm text-neutral-400 flex items-center relative">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 block h-auto text-neutral-500 text-wrap flex flex-row text-xs md:text-sm items-start text-start gap-2 mr-5 leading-[1]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-1" size="16" />
                    Attach files by dragging & dropping, selecting or pasting them.
                  </Button>
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    className="flex flex-row block select-none align-text-bottom overflow-visible absolute inset-y-0 right-0 fill-current text-neutral-400 group-hover:text-neutral-600"
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                  >
                    <path d="M14.85 3c.63 0 1.15.52 1.14 1.15v7.7c0 .63-.51 1.15-1.15 1.15H1.15C.52 13 0 12.48 0 11.84V4.15C0 3.52.52 3 1.15 3ZM9 11V5H7L5.5 7 4 5H2v6h2V8l1.5 1.92L7 8v3Zm2.99.5L14.5 8H13V5h-2v3H9.5Z"></path>
                  </svg>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {updating ? <div className="flex justify-center w-full"><LoadingDots/></div> :
                <Button
                  type="submit"
                  className="w-full"
                  disabled={updatePaste.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updatePaste.isPending ? "Saving..." : "Update Paste"}
                </Button>
              }
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}