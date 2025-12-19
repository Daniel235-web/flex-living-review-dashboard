import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Sidebar } from '../components/layout/sidebar';
import { Header } from '../components/layout/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flex Living Reviews Dashboard',
  description: 'Manage and analyze guest reviews for Flex Living properties',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <Providers>
         
          <Sidebar />
          <div className="md:ml-64"> 
            <Header />
            <main className="p-4 md:p-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}