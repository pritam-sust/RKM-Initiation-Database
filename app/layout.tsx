import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
    <html lang="bn">
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
