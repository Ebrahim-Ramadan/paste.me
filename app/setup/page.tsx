import SetupDatabase from "@/components/setup-database"

export default function SetupPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">JustPaste Clone Setup</h1>
        <SetupDatabase />

        <div className="mt-12 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">SQL Setup Instructions</h2>
          <p className="mb-4">To complete the setup, you need to run the following SQL in your Supabase SQL Editor:</p>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto text-sm">
            {`-- Function to create the pastes table
CREATE OR REPLACE FUNCTION create_pastes_table()
RETURNS void AS $$
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;`}
          </pre>
        </div>
      </div>
    </div>
  )
}

