"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, Edit, ExternalLink } from "lucide-react"
import { Markdown } from "@/components/markdown"
import { usePaste, useUser } from "@/lib/hooks"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

export default function PastePage() {
  const params = useParams()
  const [copied, setCopied] = useState(false)

  // Extract the ID from the slug parameter
  const slugParam = params?.slug as string
  const id = slugParam?.split("-")[0]

  const { data: paste, isLoading } = usePaste(id)
  const { data: user } = useUser()

  // Check if user is the creator
  const isCreator = user?.id && paste?.user_id === user.id

  const copyToClipboard = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success("Link copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
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
            {isCreator && (
              <Link href={`/edit/${paste.id}`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm sm:prose max-w-none dark:prose-invert">
              <Markdown content={paste.content} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "Copied!" : "Copy link"}
            </Button>
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

