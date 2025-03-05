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
  slug: string
  created_at: string
  user_id?: string
}

// This function can be used to initialize the database schema
// You would run this once to set up your tables
export async function initializeDatabase() {
  try {
    // Check if the pastes table exists
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "pastes")

    if (tablesError) {
      console.error("Error checking if table exists:", tablesError)
      throw tablesError
    }

    // If the table doesn't exist, create it directly
    if (!tables || tables.length === 0) {
      console.log("Creating pastes table...")

      // Create the pastes table directly instead of using RPC
      const { error: createTableError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS public.pastes (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          slug TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_id UUID REFERENCES auth.users(id)
        );
        
        -- Create index on created_at for faster sorting
        CREATE INDEX IF NOT EXISTS pastes_created_at_idx ON public.pastes (created_at DESC);
        
        -- Create index on user_id for faster filtering
        CREATE INDEX IF NOT EXISTS pastes_user_id_idx ON public.pastes (user_id);
        
        -- Enable RLS
        ALTER TABLE public.pastes ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY read_pastes ON public.pastes
          FOR SELECT
          USING (true);
          
        CREATE POLICY update_own_pastes ON public.pastes
          FOR UPDATE
          USING (auth.uid() = user_id);
          
        CREATE POLICY delete_own_pastes ON public.pastes
          FOR DELETE
          USING (auth.uid() = user_id);
          
        CREATE POLICY insert_pastes ON public.pastes
          FOR INSERT
          WITH CHECK (true);
      `)

      if (createTableError) {
        console.error("Error creating pastes table:", createTableError)
        throw createTableError
      }

      console.log("Pastes table created successfully")
    } else {
      console.log("Pastes table already exists")
    }

    return true
  } catch (error) {
    console.error("Error in initializeDatabase:", error)
    throw error
  }
}

// SQL functions to create in Supabase SQL Editor:
/*
-- Function to create the pastes table
CREATE OR REPLACE FUNCTION create_pastes_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.pastes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
  );
  
  -- Create index on created_at for faster sorting
  CREATE INDEX IF NOT EXISTS pastes_created_at_idx ON public.pastes (created_at DESC);
  
  -- Create index on user_id for faster filtering
  CREATE INDEX IF NOT EXISTS pastes_user_id_idx ON public.pastes (user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enable RLS on pastes table
CREATE OR REPLACE FUNCTION enable_rls_on_pastes()
RETURNS void AS $$
BEGIN
  ALTER TABLE public.pastes ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create read policy
CREATE OR REPLACE FUNCTION create_read_policy()
RETURNS void AS $$
BEGIN
  CREATE POLICY read_pastes ON public.pastes
    FOR SELECT
    USING (true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create update policy
CREATE OR REPLACE FUNCTION create_update_policy()
RETURNS void AS $$
BEGIN
  CREATE POLICY update_own_pastes ON public.pastes
    FOR UPDATE
    USING (auth.uid() = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create delete policy
CREATE OR REPLACE FUNCTION create_delete_policy()
RETURNS void AS $$
BEGIN
  CREATE POLICY delete_own_pastes ON public.pastes
    FOR DELETE
    USING (auth.uid() = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create insert policy
CREATE OR REPLACE FUNCTION create_insert_policy()
RETURNS void AS $$
BEGIN
  CREATE POLICY insert_pastes ON public.pastes
    FOR INSERT
    WITH CHECK (true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

