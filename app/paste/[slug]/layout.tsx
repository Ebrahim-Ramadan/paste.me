import { supabase } from '@/lib/supabase'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = {
  params: { slug: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slugParam = params?.slug
  const id = slugParam?.split("-")[0]

  const { data: paste, error } = await supabase
    .from("pastes")
    .select("title, created_at")
    .eq("id", id)
    .single()

  if (error) {
    console.error('Error fetching paste:', error)
    notFound()
  }

  if (!paste) {
    notFound()
  }

  const baseUrl = process.env.BASE_URL || 'https://pastedotme.vercel.app'
  const title = paste.title || 'New Paste'
  const description = paste.title || 'A paste created with our service'
  const url = `${baseUrl}/paste/${slugParam}`
  const created = paste.created_at
    ? new Date(paste.created_at).toLocaleDateString()
    : 'Unknown Date'
  
  const ogImageUrl = `${baseUrl}/paste/${slugParam}/og?title=${encodeURIComponent(title)}&created=${encodeURIComponent(created)}`

  return {
    metadataBase: new URL(baseUrl), // Set the base URL for resolving relative URLs
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'Your Paste Service',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

export default function PasteLayout({ children }: Props) {
  return <div>{children}</div>
}