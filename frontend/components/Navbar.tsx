"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain, useChainId } from "wagmi";
import { useState, useEffect, type ReactNode } from "react";
import { formatUnits } from "viem";
import { polkadotHubTestnet } from "@/lib/chains";
import { Building2, Lock, Star, Trophy, Vote, Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isWrongNetwork = isConnected && chainId !== polkadotHubTestnet.id;

  // Auto-switch to correct chain on connect
  useEffect(() => {
    if (isWrongNetwork && switchChain) {
      switchChain({ chainId: polkadotHubTestnet.id });
    }
  }, [isConnected, chainId, isWrongNetwork, switchChain]);

  type NavLink = { href: string; label: string; icon: string | ReactNode };
  const navLinks: NavLink[] = [
    { href: "/", label: "Dashboard", icon: "◈" },
    { href: "/properties", label: "Properties", icon: <Building2 size={16} /> },
    { href: "/escrow", label: "Escrow", icon: <Lock size={16} /> },
    { href: "/reviews", label: "Reviews", icon: <Star size={16} /> },
    { href: "/reputation", label: "Reputation", icon: <Trophy size={16} /> },
    { href: "/governance", label: "Governance", icon: <Vote size={16} /> },
  ];

  return (
    <nav className="sticky top-0 z-50">
      <div className="glass-subtle border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-900/30 group-hover:shadow-violet-900/50 transition-shadow">
                <span className="text-white text-sm font-bold">FL</span>
              </div>
              <span className="font-semibold text-[15px] text-white/90 hidden sm:block tracking-tight">
                FlexLiving
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-0.5 bg-white/[0.03] rounded-xl p-1">
              {navLinks.map((l) => {
                const isActive = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`relative px-3.5 py-1.5 rounded-lg text-[13px] transition-all duration-300 flex items-center gap-2 ${
                      isActive ? "text-white bg-white/[0.08] shadow-sm" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {typeof l.icon === "string" ? <span>{l.icon}</span> : l.icon}
                    {l.label}
                  </Link>
                );
              })}
            </div>

            {/* Wallet */}
            <div className="flex items-center gap-2.5">
              {isConnected ? (
                <div className="flex items-center gap-2">
                  {balance && (
                    <div className="hidden sm:flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-xl">
                      <div className="pulse-dot" />
                      <span className="text-[12px] text-white/50 font-mono">
                        {parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(3)} {balance.symbol}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => disconnect()}
                    className="text-[12px] bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white/60 hover:text-white/90 px-3.5 py-1.5 rounded-xl transition-all duration-300 font-mono"
                  >
                    {address?.slice(0, 6)}…{address?.slice(-4)}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    const c = connectors.find((c) => c.id === "injected") ?? connectors[0];
                    if (c) connect({ connector: c });
                  }}
                  className="text-[13px] bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-5 py-2 rounded-xl transition-all duration-300 font-medium shadow-lg shadow-violet-900/25 hover:shadow-violet-900/50 active:scale-[0.97]"
                >
                  Connect
                </button>
              )}

              {/* Mobile toggle */}
              <button
                className="md:hidden w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden pb-4 space-y-1 animate-fadeUp">
              {navLinks.map((l) => {
                const isActive = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                      isActive
                        ? "text-white bg-white/[0.08]"
                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-xs opacity-50">{l.icon}</span>
                    {l.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
