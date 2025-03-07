import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="h-screen mx-auto px-4 py-12 flex justify-center items-center">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Paste not found</h1>
        <p className="mb-6 text-neutral-700">The paste you are looking for does not exist or has been removed.</p>
        <Link href="/">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}