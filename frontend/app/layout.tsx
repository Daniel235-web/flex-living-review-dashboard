import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";

// Google Fonts disabled for offline build; rely on system/tailwind fonts

export const metadata: Metadata = {
  title: "FlexLiving DAO — Decentralized Co-Living",
  description:
    "Trustless co-living platform with DeFi rent escrow, AI reviews, soulbound reputation, and DAO governance on Polkadot Hub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`antialiased min-h-screen`}>
        <Providers>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
          <footer className="border-t border-white/[0.04] mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-linear-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">FL</span>
                </div>
                <span className="text-[12px] text-white/20">FlexLiving DAO</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[11px] text-white/15">Polkadot Hub</span>
                <span className="text-[11px] text-white/15">OpenZeppelin 5.x</span>
                <span className="text-[11px] text-white/15">Solidity 0.8.28</span>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
