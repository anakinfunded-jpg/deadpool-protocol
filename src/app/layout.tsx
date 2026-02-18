import type { Metadata } from "next";
import { Sora, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "DEADPOOL — The Token Afterlife Protocol",
  description:
    "98.6% of pump.fun tokens die within 24 hours. DEADPOOL monitors the graveyard, ranks revival opportunities, and powers community takeovers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg text-white font-body antialiased">
        <Providers>
          <div className="min-h-screen relative">
            <Nav />
            <main className="relative z-[1]">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
