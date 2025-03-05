import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import { Toaster } from "sonner"
import { UserMenu } from "@/components/user-menu"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Paste.Me - Free Markdown Sharing",
  description: "Create and share text content with Markdown support",
}

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
          <main className="min-h-screen bg-background">{children}</main>
          <footer className="py-6 border-t">
            <div className="container text-center text-sm text-muted-foreground">
              <p>Paste.Me - created by <a target="_blank" className="text-neutral-700 font-medium hover:underline" href="https://ebrahim-ramadan.vercel.app/">Ebrahim Ramadan</a></p>
            </div>
          </footer>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}

