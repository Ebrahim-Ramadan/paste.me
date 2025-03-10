"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import React from "react";

interface MarkdownProps {
  content: string;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export function Markdown({ content }: MarkdownProps) {
  const processedContent = content
    .replace(/<br\s*\/?>/gi, "\n") // Replace <br> or <br/> (case-insensitive) with \n
    .replace(/&nbsp;/g, " "); // Optional: Replace &nbsp; with a space if needed

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }: CodeProps) {
          const match = /language-(\w+)/.exec(className || "");

          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        p: ({ node, children, ...props }) => {
          const modifiedChildren = React.Children.toArray(children).flatMap(
            (child, index, array) => {
              if (typeof child === "string") {
                const parts = child.split("\n");
                return parts.map((part, partIndex) => (
                  <React.Fragment key={`${index}-${partIndex}`}>
                    {part}
                    {partIndex < parts.length - 1 && <br />}
                  </React.Fragment>
                ));
              }
              return child;
            }
          );

          return (
            <p className="mb-4" {...props}>
              {modifiedChildren}
            </p>
          );
        },
        h1: ({ node, ...props }) => (
          <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-xl font-bold mt-4 mb-2" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc pl-6 mb-4" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal pl-6 mb-4" {...props} />
        ),
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-gray-300 pl-4 italic my-4"
            {...props}
          />
        ),
        a: ({ node, children, ...props }) => (
          <a className="text-primary hover:underline" {...props}>
            {children}
          </a>
        ),
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto">
            <table
              className="min-w-full divide-y divide-gray-300 my-4"
              {...props}
            />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-gray-100" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="px-3 py-2 text-left text-sm font-semibold" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-3 py-2 text-sm" {...props} />
        ),
        hr: ({ node, ...props }) => (
          <hr className="my-6 border-t border-gray-300" {...props} />
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
