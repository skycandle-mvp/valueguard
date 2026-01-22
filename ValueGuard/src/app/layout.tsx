import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from '@/components/layout/app-header';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth-provider';

export const metadata: Metadata = {
  title: 'ValueGuard',
  description:
    '分享与研究与个人或社会价值观相悖的公司事件。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background">
        <AuthProvider>
          <AppHeader />
          <main className="flex-grow">{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
