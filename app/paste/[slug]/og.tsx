import { ImageResponse } from 'next/og'

// Image metadata
export const alt = 'Paste OG Image'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Server-side image generation
export default async function OgImage({
  params,
}: {
  params: { slug: string; title?: string; created?: string }
}) {
  // Extract query parameters from the URL
  const url = new URL(`https://pastedotme.vercel.app/paste/${params.slug}/og${params.title ? `?title=${params.title}` : ''}${params.created ? `&created=${params.created}` : ''}`, 'https://pastedotme.vercel.app');
  const title = url.searchParams.get('title') || 'New Paste'
  const created = url.searchParams.get('created') || 'Earlier Today'

  

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          fontFamily: 'Inter',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
            maxWidth: '1100px',
          }}
        >
          <h1
            style={{
              fontSize: '60px',
              fontWeight: 700,
              margin: 0,
              color: '#000',
              wordBreak: 'break-word',
            }}
          >
            {decodeURIComponent(title)}
          </h1>
          <p
            style={{
              fontSize: '30px',
              color: '#666',
              margin: 0,
            }}
          >
            Created: {decodeURIComponent(created)}
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}