import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import { Toaster } from "sonner"
import { UserMenu } from "@/components/user-menu"
import Link from "next/link"
import { Github } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata :Metadata= {
  description: "Create and share text content with Markdown support",
  title: 'Paste.Me - Free Markdown Sharing',
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
    title: 'Paste.Me - Free Markdown Sharing',
    description: 'Paste.Me - Free Markdown Sharing',
    siteName: 'pastedotme',
    images: [
      {
        url: 'https://avatars.githubusercontent.com/u/65041082?s=400&u=cb58112cd92067eb53afe77fc7beb1573aab869d&v=4',
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
    images: 'https://avatars.githubusercontent.com/u/65041082?s=400&u=cb58112cd92067eb53afe77fc7beb1573aab869d&v=4',
    creator: "@scoopsahoykid",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <header className="border-b">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <Link href="/" className="font-bold text-xl">
                Paste.Me
              </Link>
              <UserMenu />
            </div>
          </header>
          <main className="min-h-screen">{children}</main>
          <footer className="py-6 border-t">
            <div className="flex flex-row items-center gap-2 justify-center text-neutral-700 font-medium hover:[&>*]:underline text-center text-sm ">
              <a target="_blank" className="flex flex-row items-center mr-2 " href="https://github.com/Ebrahim-Ramadan/paste.me">Paste.Me -
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 1.95068C17.525 1.95068 22 6.42568 22 11.9507C21.9995 14.0459 21.3419 16.0883 20.1198 17.7902C18.8977 19.4922 17.1727 20.768 15.1875 21.4382C14.6875 21.5382 14.5 21.2257 14.5 20.9632C14.5 20.6257 14.5125 19.5507 14.5125 18.2132C14.5125 17.2757 14.2 16.6757 13.8375 16.3632C16.0625 16.1132 18.4 15.2632 18.4 11.4257C18.4 10.3257 18.0125 9.43818 17.375 8.73818C17.475 8.48818 17.825 7.46318 17.275 6.08818C17.275 6.08818 16.4375 5.81318 14.525 7.11318C13.725 6.88818 12.875 6.77568 12.025 6.77568C11.175 6.77568 10.325 6.88818 9.525 7.11318C7.6125 5.82568 6.775 6.08818 6.775 6.08818C6.225 7.46318 6.575 8.48818 6.675 8.73818C6.0375 9.43818 5.65 10.3382 5.65 11.4257C5.65 15.2507 7.975 16.1132 10.2 16.3632C9.9125 16.6132 9.65 17.0507 9.5625 17.7007C8.9875 17.9632 7.55 18.3882 6.65 16.8757C6.4625 16.5757 5.9 15.8382 5.1125 15.8507C4.275 15.8632 4.775 16.3257 5.125 16.5132C5.55 16.7507 6.0375 17.6382 6.15 17.9257C6.35 18.4882 7 19.5632 9.5125 19.1007C9.5125 19.9382 9.525 20.7257 9.525 20.9632C9.525 21.2257 9.3375 21.5257 8.8375 21.4382C6.8458 20.7752 5.11342 19.502 3.88611 17.799C2.65881 16.096 1.9989 14.0498 2 11.9507C2 6.42568 6.475 1.95068 12 1.95068Z" fill="currentColor"></path>
      </svg>
      </a> 
     <a target="_blank" className="" href="https://pastedotme.vercel.app/">Ebrahim Ramadan</a>
            </div>
          </footer>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}

