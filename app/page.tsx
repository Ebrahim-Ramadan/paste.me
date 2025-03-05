"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, LogIn } from "lucide-react"
import { useRecentPastes, useUser, useUserPastes, useSignInAnonymously } from "@/lib/hooks"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { useState } from "react"

export default function Home() {
  const { data: user, isLoading: isLoadingUser } = useUser()
  const { data: recentPastes = [], isLoading: isLoadingRecent } = useRecentPastes()
  const { data: userPastes = [], isLoading: isLoadingUserPastes } = useUserPastes(user?.id)
  const signInAnonymously = useSignInAnonymously()
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Remove auto sign-in to avoid rate limits

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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">JustPaste Clone</h1>
          <p className="mt-4 text-lg text-muted-foreground">Create and share text content with Markdown support</p>
          {!user && !isLoadingUser && (
            <div className="mt-6">
              <p className="mb-2 text-sm text-muted-foreground">
                Create an anonymous account to track and edit your pastes
              </p>
              <Button onClick={handleSignIn} disabled={isSigningIn}>
                <LogIn className="mr-2 h-4 w-4" />
                {isSigningIn ? "Creating Account..." : "Create Anonymous Account"}
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create a new paste</CardTitle>
              <CardDescription>Write or paste your content with Markdown support</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/create">
                <Button className="w-full" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Paste
                </Button>
              </Link>
              {!user && (
                <p className="mt-2 text-xs text-muted-foreground">Note: Create an account to edit your pastes later</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>What makes our service special</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3">
                <li className="flex items-start">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  <div>
                    <strong>No login required</strong> - Create and share content instantly
                  </div>
                </li>
                <li className="flex items-start">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  <div>
                    <strong>Markdown support</strong> - Format your content with headings, lists, code blocks, and more
                  </div>
                </li>
                <li className="flex items-start">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  <div>
                    <strong>Unique URLs</strong> - Each paste gets a unique, shareable link
                  </div>
                </li>
                <li className="flex items-start">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  <div>
                    <strong>Edit protection</strong> - Only the creator can edit their pastes
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 mt-12 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Pastes</CardTitle>
              <CardDescription>Recently created public pastes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRecent ? (
                <p className="text-muted-foreground">Loading recent pastes...</p>
              ) : recentPastes.length === 0 ? (
                <p className="text-muted-foreground">No pastes found</p>
              ) : (
                <ul className="space-y-2">
                  {recentPastes.map((paste) => (
                    <li key={paste.id} className="border-b pb-2 last:border-0">
                      <Link href={`/paste/${paste.id}-${paste.slug}`} className="block hover:underline font-medium">
                        {paste.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(paste.created_at), { addSuffix: true })}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {user && (
            <Card>
              <CardHeader>
                <CardTitle>Your Pastes</CardTitle>
                <CardDescription>Pastes you've created</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUserPastes ? (
                  <p className="text-muted-foreground">Loading your pastes...</p>
                ) : userPastes.length === 0 ? (
                  <p className="text-muted-foreground">You haven't created any pastes yet</p>
                ) : (
                  <ul className="space-y-2">
                    {userPastes.map((paste) => (
                      <li key={paste.id} className="border-b pb-2 last:border-0">
                        <Link href={`/paste/${paste.id}-${paste.slug}`} className="block hover:underline font-medium">
                          {paste.title}
                        </Link>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(paste.created_at), { addSuffix: true })}
                          </p>
                          <Link href={`/edit/${paste.id}`} className="text-xs text-primary hover:underline">
                            Edit
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

