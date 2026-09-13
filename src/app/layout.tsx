import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

export const metadata: Metadata = {
  title: "Smart Event Experience — Real-Time Venue & SOS Platform",
  description: "Lightweight real-time event guidance, instant emergency SOS dispatch, and organizer broadcasts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-[#111111] selection:text-white">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
