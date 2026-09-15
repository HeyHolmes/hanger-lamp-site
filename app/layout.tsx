import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl = "https://hangerlamp.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Hanger Lamp | Wall-Mounted Teak Lamp & Utility Rack",
  description:
    "Hanger Lamp is a wall-mounted teak lamp and utility rack, crafted in America from solid teak and machined aluminum.",
  applicationName: "Hanger Lamp",
  keywords: [
    "hanger lamp",
    "wall mounted lamp",
    "wall mounted sconce",
    "teak lamp",
    "utility rack",
    "coat rack lamp",
    "American made lighting",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Hanger Lamp",
    title: "Hanger Lamp | Wall-Mounted Teak Lamp & Utility Rack",
    description:
      "A wall-mounted teak lamp and utility rack, crafted in America from solid teak and machined aluminum.",
    images: [
      {
        url: "/images/productshots/_0.webp",
        width: 1200,
        height: 1200,
        alt: "Hanger Lamp wall-mounted teak lamp and utility rack",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hanger Lamp | Wall-Mounted Teak Lamp & Utility Rack",
    description:
      "A wall-mounted teak lamp and utility rack, crafted in America from solid teak and machined aluminum.",
    images: ["/images/productshots/_0.webp"],
  },
  icons: {
    icon: "/images/fav-icon.png",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: "Hanger Lamp",
      description:
        "A wall-mounted teak lamp and utility rack, crafted in America from solid teak and machined aluminum.",
      inLanguage: "en-US",
    },
    {
      "@type": "Product",
      "@id": `${siteUrl}/#product`,
      name: "Hanger Lamp",
      url: `${siteUrl}/`,
      image: [
        `${siteUrl}/images/productshots/_0.webp`,
        `${siteUrl}/images/productshots/_1.webp`,
        `${siteUrl}/images/productshots/_2.webp`,
      ],
      description:
        "A wall-mounted sconce and functional hanger crafted in America from solid teak and machined aluminum.",
      material: ["Solid teak", "6061 aluminum", "Stainless steel hardware"],
      category: "Wall-mounted lighting",
      countryOfOrigin: {
        "@type": "Country",
        name: "United States",
      },
      brand: {
        "@type": "Brand",
        name: "Hanger Lamp",
      },
    },
  ],
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
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,700&f[]=erode@400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
