import { Metadata } from "next";

type Props = {
    params: { slug: string }
    children: React.ReactNode
  }

export const metadata : Metadata = {
    title: 'Raw Paste',
    description: 'Raw Paste on Paste.me',
    };
export default function RawPasteLayout({ children }: Props) {
    return <div>{children}</div>
  }