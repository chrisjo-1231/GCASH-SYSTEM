
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Next.js Website",
  description: "Learning Next.js step by step",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white">
        <nav className="flex items-center justify-between border-b border-slate-800 p-6">
          <Link href="/" className="text-2xl font-bold">
            MyWebsite
          </Link>

          <div className="flex gap-6">
            <Link href="/" className="hover:text-blue-400">
              Home
            </Link>

            <Link href="/about" className="hover:text-blue-400">
              About
            </Link>
          </div>
        </nav>

        {children}

        <footer className="border-t border-slate-800 p-6 text-center text-slate-400">
          © 2026 MyWebsite. Built with Next.js.
        </footer>
      </body>
    </html>
  );
}