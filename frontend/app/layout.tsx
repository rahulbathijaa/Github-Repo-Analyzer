// frontend/app/layout.tsx

import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";  // Import CSS from `app/` folder

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "Github Repo Analyzer",
  description: "Get key insights for a Github Profile in seconds.",
  icons: {
    icon: "/favicon.png",  
  },
  openGraph: {
    images: [
      {
        url: "/coverphoto.png",
        width: 800,
        height: 600,
        alt: "Cover Photo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.className}>
      <body>{children}</body>
    </html>
  );
}
