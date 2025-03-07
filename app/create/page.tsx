"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, LogIn } from "lucide-react"
import Link from "next/link"
import { useCreatePaste, useUser, useSignInWithGoogle } from "@/lib/hooks"
import { toast } from "sonner"
import LoadingDots from "@/components/LoadingDots"
import { supabase } from "@/lib/supabase"
import { extractImageFilenames } from "@/lib/utils"

export default function CreatePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const { data: user, isLoading: isLoadingUser } = useUser()
  const createPaste = useCreatePaste()
  const signInWithGoogle = useSignInWithGoogle()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [creatingLoadingState, setcreatingLoadingState] = useState<Boolean>(false)
  const [uploadingImage, setUploadingImage] = useState(false); // Track image upload status
  const [FaileduploadingImageError, setFailedUploadingImageError] = useState(false); // Track image upload status
  const [uploadedImageFilenamesThisSession, setUploadedImageFilenamesThisSession] = useState<string[]>([]); // Track uploaded image filenames in current session

    const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Redirect to home if not signed in
  useEffect(() => {
    if (!isLoadingUser && !user) {
      toast.error("You must be signed in to create a paste")
      router.push("/")
    }
  }, [user, isLoadingUser, router])

  const handleSignIn = async () => {
    if (isSigningIn) return

    setIsSigningIn(true)
    try {
      await signInWithGoogle.mutateAsync()
      // No need for toast here as we're redirecting to Google
    } catch (error: any) {
      console.error("Error signing in:", error)
      toast.error(error.message || "Failed to sign in with Google")
      setIsSigningIn(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setcreatingLoadingState(true);
  
    if (!user) {
      toast.error("You must be signed in to create a paste");
      setcreatingLoadingState(false);
      return;
    }
  
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      setcreatingLoadingState(false);
      return;
    }
  
    // Generate a unique optimistic ID
  const optimisticId = `${Date.now()}`;
  router.push(`/paste/${optimisticId}`); // Navigate immediately

  
    try {
      // Image cleanup (non-blocking)
    const imageFilenamesInContent = extractImageFilenames(content);
    const imagesToDelete = uploadedImageFilenamesThisSession.filter(
      (filename) => !imageFilenamesInContent.includes(filename)
    );

    if (imagesToDelete.length > 0) {
      const bucketName = process.env.NEXT_PUBLIC_supabase_bucket_name as string;
      supabase.storage.from(bucketName).remove(imagesToDelete).catch((error) => {
        console.error("Image cleanup failed:", error);
      });
    }
  
      // Create paste
      const paste = await createPaste.mutateAsync({ id: optimisticId, title, content });
  
      toast.success("Paste created successfully!");
    } catch (error) {
      console.error("Error creating paste:", error);
      toast.error("Failed to create paste");
      router.push("/"); // Navigate back on failure
    } finally {
      setcreatingLoadingState(false);
    }
  };



    const handleImagePaste = async (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items);
      const image = items.find((item) => item.type.indexOf("image") !== -1);
  
      if (image) {
        console.log('image', image);
        
        e.preventDefault();
        setUploadingImage(true); // Start uploading indicator
  
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
            setUploadingImage(false); // Stop uploading indicator
          }
        } else {
          setUploadingImage(false);
          toast.error("Could not read image from clipboard.");
        }
      }
    };
  
    const uploadImage = async (file: File): Promise<string | null> => {
      const fileName = `${Date.now()}-${file.name}`; // Generate unique filename
      const bucketName = process.env.NEXT_PUBLIC_supabase_bucket_name as string; // Replace with your bucket name
      
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: "99600", 
            upsert: false, 
          });
  
        if (error) {
          setFailedUploadingImageError(true)
          console.log('Supabase upload error:', error);
          throw new Error(`Supabase upload error: ${error.message}`);
        }
  
        // Update uploaded images array
        setUploadedImageFilenamesThisSession((prevFilenames) => [...prevFilenames, fileName]);
  
        const { data: publicURL } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);
        console.log('publicURL', publicURL);
        
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
      const imageName = "image"; // Or generate a dynamic name
      const markdown = `![${imageName}](${imageUrl})`;
  
      const newContent =
        content.substring(0, start) + markdown + content.substring(end);
  
      setContent(newContent);
  
      textArea.focus();
      textArea.selectionStart = textArea.selectionEnd = start + markdown.length;
    };
  // If not signed in, show sign in prompt
  if (!user && !isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center mb-6 text-sm font-medium text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Sign in Required</CardTitle>
              <CardDescription>You need to sign in with Google to create a paste</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="mb-6 text-center text-muted-foreground">
                To create and manage your pastes, please sign in with your Google account.
              </p>
              <Button onClick={handleSignIn} disabled={isSigningIn}>
                <LogIn className="mr-2 h-4 w-4" />
                {isSigningIn ? "Signing in..." : "Sign in with Google"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If loading, show loading state
  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <LoadingDots/>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center mb-6 text-sm font-medium text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Create a new paste</CardTitle>
              <CardDescription>Write or paste your content with Markdown support</CardDescription>
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
                  required
                  ref={textareaRef}
                />
                {uploadingImage && <p className=" absolute top-8 right-2"><LoadingDots/></p>} {/* Uploading indicator */}
                {FaileduploadingImageError && <p className="text-red-500">Failed to upload Image (see console)</p>} {/* Uploading indicator */}
              </div>
            </CardContent>
            <CardFooter>
              {creatingLoadingState? <div className="w-full flex justify-center"><LoadingDots/></div> : 
            <Button type="submit" className="w-full" disabled={createPaste.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {createPaste.isPending ? "Saving..." : "Save Paste"}
          </Button>}
              
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

