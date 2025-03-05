"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { initializeDatabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function SetupDatabase() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const handleInitialize = async () => {
    setIsInitializing(true)
    try {
      await initializeDatabase()
      setIsInitialized(true)
      toast.success("Database initialized successfully!")
    } catch (error) {
      console.error("Error initializing database:", error)
      toast.error("Failed to initialize database")
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Database Setup</CardTitle>
        <CardDescription>Initialize the database schema for the JustPaste clone</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This will create the necessary tables and set up Row Level Security policies to ensure only the creator of a
          paste can edit or delete it.
        </p>
        {isInitialized && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md text-green-600 dark:text-green-400 text-sm">
            Database has been initialized successfully!
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleInitialize} disabled={isInitializing || isInitialized} className="w-full">
          {isInitializing ? "Initializing..." : isInitialized ? "Initialized" : "Initialize Database"}
        </Button>
      </CardFooter>
    </Card>
  )
}

