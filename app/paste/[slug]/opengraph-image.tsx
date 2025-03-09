import { ImageResponse } from 'next/og'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
 
export default async function Image({ params }: { params: { slug: string } }) {
  console.log('ass', params.slug)
  
  const logoData = await readFile(join(process.cwd(), '/public/og image.png'))
  const logoSrc = Uint8Array.from(logoData).buffer
 
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* @ts-ignore */}
        <img src={logoSrc} height="100%" width="100%" alt="logo" />
      </div>
    )
  )
}