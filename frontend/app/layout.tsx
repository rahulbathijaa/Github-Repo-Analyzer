// frontend/app/layout.tsx

import type { Metadata } from "next";
import { Space_Grotesk } from 'next/font/google';
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Github Profile Analyzer",
  description: "Get key insights for a Github Profile in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.className}>
      <body>
        {children}
      </body>
    </html>
  );
}
