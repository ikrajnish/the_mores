import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://themores.com"),
  title: {
    default: "Mores Salon | Luxury Hair, Skin & Wellness",
    template: "%s | Mores Salon",
  },
  description: "Experience the pinnacle of luxury hair, skin, and wellness treatments at Mores Salon. Expert care for every part of you.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Mores Salon",
    images: [
      {
        url: "/og-image.jpg", // Needs to be added to public/ or replaced with a real URL
        width: 1200,
        height: 630,
        alt: "Mores Salon Luxury Experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mores Salon | Luxury Hair, Skin & Wellness",
    description: "Experience the pinnacle of luxury hair, skin, and wellness treatments at Mores Salon.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { AuthProvider } from "@/context/AuthContext";
import GoogleAnalytics from "@/components/seo/GoogleAnalytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
