"use client";

import React, { useEffect, useId, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import mermaid from "mermaid";

function Mermaid({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      mermaid.initialize({ startOnLoad: false, theme: "default" });
      mermaid.render(id, chart).then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      });
    } catch (e) {
      if (ref.current) ref.current.textContent = "Failed to render diagram.";
    }
  }, [chart, id]);

  return <div ref={ref} />;
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, className, children, ...props }) {
            const language = /language-(\w+)/.exec(className || "")?.[1];
            const code = String(children ?? "");
            if (language === "mermaid") {
              return <Mermaid chart={code} />;
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
