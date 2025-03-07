import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



// Function to extract image filenames from markdown
export function extractImageFilenames(markdownContent: string): string[] {
  const regex = /!\[.*?\]\((.*?)\)/g;  // Matches Markdown image syntax
  const filenames: string[] = [];
  let match;

  while ((match = regex.exec(markdownContent)) !== null) {
      try {
          const url = new URL(match[1]); // Parse the URL
          const pathname = url.pathname;  // Get the path
          const filename = pathname.substring(pathname.lastIndexOf('/') + 1); // Extract the filename
          filenames.push(filename);
      } catch (error) {
          console.warn(`Invalid URL found in markdown: ${match[1]}`);
      }
  }
  return filenames;
}
