// app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Elliott Wave Signals',
  description: 'Personal Elliott Wave signal viewer + portfolio tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-gray-900">
        <nav className="bg-green-900 text-white shadow-md sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
            <span className="font-bold text-lg">Elliott Wave</span>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-green-200 font-medium">
                Signals
              </Link>
              <Link href="/portfolio" className="hover:text-green-200 font-medium">
                Portfolio
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
