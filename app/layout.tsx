import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Pathway Mortgage Operations Portal",
  description: "Operations workspace for mortgage relief specialists",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}