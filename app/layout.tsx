import type { Metadata, Viewport } from "next";
import { preconnect } from "react-dom";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "Ephemeral Reverie",
    template: "%s | Ephemeral Reverie",
  },
  description:
    "Ephemeral Reverie is an AI-driven independent digital production studio creating highly stylized short films.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Open the connections to Bunny early so the hero video starts sooner.
  preconnect("https://player.mediadelivery.net");
  preconnect("https://vz-8b01c340-1ec.b-cdn.net");
  return (
    <html lang="en">
      <body className="text-white antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
