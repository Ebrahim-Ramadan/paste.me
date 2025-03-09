import { Metadata } from 'next'

type LayoutProps  = {
  params: { slug: string }
  children: React.ReactNode
}
type Props = LayoutProps

export const metadata :Metadata= {
  description: "Create and share text content with Markdown support",
  title: 'My Paste',
  keywords: [
    "Ebrahim Ramadan",
    "Paste.Me",
    "Free Markdown Sharing",
    "justpaste",
    "justpaste alternative",
  ],
  creator: "Ebrahim Ramadan",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: 'https://pastedotme.vercel.app/',
    title: 'My Paste',
    description: 'My Paste',
    siteName: 'pastedotme',
    images: [
      {
        url: 'https://raw.githubusercontent.com/Ebrahim-Ramadan/paste.me/refs/heads/main/public/og%20image.png',
        width: 1200,
        height: 630,
        alt: 'Paste.me',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: 'Ebrahim Ramadan',
    description: 'Ebrahim Ramadan',
    images: 'https://raw.githubusercontent.com/Ebrahim-Ramadan/paste.me/refs/heads/main/public/og%20image.png',
    creator: "@scoopsahoykid",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

};

export default function PasteLayout({ children }: Props) {
  return <div>{children}</div>
}