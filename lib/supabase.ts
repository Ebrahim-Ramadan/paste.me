import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://sbntqvizhrjpdznfmzmh.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNibnRxdml6aHJqcGR6bmZtem1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODkxNTAsImV4cCI6MjA1Njc2NTE1MH0.kw2J893WhRMO_AjgdS41TQHFMYMId-BTfhAh-siPaNk"

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