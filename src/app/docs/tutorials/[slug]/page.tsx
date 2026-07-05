import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { ArrowLeft, Terminal } from "lucide-react";

const tutorialsDir = path.join(process.cwd(), "docs", "tutorials");

const tutorialMeta: Record<string, { title: string }> = {
  "getting-started": { title: "Getting Started" },
  "platform-guide": { title: "Platform Setup Guide" },
  "how-subdns-works": { title: "How SubDNS Works" },
  "dns-management": { title: "DNS Management" },
  "cli-guide": { title: "CLI Guide" },
};

export function generateStaticParams() {
  if (!fs.existsSync(tutorialsDir)) return [];
  return fs.readdirSync(tutorialsDir).map((file) => ({
    slug: file.replace(/\.md$/, ""),
  }));
}

const headings = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" } as const;

function Heading({ level, children }: { level: number; children: React.ReactNode }) {
  const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const Tag: "h1" | "h2" | "h3" | "h4" = headings[level as keyof typeof headings] ?? "h2";
  const size = level === 1 ? "display-lg" : level === 2 ? "display-md" : level === 3 ? "display-sm" : "font-semibold text-base";
  const mt = level === 1 ? "mt-0" : level === 2 ? "mt-16" : level === 3 ? "mt-10" : "mt-6";
  const mb = level === 1 ? "mb-6" : level === 2 ? "mb-4" : level === 3 ? "mb-3" : "mb-2";

  return (
    <Tag id={id} className={`${size} ${mt} ${mb} text-foreground`}>
      {children}
    </Tag>
  );
}

function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const code = String(children).replace(/\n$/, "");

  return (
    <div className="group my-8 overflow-hidden rounded-2xl border border-border bg-card">
      {language && (
        <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{language}</span>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <pre className="p-5 text-sm leading-relaxed">
          <code className="font-mono text-gray-600">{code}</code>
        </pre>
      </div>
    </div>
  );
}

function InlineCode({ children }: { children?: React.ReactNode }) {
  return (
    <code className="rounded-lg border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-sm text-gray-650">
      {children}
    </code>
  );
}

function Table({ children }: { children?: React.ReactNode }) {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

function TableHead({ children }: { children?: React.ReactNode }) {
  return <thead className="border-b border-border bg-muted/30">{children}</thead>;
}

function TableBody({ children }: { children?: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

function TableRow({ children }: { children?: React.ReactNode }) {
  return <tr className="divide-x divide-border">{children}</tr>;
}

function TableCell({ children, isHeader }: { children?: React.ReactNode; isHeader?: boolean }) {
  const Tag = isHeader ? "th" : "td";
  return (
    <Tag className={`px-5 py-3.5 text-left align-top ${isHeader ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
      <div className="flex items-center gap-2">{children}</div>
    </Tag>
  );
}

function Paragraph({ children }: { children?: React.ReactNode }) {
  return <p className="my-5 leading-[1.75] text-muted-foreground">{children}</p>;
}

function List({ children, ordered }: { children?: React.ReactNode; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`my-5 ${ordered ? "list-decimal" : "list-disc"} space-y-2 pl-6 marker:text-gray-500`}>
      {children}
    </Tag>
  );
}

function ListItem({ children }: { children?: React.ReactNode }) {
  return <li className="text-muted-foreground leading-relaxed">{children}</li>;
}

function Blockquote({ children }: { children?: React.ReactNode }) {
  return (
    <blockquote className="my-8 border-l-2 border-accent bg-accent-muted/50 pl-5 italic text-muted-foreground">
      {children}
    </blockquote>
  );
}

function HorizontalRule() {
  return <hr className="my-16 border-border" />;
}

function Anchor({ children, href }: { children?: React.ReactNode; href?: string }) {
  return (
    <a
      href={href}
      className="text-accent underline decoration-accent/30 underline-offset-2 transition-colors hover:decoration-accent"
    >
      {children}
    </a>
  );
}

function Strong({ children }: { children?: React.ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

function Emphasis({ children }: { children?: React.ReactNode }) {
  return <em className="italic text-gray-650">{children}</em>;
}

const components = {
  h1: (props: any) => <Heading level={1} {...props} />,
  h2: (props: any) => <Heading level={2} {...props} />,
  h3: (props: any) => <Heading level={3} {...props} />,
  h4: (props: any) => <Heading level={4} {...props} />,
  code: ({ className, ...props }: any) =>
    className ? <CodeBlock className={className} {...props} /> : <InlineCode {...props} />,
  table: Table,
  thead: TableHead,
  tbody: TableBody,
  tr: TableRow,
  th: (props: any) => <TableCell isHeader {...props} />,
  td: TableCell,
  p: Paragraph,
  ul: (props: any) => <List ordered={false} {...props} />,
  ol: (props: any) => <List ordered {...props} />,
  li: ListItem,
  blockquote: Blockquote,
  hr: HorizontalRule,
  a: Anchor,
  strong: Strong,
  em: Emphasis,
};

export default async function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = path.join(tutorialsDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) return notFound();

  const content = fs.readFileSync(filePath, "utf-8");
  const meta = tutorialMeta[slug] ?? { title: slug };

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/tutorials"
            className="mb-12 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tutorials
          </Link>

          <article>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
