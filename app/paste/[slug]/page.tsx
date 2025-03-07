// PastePage.tsx (alternative approach with memoization)
"use client";

import React, { lazy, Suspense, useState, memo } from "react";
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

const ShareModal = lazy(() => import("@/components/ShareModal"));

// Memoized components to prevent re-renders
// @ts-ignore
const MemoizedCardHeader = memo(function CardHeaderSection({ paste, isCreator, user, isSigningIn, handleSignIn }) {
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
// @ts-ignore
}, (prevProps, nextProps) => prevProps.paste.id === nextProps.paste.id && prevProps.isCreator === nextProps.isCreator && prevProps.isSigningIn === nextProps.isSigningIn);
// @ts-ignore
const MemoizedCardContent = memo(function CardContentSection({ content }) {
  return (
    <CardContent>
      <div className="prose prose-sm sm:prose max-w-none dark:prose-invert">
        <Markdown content={content} />
      </div>
    </CardContent>
  );
// @ts-ignore
}, (prevProps, nextProps) => prevProps.content === nextProps.content);

export default function PastePage() {
  const params = useParams();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const slugParam = params?.slug as string;
  const id = slugParam?.split("-")[0];

  const { data: paste, isLoading, error } = usePaste(id);
  const { data: user } = useUser();
  const signInWithGoogle = useSignInWithGoogle();

  const isCreator = user?.id && paste?.user_id === user.id;

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
{/* @ts-ignore */}
          <MemoizedCardHeader paste={paste} isCreator={isCreator} user={user} isSigningIn={isSigningIn} handleSignIn={handleSignIn} />
    
{/* @ts-ignore */}
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