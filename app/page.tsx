"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, LogIn, Edit } from "lucide-react"
import { useRecentPastes, useUser, useUserPastes, useSignInWithGoogle } from "@/lib/hooks"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { useState } from "react"

export default function Home() {
  const { data: user, isLoading: isLoadingUser } = useUser()
  // const { data: recentPastes = [], isLoading: isLoadingRecent } = useRecentPastes()
  const { data: userPastes = [], isLoading: isLoadingUserPastes } = useUserPastes(user?.id)
  const signInWithGoogle = useSignInWithGoogle()
  const [isSigningIn, setIsSigningIn] = useState(false)

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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          {!user && !isLoadingUser && (
            <div className="mt-6">
              <p className="mb-2 text-sm text-muted-foreground">Sign in with Google to create and edit pastes</p>
              <Button onClick={handleSignIn} disabled={isSigningIn}>
                <LogIn className="mr-2 h-4 w-4" />
                {isSigningIn ? "Signing in..." : "Sign in with Google"}
              </Button>
            </div>
          )}
        </div>

          <Card>
            <CardHeader>
              <CardTitle>Create a new paste</CardTitle>
              <CardDescription>Write or paste your content with Markdown support</CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <Link href="/create">
                  <Button className="w-full" size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Paste
                  </Button>
                </Link>
              ) : (
                <Button className="w-full" size="lg" onClick={handleSignIn} disabled={isSigningIn || isLoadingUser}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in to Create
                </Button>
              )}
            </CardContent>
          </Card>


        <div className="w-full">

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
                      <Link key={paste.id} href={`/paste/${paste.id}`} className="group  border-b pb-2 last:border-0 hover:bg-blue-200">
                        <p  className="block group-hover:underline font-medium">
                          {paste.title}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(paste.created_at), { addSuffix: true })}
                          </p>
                          <Link href={`/edit/${paste.id}`} className="text-xs text-primary gap-2 hover:underline flex items-center flex-row">
                          <Edit size='16' />
                            Edit
                          </Link>
                        </div>
                      </Link>
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

