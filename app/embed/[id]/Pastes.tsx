'use client'
import { Markdown } from '@/components/markdown';
import { use } from 'react'
 

interface PasteProps {
  paste: Promise<{
    data: {
      id: string;
      title: string;
      content: string;
      created_at: string;
    };
    error: any;
  }>;
}
export  function Pastes({
  paste,
}: PasteProps) {

  const pasteInfo = use(paste)
 
  return (
    <div key={pasteInfo.data.id} className='bg-white p-4 rounded-lg shadow-md'>
      {/* <p className='text-xl font-bold'>{pasteInfo.data.title}</p>

      <p className='text-neutral-600 text-xs mb-4'>Created at: {new Date(pasteInfo.data.created_at).toLocaleString()}</p>
          <Markdown content={pasteInfo.data.content} /> */}
<iframe src={`https://localhost:3000/embed/${pasteInfo.data.id}`} width="600" height="400" style={{border:"1px solid #ccc"}}></iframe>
  </div>
  )
}