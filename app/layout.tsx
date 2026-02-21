import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AssessmentProvider } from '@/components/AssessmentContext';

export const metadata: Metadata = {
  title: 'FirstMap',
  description: 'Pomáhá vidět, kam jít dál.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#4CBFBF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FirstMap" />
      </head>
      <body>
        <AssessmentProvider>
          {children}
        </AssessmentProvider>
      </body>
    </html>
  );
}
