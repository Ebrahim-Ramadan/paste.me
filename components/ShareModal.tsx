// components/ShareModal.tsx (unchanged)
"use client";

import React, { Suspense, lazy } from "react";
import { CheckCheck, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/alert-dialog";
import LoadingDots from "@/components/LoadingDots";
import { toast } from "sonner";

const QRCodeGenerator = lazy(() =>
  import('react-qr-code').then((module) => ({ default: module.default }))
);

interface ShareModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  content: string | null;
  url: string;
}

export function ShareModal({ isOpen, setIsOpen, content, url }: ShareModalProps) {
  const [contentCopied, setContentCopied] = React.useState(false);
  const [linkCopied, setLinkCopied] = React.useState(false);
  const [iframeCodeCopied, setiframeCodeCopied] = React.useState(false);

  const copyToClipboard = (type: "link" | "content" | "iframe") => () => {
    if (type === "link") {
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } else if (type === "content") {
      navigator.clipboard.writeText(content!);
      setContentCopied(true);
      setTimeout(() => setContentCopied(false), 2000);
    } else  if (type === "iframe") {
      navigator.clipboard.writeText(`<iframe src="https://pastedotme.vercel.app/embed/${url.split('/embed/')[1]}" width="600" height="400" style="border: 1px solid #ccc;"></iframe>`);
      setiframeCodeCopied(true);
      setTimeout(() => setiframeCodeCopied(false), 2000);
    }
    toast.success(`${type} copied to clipboard`);
  };



  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Share this paste</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
        <Suspense fallback={<LoadingDots />}>
            <QRCodeGenerator
              value={url}
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              className="mx-auto"
            />
          </Suspense>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={copyToClipboard("link")}
          >
            {linkCopied?
          <CheckCheck className="mr-2 h-4 w-4" />
          :
          <Copy className="mr-2 h-4 w-4" />
          }
            {linkCopied ? "Link Copied!" : "Copy Link"}
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={copyToClipboard("content")}
            disabled={!content}
          >
             {contentCopied?
          <CheckCheck className="mr-2 h-4 w-4" />
          :
          <Copy className="mr-2 h-4 w-4" />
          }
            {contentCopied ? "Content Copied!" : "Copy Content"}
          </Button>
          <Button 
          onClick={copyToClipboard("iframe")}
          variant="outline" 
            className="w-full" >
               {iframeCodeCopied?
          <CheckCheck className="mr-2 h-4 w-4" />
          :
          <Copy className="mr-2 h-4 w-4" />
          }
          {iframeCodeCopied ? "iFrame Copied!" : "Copy iFrame Code"}

      </Button>
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
export default ShareModal;