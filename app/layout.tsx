import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'M.A.R.S | Precision Multi-Agent Research System',
  description: 'Collaborative Multi-Agent AI Research Report Generator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-background font-chat-bubble text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}
