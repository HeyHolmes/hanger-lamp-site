import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hanger Lamp",
  description: "Bringing together two designs that have been around since the beginning of recorded history.",
  icons: {
    icon: "/images/fav-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700&f[]=erode@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
