import type { Metadata } from 'next';
import { Inter, Noto_Sans_Bengali, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-bengali',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Initiated Person Directory | Ramakrishna Math & Mission',
  description: 'Searchable directory database of initiated persons supporting Bengali and English records.',
  keywords: ['Ramakrishna Math', 'Initiated Person', 'Diksha Directory', 'Bengali Directory', 'RKM Database'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${inter.variable} ${notoSansBengali.variable} ${jetbrainsMono.variable}`}>
      <body className="d-flex flex-column min-vh-100 bg-light">
        <LanguageProvider>
          <Header />
          <main className="flex-grow-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
