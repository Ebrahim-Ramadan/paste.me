"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, LogIn } from "lucide-react"
import Link from "next/link"
import { useCreatePaste, useUser, useSignInAnonymously } from "@/lib/hooks"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CreatePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const { data: user, isLoading: isLoadingUser } = useUser()
  const createPaste = useCreatePaste()
  const signInAnonymously = useSignInAnonymously()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleSignIn = async () => {
    if (isSigningIn) return

    setIsSigningIn(true)
    try {
      await signInAnonymously.mutateAsync()
      toast.success("Anonymous account created")
    } catch (error: any) {
      console.error("Error signing in:", error)
      toast.error(error.message || "Failed to create anonymous account")
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      router.push(`/paste/${paste.id}-${paste.slug}`)
    } catch (error) {
      console.error("Error creating paste:", error)
      toast.error("Failed to create paste")
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center mb-6 text-sm font-medium text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        {!user && !isLoadingUser && (
          <Alert className="mb-6">
            <AlertTitle>Not signed in</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>You're not signed in. You can still create a paste, but you won't be able to edit it later.</p>
              <Button onClick={handleSignIn} variant="outline" className="w-fit" disabled={isSigningIn}>
                <LogIn className="mr-2 h-4 w-4" />
                {isSigningIn ? "Creating Account..." : "Create Anonymous Account"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

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

