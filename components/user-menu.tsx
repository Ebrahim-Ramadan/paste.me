"use client"

import { useUser, useSignOut, useSignInWithGoogle } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, LogIn } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

export function UserMenu() {
  const { data: user, isLoading } = useUser()
  const signOut = useSignOut()
  const signInWithGoogle = useSignInWithGoogle()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync()
      toast.success("Signed out successfully")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
    }
  }

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

  // If loading, show nothing
  if (isLoading) return null

  // If not signed in, show sign in button
  if (!user) {
    return (
      <Button onClick={handleSignIn} disabled={isSigningIn} size="sm">
        <LogIn className="mr-2 h-4 w-4" />
        {isSigningIn ? "Signing in..." : "Sign in"}
      </Button>
    )
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user.user_metadata?.full_name) return "U"
    return user.user_metadata.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
      <Button
            variant="ghost"
            className="h-8 w-8 rounded-full p-0 focus:ring-0 focus:ring-offset-0"
          >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || "User"} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button
            className="cursor-pointer w-full flex items-center cursor-default text-sm px-2 py-1.5 rounded-sm"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

