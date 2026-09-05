import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tagmanews.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Tagma News • Portal de Notícias em Tempo Real',
    template: '%s | Tagma News',
  },
  description: 'Jornalismo independente, cobertura de política, economia, tecnologia, internacional, esportes e resultados de loterias em tempo real.',
  keywords: ['notícias', 'jornalismo', 'brasil', 'política', 'economia', 'tecnologia', 'loterias', 'tagma news'],
  authors: [{ name: 'Redação Tagma News' }],
  creator: 'Tagma News',
  publisher: 'Tagma News',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'Tagma News',
    title: 'Tagma News • Portal de Notícias em Tempo Real',
    description: 'Informação ágil, cobertura completa dos fatos no Brasil e no mundo.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tagma News • Jornalismo Independente',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tagma News • Portal de Notícias em Tempo Real',
    description: 'Informação ágil, cobertura completa dos fatos no Brasil e no mundo.',
    creator: '@tagmanews',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Tagma News',
    url: siteUrl,
    logo: `${siteUrl}/og-image.png`,
    sameAs: ['https://twitter.com/tagmanews'],
    publishingPrinciples: `${siteUrl}/sobre`,
    correctionsPolicy: `${siteUrl}/sobre`,
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tagma News',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/busca?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#fcf9f8] text-[#1c1b1b]">
        <Header />
        <div id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
