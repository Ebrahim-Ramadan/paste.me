import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function extractImageFilenames(content: string): string[] {
  const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;
  const filenames: string[] = [];
  let match;

  while ((match = markdownImageRegex.exec(content)) !== null) {
    const url = match[1]; // e.g., "https://zrhpfgbzjlouqoyuywflg.supabase.co/storage/v1/object/public/pastes-storage/1741352140777-Screenshot%202025-03-04%20195117.png"
    const filenameWithEncoding = url.split("/").pop(); // Extracts "1741352140777-Screenshot%202025-03-04%20195117.png"
    if (filenameWithEncoding) {
      const filename = decodeURIComponent(filenameWithEncoding); // Decode to "1741352140777-Screenshot 2025-03-04 195117.png"
      filenames.push(filename);
    }
  }

  console.log("Extracted filenames:", filenames);
  return filenames;
}