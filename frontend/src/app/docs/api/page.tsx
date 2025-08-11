import fs from "node:fs";
import path from "node:path";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarkdownRenderer } from "@/components/docs/markdown-renderer";

export default async function ApiDocsPage() {
  let content = `# API Documentation\n\nThe API documentation markdown could not be found. Add a copy under public/docs/api-documentation.md.`;
  const localPath = path.join(process.cwd(), "public", "docs", "api-documentation.md");
  try {
    if (fs.existsSync(localPath)) {
      content = fs.readFileSync(localPath, "utf8");
    }
  } catch {}

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <MarkdownRenderer content={content} />
      </main>
      <Footer />
    </div>
  );
}
