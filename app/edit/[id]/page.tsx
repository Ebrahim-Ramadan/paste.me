"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Trash, LogIn } from "lucide-react"
import Link from "next/link"
import { usePaste, useUpdatePaste, useDeletePaste, useUser, useSignInWithGoogle } from "@/lib/hooks"
import { toast } from "sonner"
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
} from "@/components/ui/alert-dialog"

export default function EditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const { data: user, isLoading: isLoadingUser } = useUser()
  const { data: paste, isLoading: isLoadingPaste } = usePaste(id)
  const updatePaste = useUpdatePaste()
  const deletePaste = useDeletePaste()
  const signInWithGoogle = useSignInWithGoogle()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    if (paste) {
      setTitle(paste.title)
      setContent(paste.content)
    }
  }, [paste])

  // Check if user is the creator
  const isCreator = user?.id && paste?.user_id === user.id

  useEffect(() => {
    // If paste is loaded and user is not the creator, redirect
    if (paste && !isLoadingPaste && !isLoadingUser) {
      if (!user) {
        toast.error("You must be signed in to edit a paste")
        router.push(`/paste/${paste.id}`)
      } else if (!isCreator) {
        toast.error("You don't have permission to edit this paste")
        router.push(`/paste/${paste.id}`)
      }
    }
  }, [paste, isLoadingPaste, isLoadingUser, isCreator, router, user])

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
      toast.error("You must be signed in to update a paste")
      return
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const updatedPaste = await updatePaste.mutateAsync({
        id,
        title,
        content,
      })

      toast.success("Paste updated successfully!")
      router.push(`/paste/${updatedPaste.id}`)
    } catch (error) {
      console.error("Error updating paste:", error)
      toast.error("Failed to update paste")
    }
  }

  const handleDelete = async () => {
    if (!user) {
      toast.error("You must be signed in to delete a paste")
      return
    }

    try {
      await deletePaste.mutateAsync(id)
      toast.success("Paste deleted successfully!")
      router.push("/")
    } catch (error) {
      console.error("Error deleting paste:", error)
      toast.error("Failed to delete paste")
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
              <CardDescription>You need to sign in with Google to edit pastes</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="mb-6 text-center text-muted-foreground">
                To edit and manage your pastes, please sign in with your Google account.
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

  if (isLoadingPaste || isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <p>Loading...</p>
        </div>
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
        <Link
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
                      This action cannot be undone. This will permanently delete your paste.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
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
              <Button type="submit" className="w-full" disabled={updatePaste.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updatePaste.isPending ? "Saving..." : "Update Paste"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

