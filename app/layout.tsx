import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { BRAND_NAME, DESCRIPTION, TAGLINE } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";
import { AppProviders } from "@/components/providers/AppProviders";
import { LoadingScreen } from "@/components/LoadingScreen";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: {
    default: `${BRAND_NAME} | ${TAGLINE}`,
    template: `%s | ${BRAND_NAME}`
  },
  description: DESCRIPTION,
  openGraph: {
    title: `${BRAND_NAME} | ${TAGLINE}`,
    description: DESCRIPTION,
    url: absoluteUrl("/"),
    siteName: BRAND_NAME,
    type: "website",
    images: [absoluteUrl("/opengraph-image")]
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} | ${TAGLINE}`,
    description: DESCRIPTION
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} bg-ink text-white`}>
      <body className="min-h-screen bg-ink font-sans text-white [font-family:var(--font-inter)]">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <AppProviders>
          <LoadingScreen />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

