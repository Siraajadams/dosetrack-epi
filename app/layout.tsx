import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DoseTrack EPI",
  description:
    "Immunisation and Vaccine Inventory Management Platform",
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
