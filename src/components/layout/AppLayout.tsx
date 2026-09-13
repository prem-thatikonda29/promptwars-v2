import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface AppLayoutProps {
  children: React.ReactNode;
  variant?: "attendee" | "organizer";
}

export function AppLayout({ children, variant = "attendee" }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      {/* Google Brand 4-Color Accent Line */}
      <div className="google-color-bar" />

      {/* Header Nav */}
      <Header variant={variant} />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 flex flex-col gap-5">
        {children}
      </main>

      {/* Footer Nav */}
      <Footer variant={variant} />
    </div>
  );
}
