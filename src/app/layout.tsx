import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "../styles.css"; // Global styles
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Aroma Cafe & Restaurant — Nalgonda",
  description:
    "Specialty coffee, fresh-baked goods and fine dining in the heart of Nalgonda. Order online or reserve a table.",
  openGraph: {
    title: "Aroma Cafe & Restaurant — Nalgonda",
    description: "Specialty coffee, fresh-baked goods and fine dining in Nalgonda.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
