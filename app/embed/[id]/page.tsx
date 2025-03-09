import { supabase } from '@/lib/supabase'
import { Suspense } from 'react'
import { Pastes } from './Pastes'
import LoadingDots from '@/components/LoadingDots'
 
interface PageProps {
  params: {
    id: string;
  };
}


export default async function Page({ params }:PageProps) {
  const { id } = await params
  const paste =  supabase
  .from("pastes")
  .select("title, created_at, content")
  .eq("id", id)
  .single()
 
  return (
    <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center w-full">
        <LoadingDots />
      </div>
  }>

      <Pastes paste={paste} />
    </Suspense>
  )
}