"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {  Plus, LogIn, Edit, Trash2, ArrowBigRight, ArrowBigLeft, ArrowBigLeftDash, ArrowBigDown, ArrowDownAZ, ArrowDownCircleIcon, ArrowRightCircleIcon, ArrowLeftCircleIcon } from "lucide-react"
import {  useUser, useUserPastes, useSignInWithGoogle, useDeletePaste } from "@/lib/hooks"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { Suspense, useState } from "react"
import Image from "next/image"
import LoadingDots from "@/components/LoadingDots"
import { CardFooter } from "@/components/card"

export default function Home() {
  const { data: user, isLoading: isLoadingUser } = useUser()

  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 5 // Number of pastes per page
  // @ts-ignore
  const { data: userPastes =  { data: [], count: 0 }, isLoading: isLoadingUserPastes } = useUserPastes(user?.id, currentPage, pageSize)
  const signInWithGoogle = useSignInWithGoogle()
    const deletePaste = useDeletePaste();
  
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
   const handleDelete = async (id: string) => {
      if (!user) {
        toast.error("You must be signed in to delete a paste");
        return;
      }
  
      try {
        await deletePaste.mutateAsync(id);
        toast.success("Paste deleted successfully!");
        
      } catch (error) {
        console.error("Error deleting paste:", error);
        toast.error("Failed to delete paste");
      }
    };


    const totalPages = Math.ceil((userPastes.count || 0) / pageSize)

  return (
    <div className=" mx-auto px-4 py-12"
    >
      <div className="absolute inset-0 bg-custom-image bg-cover bg-center opacity-20 z-[-1] filter blur-custom"></div>
      <div className="max-w-4xl mx-auto space-y-8">
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
              <CardContent className="smooth-height-transition"
    style={{ minHeight: "350px" }}
    >
                {isLoadingUserPastes ? (
                  <p className="text-muted-foreground">Loading your pastes...</p>
                ) : userPastes.data.length === 0 ? (
                  <p className="text-muted-foreground">You haven't created any pastes yet</p>
                ) : (
                  <Suspense fallback={<LoadingDots />}>
  {userPastes.data.map((paste) => (
      <li
        key={paste.id}
        className="grid grid-cols-[1fr_auto] border-b pb-2 last:border-0 items-center"
      >
        <a
          href={`/paste/${paste.id}`}
          className="group hover:bg-neutral-50 p-2 block"
        >
          
          <p className="leading-[1.4] text-xl group-hover:underline normal-case font-medium hidden md:block">
          {paste.title.length > 80 ? `${paste.title.slice(0, 80)}...` : paste.title}
          </p>
          <p className="leading-[1.2] text-lg group-hover:underline normal-case font-medium block md:hidden">
          {paste.title.length > 30 ? `${paste.title.slice(0, 30)}...` : paste.title}
          </p>
          <p className="text-[11px] md:text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(paste.created_at), { addSuffix: true })}
          </p>
        </a>
        <div className="pl-4 flex flex-row items-center gap-2">
        <a
          href={`/edit/${paste.id}`}
          className=" "
        >
          <Edit size="16" />
        </a>
        <button
          onClick={() => handleDelete(paste.id)}
        >
          <Trash2 color="red"  size="16" />
        </button>
        </div>
      </li>
    ))}
</Suspense>

                )}
              </CardContent>

                {/* Pagination Controls */}
              <CardFooter>
              <div className="flex w-full justify-center gap-4 mt-4 [&>*]:p-2 [&>*]:rounded-full">
                  <button
                  className={ currentPage === 1 ? "text-neutral-400" : "text-neutral-900 hover:bg-neutral-100"}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ArrowLeftCircleIcon />
                  </button>

                  <span className="flex items-center text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                  className={ currentPage === totalPages ? "text-neutral-400" : "text-neutral-900 hover:bg-neutral-100"}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ArrowRightCircleIcon />
                  </button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>


      <div className="max-w-4xl mx-auto flex justify-center flex-col items-center py-4 md:py-12 space-y-4">
        <Image
        src={"/globe-outline-dark-2.svg"}
        className="w-full"
        alt="Logo"  
        width={120}
        height={120}
        />
        <a target="_blank" className="flex flex-row items-center hover:bg-neutral-100 gap-1 text-xs font-medium px-2 py-1 rounded-lg block" href="https://github.com/Ebrahim-Ramadan/paste.me">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" >
<path d="M12 1.95068C17.525 1.95068 22 6.42568 22 11.9507C21.9995 14.0459 21.3419 16.0883 20.1198 17.7902C18.8977 19.4922 17.1727 20.768 15.1875 21.4382C14.6875 21.5382 14.5 21.2257 14.5 20.9632C14.5 20.6257 14.5125 19.5507 14.5125 18.2132C14.5125 17.2757 14.2 16.6757 13.8375 16.3632C16.0625 16.1132 18.4 15.2632 18.4 11.4257C18.4 10.3257 18.0125 9.43818 17.375 8.73818C17.475 8.48818 17.825 7.46318 17.275 6.08818C17.275 6.08818 16.4375 5.81318 14.525 7.11318C13.725 6.88818 12.875 6.77568 12.025 6.77568C11.175 6.77568 10.325 6.88818 9.525 7.11318C7.6125 5.82568 6.775 6.08818 6.775 6.08818C6.225 7.46318 6.575 8.48818 6.675 8.73818C6.0375 9.43818 5.65 10.3382 5.65 11.4257C5.65 15.2507 7.975 16.1132 10.2 16.3632C9.9125 16.6132 9.65 17.0507 9.5625 17.7007C8.9875 17.9632 7.55 18.3882 6.65 16.8757C6.4625 16.5757 5.9 15.8382 5.1125 15.8507C4.275 15.8632 4.775 16.3257 5.125 16.5132C5.55 16.7507 6.0375 17.6382 6.15 17.9257C6.35 18.4882 7 19.5632 9.5125 19.1007C9.5125 19.9382 9.525 20.7257 9.525 20.9632C9.525 21.2257 9.3375 21.5257 8.8375 21.4382C6.8458 20.7752 5.11342 19.502 3.88611 17.799C2.65881 16.096 1.9989 14.0498 2 11.9507C2 6.42568 6.475 1.95068 12 1.95068Z" fill="currentColor"></path>
</svg>
Documentation
</a>
      </div>
    </div>
  )
}

