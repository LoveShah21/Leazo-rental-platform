import fs from "node:fs";
import path from "node:path";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarkdownRenderer } from "@/components/docs/markdown-renderer";

export default async function DatabaseDocsPage() {
  // In this workspace, the markdown is attached in a temp path; for the app, place a copy under /public/docs or use this fallback content.
  let content = `# Database Design\n\nThe database design markdown could not be found in the runtime environment. Please add your docs under public/docs.`;
  const localPath = path.join(process.cwd(), "public", "docs", "database-design.md");
  try {
    if (fs.existsSync(localPath)) {
      content = fs.readFileSync(localPath, "utf8");
    }
  } catch {}

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold">Database Design</h1>
        <MarkdownRenderer content={content} />
      </main>
      <Footer />
    </div>
  );
}
