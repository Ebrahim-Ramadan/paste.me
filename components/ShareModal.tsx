// components/ShareModal.tsx (unchanged)
"use client";

import React, { Suspense, lazy } from "react";
import { Copy } from "lucide-react";
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

  const copyToClipboard = (type: "link" | "content") => () => {
    if (type === "link") {
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } else if (content) {
      navigator.clipboard.writeText(content);
      setContentCopied(true);
      setTimeout(() => setContentCopied(false), 2000);
    } else {
      toast.error("No content to copy");
      return;
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
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={copyToClipboard("link")}
          >
            <Copy className="mr-2 h-4 w-4" />
            {linkCopied ? "Link Copied!" : "Copy Link"}
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={copyToClipboard("content")}
            disabled={!content}
          >
            <Copy className="mr-2 h-4 w-4" />
            {contentCopied ? "Content Copied!" : "Copy Content"}
          </Button>
          <Suspense fallback={<LoadingDots />}>
            <QRCodeGenerator
              value={url}
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              className="mx-auto"
            />
          </Suspense>
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