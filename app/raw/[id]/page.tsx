"use client"
import { useParams } from "next/navigation"
import { usePaste } from "@/lib/hooks"

export default function RawPage() {
  const params = useParams()
  const id = params?.id as string

  const { data: paste, isLoading } = usePaste(id)

  if (isLoading) {
    return <p className="p-4">Loading...</p>
  }

  if (!paste) {
    return <p className="p-4">Paste not found</p>
  }

  return <pre className="p-4 whitespace-pre-wrap font-mono text-sm">{paste.content}</pre>
}

