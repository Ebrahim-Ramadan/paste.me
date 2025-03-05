import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JustPaste Clone - Free Markdown Sharing",
  description: "Create and share text content with Markdown support - no login required",
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
          <main className="min-h-screen bg-background">{children}</main>
          <footer className="py-6 border-t">
            <div className="container text-center text-sm text-muted-foreground">
              <p>JustPaste Clone - Free Markdown Sharing Service</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}

