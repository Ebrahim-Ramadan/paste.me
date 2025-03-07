"use client";

import React, { lazy, Suspense, useState, memo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, ExternalLink, LogIn, Share2 } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { usePaste, useUser, useSignInWithGoogle } from "@/lib/hooks";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import LoadingDots from "@/components/LoadingDots";
import dynamic from "next/dynamic";
interface ShareModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  content: string;
  url: string;
}
const ShareModal = dynamic<ShareModalProps>(() => import("@/components/ShareModal"), {
  ssr: true, // Enable SSR
  suspense: true, // Use Suspense (Next.js 13+ recommended approach)
});


// Type definitions
interface Paste {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface User {
  id: string;
}

interface CardHeaderProps {
  paste: Paste;
  isCreator: boolean;
  user: User | null;
  isSigningIn: boolean;
  handleSignIn: () => void;
}

interface CardContentProps {
  content: string;
}

// Memoized components
const MemoizedCardHeader = memo<CardHeaderProps>(
  function CardHeaderSection({ paste, isCreator, user, isSigningIn, handleSignIn }) {
    return (
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="leading-7">
            {paste.title.length > 80 ? `${paste.title.slice(0, 80)}...` : paste.title}
          </CardTitle>
          <CardDescription className="text-neutral-600">
            created {formatDistanceToNow(new Date(paste.created_at), { addSuffix: true })}
          </CardDescription>
        </div>
        {isCreator ? (
          <a href={`/edit/${paste.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </a>
        ) : user ? null : (
          <Button variant="outline" size="sm" onClick={handleSignIn} disabled={isSigningIn}>
            <LogIn className="h-4 w-4 mr-2" />
            Sign in
          </Button>
        )}
      </CardHeader>
    );
  },
  (prevProps, nextProps) => 
    prevProps.paste.id === nextProps.paste.id && 
    prevProps.isCreator === nextProps.isCreator && 
    prevProps.isSigningIn === nextProps.isSigningIn
);

const MemoizedCardContent = memo<CardContentProps>(
  function CardContentSection({ content }) {
    return (
      <CardContent>
        <div className="prose prose-sm sm:prose max-w-none dark:prose-invert">
          <Markdown content={content} />
        </div>
      </CardContent>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

export default function PastePage() {
  const params = useParams<{ slug: string }>();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const slugParam = params?.slug;
  const id = slugParam?.split("-")[0] ?? "";

  const { data: paste, isLoading, error } = usePaste(id);
  const { data: user } = useUser();
  const signInWithGoogle = useSignInWithGoogle();

  const isCreator = !!(user?.id && paste?.user_id === user.id);

  const handleSignIn = useCallback(async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      console.time('signInWithGoogle');
      await signInWithGoogle.mutateAsync();
      console.timeEnd('signInWithGoogle');
    } catch (error: unknown) {
      console.error("Error signing in:", error);
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setIsSigningIn(false);
    }
  }, [isSigningIn, signInWithGoogle]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <LoadingDots />
      </div>
    );
  }

  if (error || !paste) {
    console.log("Error or paste not found:", error);
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Paste not found</h1>
          <p className="mb-6">The paste you're looking for doesn't exist or has been removed.</p>
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
        <Link href="/" className="inline-flex items-center mb-6 text-sm font-medium text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        <Card>
          <MemoizedCardHeader 
            paste={paste} 
            isCreator={isCreator} 
            user={user ?? null} 
            isSigningIn={isSigningIn} 
            handleSignIn={handleSignIn} 
          />
          <MemoizedCardContent content={paste.content} />
          <CardFooter className="flex justify-between md:flex-row flex-col gap-2">
            <div className="flex md:flex-row flex-col gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsShareModalOpen(true)}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Suspense fallback={<LoadingDots />}>
                <ShareModal
                  isOpen={isShareModalOpen}
                  setIsOpen={setIsShareModalOpen}
                  content={paste.content}
                  url={typeof window !== "undefined" ? window.location.href : ""}
                />
              </Suspense>
            </div>
            <Button variant="outline" asChild>
              <a href={`/raw/${paste.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View raw
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}