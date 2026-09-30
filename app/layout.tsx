import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NFL Analytics Dashboard",
  description: "NFL Analytics Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}