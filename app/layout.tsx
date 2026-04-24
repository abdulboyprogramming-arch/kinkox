import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Web3Provider } from '@/components/Web3/Web3Provider';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KinkoX - Save to Earn Platform',
  description: 'Deposit ETH, earn interest, and grow your wealth with KinkoX secure savings platform',
  keywords: 'crypto savings, ETH staking, DeFi, earn interest, blockchain savings',
  authors: [{ name: 'Team KinkoX' }],
  openGraph: {
    title: 'KinkoX - Save to Earn Platform',
    description: 'Secure your financial future with KinkoX',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <NotificationProvider>
            <Web3Provider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster position="bottom-right" />
            </Web3Provider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
