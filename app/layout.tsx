import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import SessionProvider from "@/components/SessionProvider";
import { LanguageProvider } from "@/lib/i18n";
import PageTransition from "@/components/PageTransition";
import BgToggle from "@/components/BgToggle";
import Footer from "@/components/Footer";
import GlobalErrorTracker from "@/components/GlobalErrorTracker";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["700", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "JS Media",
  description: "Social Media Agentur Dashboard",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${playfair.variable} h-full antialiased bg-animated`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-transparent">
        <SessionProvider>
        <LanguageProvider>
        <ThemeProvider>
          {/* Ambient grid — dark mode only */}
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-grid" style={{ zIndex: 0 }} />

          {/* Ambient gold orbs */}
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
            <div className="ambient-orb-1 absolute rounded-full" style={{ top: "-15%", left: "-8%", width: "65vw", height: "65vh" }} />
            <div className="ambient-orb-2 absolute rounded-full" style={{ top: "-10%", right: "-8%", width: "55vw", height: "60vh" }} />
            <div className="ambient-orb-3 absolute rounded-full" style={{ bottom: "-18%", left: "-5%", width: "55vw", height: "60vh" }} />
            <div className="ambient-orb-4 absolute rounded-full" style={{ bottom: "-12%", right: "-6%", width: "60vw", height: "58vh" }} />
          </div>
          <PageTransition>
            {children}
          </PageTransition>
          <Footer />
          <BgToggle />
          <GlobalErrorTracker />
        </ThemeProvider>
        </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
