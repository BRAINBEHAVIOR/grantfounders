import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GrantFounders | Win Federal Grants with AI Precision",
  description: "GrantFounders analyzes your proposal against federal scoring criteria in seconds. Know your SBIR/STTR approval odds before you apply. Trusted by 500+ startups to secure $47M+ in funding.",
  keywords: ["SBIR", "STTR", "federal grants", "grant writing", "NSF", "NIH", "DoD", "startup funding", "grant analysis", "AI"],
  authors: [{ name: "GrantFounders" }],
  openGraph: {
    title: "GrantFounders | Win Federal Grants with AI Precision",
    description: "Know your SBIR/STTR approval odds before you apply. Trusted by 500+ startups.",
    type: "website",
    url: "https://grantfounders.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "GrantFounders | Win Federal Grants with AI Precision",
    description: "Know your SBIR/STTR approval odds before you apply. Trusted by 500+ startups.",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
