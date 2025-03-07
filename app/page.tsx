"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {  Plus, LogIn, Edit } from "lucide-react"
import {  useUser, useUserPastes, useSignInWithGoogle } from "@/lib/hooks"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { Suspense, useState } from "react"
import Image from "next/image"
import LoadingDots from "@/components/LoadingDots"

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
    <div className=" mx-auto px-4 py-12"
    >
      <div className="absolute inset-0 bg-custom-image bg-cover bg-center opacity-20 z-[-1] filter blur-custom"></div>
      <div className="max-w-4xl mx-auto space-y-8">
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
        <div className="w-full flex justify-center py-4 md:py-12">
            <Image
            src={"/logo.svg"}
            alt="Logo"  
            width={120}
            height={120}
            quality={50}
            />
            </div>
          <Card >
           
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
              <CardHeader >
                <CardTitle >Your Pastes</CardTitle>
                <CardDescription>Pastes you've created</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 p-4 md:p-6">
                {isLoadingUserPastes ? (
                  <p className="text-muted-foreground">Loading your pastes...</p>
                ) : userPastes.length === 0 ? (
                  <p className="text-muted-foreground">You haven't created any pastes yet</p>
                ) : (
                  <Suspense fallback={<LoadingDots />}>
  {userPastes.map((paste) => (
      <li
        key={paste.id}
        className="grid grid-cols-[1fr_auto] border-b pb-2 last:border-0 items-center"
      >
        <a
          href={`/paste/${paste.id}`}
          className="group hover:bg-neutral-50 p-2 block"
        >
          
          <p className="leading-[1.4] group-hover:underline normal-case font-medium hidden md:block">
          {paste.title.length > 80 ? `${paste.title.slice(0, 80)}...` : paste.title}
          </p>
          <p className="leading-[1.2] group-hover:underline normal-case font-medium block md:hidden">
          {paste.title.length > 30 ? `${paste.title.slice(0, 30)}...` : paste.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(paste.created_at), { addSuffix: true })}
          </p>
        </a>
        <a
          href={`/edit/${paste.id}`}
          className="text-xs text-primary gap-2 hover:underline flex items-center flex-row pl-4"
        >
          <Edit size="16" />
          Edit
        </a>
      </li>
    ))}
</Suspense>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

