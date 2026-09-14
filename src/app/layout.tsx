import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "../styles.css"; // Global styles
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});
const poppins = Poppins({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aromacafe.eu.cc"),
  title: "Aroma Cafe & Restaurant — Nalgonda",
  description:
    "Specialty coffee, fresh-baked goods and fine dining in the heart of Nalgonda. Order online or reserve a table.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aroma Cafe",
  },
  openGraph: {
    title: "Aroma Cafe & Restaurant — Nalgonda",
    description: "Specialty coffee, fresh-baked goods and fine dining in Nalgonda.",
    type: "website",
    url: "https://aromacafe.eu.cc",
    siteName: "Aroma Cafe & Restaurant",
    images: [
      {
        url: "/icon.png",
        width: 800,
        height: 800,
        alt: "Aroma Cafe & Restaurant — Nalgonda",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aroma Cafe & Restaurant — Nalgonda",
    description: "Specialty coffee, fresh-baked goods and fine dining in Nalgonda.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://aroma-cafe-79055.firebaseapp.com" />
        <link rel="preconnect" href="https://apis.google.com" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
