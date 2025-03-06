import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase, type Paste } from "./supabase"

// Get a single paste by ID
export function usePaste(id: string | undefined) {
  return useQuery({
    queryKey: ["paste", id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase.from("pastes").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching paste:", error)
        return null
      }

      return data as Paste
    },
    enabled: !!id,
  })
}

// Get recent pastes
export function useRecentPastes() {
  return useQuery({
    queryKey: ["pastes", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pastes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching recent pastes:", error)
        return []
      }

      return data as Paste[]
    },
  })
}

// Get user's pastes
export function useUserPastes(userId: string | undefined) {
  return useQuery({
    queryKey: ["pastes", "user", userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from("pastes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) {
        console.error("Error fetching user pastes:", error)
        return []
      }

      return data as Paste[]
    },
    enabled: !!userId,
  })
}

// Create a new paste
export function useCreatePaste() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (paste: { title: string; content: string }) => {
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id

      if (!userId) {
        throw new Error("You must be signed in to create a paste")
      }

      // Generate a unique ID if not using Supabase's auto-generated UUIDs
      const id = Date.now();

      const { data, error } = await supabase
        .from("pastes")
        .insert({
          id,
          title: paste.title,
          content: paste.content,
          user_id: userId,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating paste:", error)
        throw error
      }

      return data as Paste
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pastes"] })
      queryClient.setQueryData(["paste", data.id], data)
    },
  })
}

// Update a paste
export function useUpdatePaste() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id

      if (!userId) {
        throw new Error("You must be signed in to update a paste")
      }

      // Create updated slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-")

      const { data, error } = await supabase
        .from("pastes")
        .update({ title, content, slug })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating paste:", error)
        throw error
      }

      return data as Paste
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pastes"] })
      queryClient.setQueryData(["paste", data.id], data)
    },
  })
}

// Delete a paste
export function useDeletePaste() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id

      if (!userId) {
        throw new Error("You must be signed in to delete a paste")
      }

      const { error } = await supabase.from("pastes").delete().eq("id", id)

      if (error) {
        console.error("Error deleting paste:", error)
        throw error
      }

      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["pastes"] })
      queryClient.removeQueries({ queryKey: ["paste", id] })
    },
  })
}

// Get current user
export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
        return null
      }

      return data.session?.user || null
    },
    // Reduce refetching frequency to avoid rate limits
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
  })
}

// Sign in with Google
export function useSignInWithGoogle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
        },
      })

      if (error) {
        console.error("Error signing in with Google:", error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })
}

// Sign out
export function useSignOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error signing out:", error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })
}

