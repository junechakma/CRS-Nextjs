import type { Metadata, Viewport } from "next";
import { Sora, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Toaster } from "sonner";
import { defaultMetadata, organizationSchema, softwareApplicationSchema } from "@/lib/seo.config";

const sora = Sora({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "500", "700"],
});

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#468cfe',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationSchema),
          }}
        />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body
        className={`${sora.variable} ${ibmPlexSans.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
