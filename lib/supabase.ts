import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey =process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define types for our database
export interface Paste {
  id: string
  title: string
  content: string
  created_at: string
  user_id?: string
}

// Helper function to get the site URL
export function getSiteUrl() {
  let url =
    process?.env?.NEXT_PUBLIC_BASE_URL ?? // Set this in your .env file
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
    "http://localhost:3000"

  // Make sure to include `https://` when not localhost
  url = url.includes("http") ? url : `https://${url}`

  // Make sure to include trailing `/`
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`

  return url
}
