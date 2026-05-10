import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: '今日何食べる？',
  description: 'あなたの気分と状況に合った食事を3つ提案するAIアシスタント',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '今日何食べる？',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f59e0b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-amber-50 text-gray-900 antialiased">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-6 pb-16">{children}</main>
      </body>
    </html>
  );
}
