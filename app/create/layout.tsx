import { Metadata } from "next";

type Props = {
    children: React.ReactNode
  }

export const metadata : Metadata = {
    title: 'Create a new paste',
    description: 'Create a new paste on Paste.me',
    };
export default function NewPasteLayout({ children }: Props) {
    return <div>{children}</div>
  }