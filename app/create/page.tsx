"use client"

import type React from "react"

import { useState, useEffect } from "react"
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

export default function CreatePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const { data: user, isLoading: isLoadingUser } = useUser()
  const createPaste = useCreatePaste()
  const signInWithGoogle = useSignInWithGoogle()
  const [isSigningIn, setIsSigningIn] = useState(false)

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
    e.preventDefault()

    if (!user) {
      toast.error("You must be signed in to create a paste")
      return
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const paste = await createPaste.mutateAsync({
        title,
        content,
      })

      toast.success("Paste created successfully!")
      router.push(`/paste/${paste.id}`)
    } catch (error) {
      console.error("Error creating paste:", error)
      toast.error("Failed to create paste")
    }
  }

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
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content (Markdown supported)
                </label>
                <Textarea
                  id="content"
                  placeholder="# Your markdown content here..."
                  className="min-h-[300px] font-mono"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={createPaste.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createPaste.isPending ? "Saving..." : "Save Paste"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

