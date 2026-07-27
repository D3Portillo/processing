import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pathway Mortgage Operations Portal",
  description: "Operations workspace for mortgage relief specialists",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}