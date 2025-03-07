"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, LogIn, Upload, Code, Link2, Quote, TextQuote } from "lucide-react";
import Link from "next/link";
import { useCreatePaste, useUser, useSignInWithGoogle } from "@/lib/hooks";
import { toast } from "sonner";
import LoadingDots from "@/components/LoadingDots";
import { supabase } from "@/lib/supabase";
import { extractImageFilenames } from "@/lib/utils";
import Image from "next/image";

export default function CreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { data: user, isLoading: isLoadingUser } = useUser();
  const createPaste = useCreatePaste();
  const signInWithGoogle = useSignInWithGoogle();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [creatingLoadingState, setcreatingLoadingState] = useState<Boolean>(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [FaileduploadingImageError, setFailedUploadingImageError] = useState(false);
  const [uploadedImageFilenamesThisSession, setUploadedImageFilenamesThisSession] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      toast.error("You must be signed in to create a paste");
      router.push("/");
    }
  }, [user, isLoadingUser, router]);

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

    const optimisticId = `${Date.now()}`;

    try {
      await createPaste.mutateAsync({ id: optimisticId, title, content });
      router.push(`/paste/${optimisticId}`);

      const imageFilenamesInContent = extractImageFilenames(content);
      console.log("Content:", content);
      console.log("Extracted filenames from content:", imageFilenamesInContent);
      console.log("Uploaded filenames this session:", uploadedImageFilenamesThisSession);

      const imagesToDelete = uploadedImageFilenamesThisSession.filter(
        (filename) => !imageFilenamesInContent.includes(filename)
      );
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
            }
          })
        );
      }

      toast.success("Paste created successfully!");
    } catch (error) {
      console.error("Error creating paste:", error);
      toast.error("Failed to create paste");
      router.push("/");
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
      // Handle text drop if no image file is found
      const text = e.dataTransfer.getData('text');
      if (text) {
        const textArea = textareaRef.current;
        if (textArea) {
          const start = textArea.selectionStart;
          const end = textArea.selectionEnd;
          const newContent = content.substring(0, start) + text + content.substring(end);
          setContent(newContent);
  
          textArea.focus();
          textArea.selectionStart = textArea.selectionEnd = start + text.length;
        }
      } else {
        toast.error("No valid image file or text dropped.");
      }
      setUploadingImage(false);
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
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}-${file.name}`; // e.g., "1741352140777-Screenshot 2025-03-04 195117.png"
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
  
      // Use the path from the response, decoded to match the extracted format
      const uploadedPath = decodeURIComponent(data.path); // Decode any encoded characters
      setUploadedImageFilenamesThisSession((prevFilenames) => [...prevFilenames, uploadedPath]);
  
      const { data: publicURL } = supabase.storage.from(bucketName).getPublicUrl(fileName);
  
      if (!publicURL?.publicUrl) {
        throw new Error("Could not generate public URL");
      }
  
      console.log("Uploaded image path:", uploadedPath);
      console.log("Public URL:", publicURL.publicUrl);
  
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
    );
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <LoadingDots />
      </div>
    );
  }

  const handleInsertCodeBlock = () => {
    if (!textareaRef.current) return;
  
    const textArea = textareaRef.current;
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const codeBlock = "```\n\n```"; // Triple backticks with a newline in between
  
    const newContent =
      content.substring(0, start) + codeBlock + content.substring(end);
    setContent(newContent);
  
    // Move the cursor inside the code block
    textArea.focus();
    textArea.selectionStart = textArea.selectionEnd = start + 4; // Place cursor between the backticks
  };
  const handleInsertLink = () => {
    if (!textareaRef.current) return;
  
    const textArea = textareaRef.current;
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const linkMarkdown = "[](url)"; // Markdown link syntax
  
    const newContent =
      content.substring(0, start) + linkMarkdown + content.substring(end);
    setContent(newContent);
  
    // Move the cursor inside the square brackets
    textArea.focus();
    textArea.selectionStart = textArea.selectionEnd = start + 1; // Place cursor inside the brackets
  };
  const handleInserQuote = () => {
    if (!textareaRef.current) return;
  
    const textArea = textareaRef.current;
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const QuoteMarkdown = "> "; // Markdown Quote syntax
  
    const newContent =
      content.substring(0, start) + QuoteMarkdown + content.substring(end);
    setContent(newContent);
  
    // Move the cursor inside the square brackets
    textArea.focus();
    textArea.selectionStart = textArea.selectionEnd = start + 1; // Place cursor inside the brackets
  };
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
                  placeholder="What is it you're sharing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className=" relative">
                <div className="w-full flex justify-between flex-col md:flex-row">
                <label htmlFor="content" className="text-sm font-medium">
                  Content (Markdown supported)
                </label>
                <div className="mt-2 mb-1 flex flex-row items-center gap-2 justify-end [&>*]:border-neutral-100 [&>*]:border-2 [&>*]:rounded-lg [&>*]:p-1 hover:[&>*]:bg-neutral-100 [&>*]:cursor-pointer">
                <div
                title="Code"
                  onClick={handleInsertCodeBlock}
                >
                  <Code size="16" /> {/* Add the Code icon */}
                </div>
                <div
                title="Link"
                  onClick={handleInsertLink}
                >
                  <Link2 size="16" /> {/* Add the Code icon */}
                </div>
                <div
                title="Qoute"
                  onClick={handleInserQuote}
                >
                  <TextQuote size="16" /> {/* Add the Code icon */}
                </div>
                </div>
                  </div>
                
                <Textarea
                  id="content"
                  placeholder="What is your paste"
                  className="min-h-[300px] font-mono"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handleImagePaste}
                  onDrop={handleImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                  required
                  ref={textareaRef}
                />
                {uploadingImage && (
                  <p className="absolute top-8 right-2">
                    <LoadingDots />
                  </p>
                )}
                {FaileduploadingImageError && (
                  <p className="text-red-500">Failed to upload Image (see console)</p>
                )}
                <div className="group text-sm text-neutral-400 flex items-center relative mt-2">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 block h-auto text-neutral-500 text-wrap flex flex-row text-xs md:text-sm items-start text-start gap-2 mr-5 leading-[1]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-1" size="16" />
                    Attach files by dragging & dropping, selecting or pasting them.
                  </Button>
                  <a href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
                  target="_blank" className="flex flex-row block select-none align-text-bottom overflow-visible absolute inset-y-0 right-0">
                  
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    className=" fill-current text-neutral-400 group-hover:text-neutral-600"
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                  >
                    <path d="M14.85 3c.63 0 1.15.52 1.14 1.15v7.7c0 .63-.51 1.15-1.15 1.15H1.15C.52 13 0 12.48 0 11.84V4.15C0 3.52.52 3 1.15 3ZM9 11V5H7L5.5 7 4 5H2v6h2V8l1.5 1.92L7 8v3Zm2.99.5L14.5 8H13V5h-2v3H9.5Z"></path>
                  </svg>
                  </a>
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
              {creatingLoadingState ? (
                <div className="w-full flex justify-center">
                  <LoadingDots />
                </div>
              ) : (
                <Button type="submit" className="w-full" disabled={createPaste.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {createPaste.isPending ? "Saving..." : "Save Paste"}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}