"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, Edit, ExternalLink, LogIn } from "lucide-react"
import { Markdown } from "@/components/markdown"
import { usePaste, useUser, useSignInWithGoogle } from "@/lib/hooks"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import LoadingDots from "@/components/LoadingDots"

export default function PastePage() {
  const params = useParams()
  const [contentcopied, setcontentCopied] = useState(false)
  const [linkcopied, setlinkCopied] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)

  const slugParam = params?.slug as string
  const id = slugParam?.split("-")[0]

  const { data: paste, isLoading } = usePaste(id)
  const { data: user } = useUser()
  const signInWithGoogle = useSignInWithGoogle()

  const isCreator = user?.id && paste?.user_id === user.id

  const copyToClipboard = (type: "link" | "content") => () => {
    if (typeof window !== "undefined") {
      if (type === "link") {
        navigator.clipboard.writeText(window.location.href)
        setlinkCopied(true)
      setTimeout(() => setlinkCopied(false), 2000)

      }
      else {
        // @ts-ignore
        navigator.clipboard.writeText(paste.content)
        setcontentCopied(true)
        setTimeout(() => setcontentCopied(false), 2000)
      }
      toast.success(`${type} copied to clipboard`)
    }
  }

  const handleSignIn = async () => {
    if (isSigningIn) return
    setIsSigningIn(true)
    try {
      await signInWithGoogle.mutateAsync()
    } catch (error: any) {
      console.error("Error signing in:", error)
      toast.error(error.message || "Failed to sign in with Google")
      setIsSigningIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <LoadingDots />
      </div>
    )
  }

  if (!paste) {
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
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>{paste.title}</CardTitle>
              <CardDescription>
                Created {formatDistanceToNow(new Date(paste.created_at), { addSuffix: true })}
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
          <CardContent>
            <div className="prose prose-sm sm:prose max-w-none dark:prose-invert">
              <Markdown content={paste.content} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between md:flex-row flex-col gap-2">
            <div className="flex md:flex-row flex-col gap-2">
            <Button variant="outline" onClick={copyToClipboard('link')} disabled={isLoading}>
              <Copy className="mr-2 h-4 w-4" />
              {linkcopied ? "Copied!" : "Copy link"}
            </Button>
            <Button variant="outline" onClick={copyToClipboard('content')}>
              <Copy className="mr-2 h-4 w-4" />
              {contentcopied ? "Copied!" : "Copy Content"}
            </Button>
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
  )
}