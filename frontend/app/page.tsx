"use client";

import { useAccount } from "wagmi";
import { StatCard, Card, Badge, PageHeader } from "@/components/ui";
import {
  useFlexBalance,
  useFlexTotalSupply,
  usePropertyCount,
  useActivePropertyCount,
  useHasSBT,
  useReputation,
  useUSDCBalance,
  useMintTestUSDC,
  useMintTestSBT,
  formatFLEX,
  formatUSDC,
  TIER_NAMES,
  TIER_EMOJIS,
} from "@/lib/hooks";
import {
  Coins,
  DollarSign,
  Building2,
  Trophy,
  Home,
  Lock,
  Star,
  Vote,
  BarChart3,
  Zap,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: flexBalance } = useFlexBalance(address);
  const { data: flexSupply } = useFlexTotalSupply();
  const { data: totalProperties } = usePropertyCount();
  const { data: activeProperties } = useActivePropertyCount();
  const { data: hasSBT } = useHasSBT(address);
  const { data: reputation } = useReputation(address);
  const { data: usdcBalance } = useUSDCBalance(address);

  if (!isConnected) return <HeroSection />;

  // getReputation returns a struct: { points, onTimePayments, positiveReviews, governanceVotes, disputeWins, identityVerified, tier, lastUpdated }
  const repData = reputation as { points: bigint; tier: number } | undefined;
  const tier = repData ? Number(repData.tier) : 0;
  const points = repData ? Number(repData.points) : 0;

  return (
    <div className="space-y-6 stagger">
      <PageHeader title="Dashboard" subtitle="Welcome back to FlexLiving DAO" icon="◈" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Coins className="text-violet-400" size={20} />}
          label="FLEX Balance"
          value={formatFLEX(flexBalance as bigint)}
          gradient="from-violet-500 to-fuchsia-500"
        />
        <StatCard
          icon={<DollarSign className="text-emerald-400" size={20} />}
          label="USDC Balance"
          value={`$${formatUSDC(usdcBalance as bigint)}`}
          gradient="from-emerald-400 to-teal-400"
        />
        <StatCard
          icon={<Building2 className="text-blue-400" size={20} />}
          label="Active Properties"
          value={`${activeProperties?.toString() ?? "0"} / ${totalProperties?.toString() ?? "0"}`}
          gradient="from-blue-400 to-indigo-500"
        />
        <StatCard
          icon={<Trophy className="text-amber-400" size={20} />}
          label="Reputation"
          value={hasSBT ? `${TIER_NAMES[tier]} - ${points} pts` : "No SBT"}
          gradient="from-amber-400 to-orange-500"
        />
      </div>
      <TestTokensSection
        address={address}
        hasSBT={hasSBT as boolean | undefined}
        usdcBalance={usdcBalance as bigint | undefined}
      />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <Card title="FLEX Tokenomics" icon="📊">
            <div className="space-y-5">
              <div className="flex justify-between items-baseline text-sm">
                <span className="text-white/40">Circulating</span>
                <span className="text-white/80 font-mono text-xs">
                  {formatFLEX(flexSupply as bigint)} / 100M
                </span>
              </div>
              <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-linear-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${flexSupply ? Math.max((Number(flexSupply) / 1e26) * 100, 2) : 2}%` }}
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Rent", value: "50", color: "text-fuchsia-400" },
                  { label: "Review", value: "10", color: "text-violet-400" },
                  { label: "Vote", value: "5", color: "text-blue-400" },
                  { label: "Referral", value: "100", color: "text-emerald-400" },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]"
                  >
                    <p className={`text-lg font-bold ${r.color}`}>{r.value}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">{r.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title="Quick Actions" icon="⚡">
            <div className="space-y-2">
              {[
                {
                  href: "/properties",
                  icon: "⬡",
                  title: "Properties",
                  desc: "Browse spaces",
                  color: "group-hover:text-blue-400",
                },
                {
                  href: "/escrow",
                  icon: "◇",
                  title: "Pay Rent",
                  desc: "Earn 50 FLEX",
                  color: "group-hover:text-emerald-400",
                },
                {
                  href: "/reviews",
                  icon: "☆",
                  title: "Reviews",
                  desc: "Earn 10 FLEX",
                  color: "group-hover:text-amber-400",
                },
                {
                  href: "/reputation",
                  icon: "◎",
                  title: "Reputation",
                  desc: "View SBT tier",
                  color: "group-hover:text-violet-400",
                },
                {
                  href: "/governance",
                  icon: "△",
                  title: "Governance",
                  desc: "Vote on proposals",
                  color: "group-hover:text-fuchsia-400",
                },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white/[0.04] transition-all duration-300 group"
                >
                  <span
                    className={`text-sm w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/30 ${a.color} transition-colors`}
                  >
                    {a.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-medium text-white/70 ${a.color} transition-colors`}>
                      {a.title}
                    </p>
                    <p className="text-[11px] text-white/25">{a.desc}</p>
                  </div>
                  <svg
                    className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <Card title="Smart Contract Architecture" icon="🏗️">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 stagger">
          {[
            {
              name: "FlexToken",
              icon: "🪙",
              desc: "ERC20 + Votes",
              color: "from-fuchsia-500/10 to-violet-500/10 border-fuchsia-500/10",
            },
            {
              name: "PropertyNFT",
              icon: "🏠",
              desc: "ERC721 Listings",
              color: "from-blue-500/10 to-cyan-500/10 border-blue-500/10",
            },
            {
              name: "RentEscrow",
              icon: "💰",
              desc: "DeFi Payments",
              color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/10",
            },
            {
              name: "ReviewSystem",
              icon: "⭐",
              desc: "AI Sentiment",
              color: "from-amber-500/10 to-orange-500/10 border-amber-500/10",
            },
            {
              name: "ReputationSBT",
              icon: "🎖️",
              desc: "Soulbound",
              color: "from-violet-500/10 to-purple-500/10 border-violet-500/10",
            },
            {
              name: "FlexGovernor",
              icon: "🗳️",
              desc: "DAO Gov",
              color: "from-pink-500/10 to-rose-500/10 border-pink-500/10",
            },
          ].map((c) => (
            <div
              key={c.name}
              className={`text-center p-4 rounded-xl bg-linear-to-b ${c.color} border transition-all duration-300 hover:scale-[1.03]`}
            >
              <span className="text-xl block mb-2">{c.icon}</span>
              <p className="text-[12px] font-semibold text-white/80">{c.name}</p>
              <p className="text-[11px] text-white/30 mt-0.5">{c.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TEST TOKENS SECTION — Self-serve token minting for judges
   ═══════════════════════════════════════════════════════ */
function TestTokensSection({
  address,
  hasSBT,
  usdcBalance,
}: {
  address?: `0x${string}`;
  hasSBT?: boolean;
  usdcBalance?: bigint;
}) {
  const {
    mintUSDC,
    isPending: isUSDCPending,
    isConfirming: isUSDCConfirming,
    isSuccess: isUSDCSuccess,
  } = useMintTestUSDC();
  const {
    mintSBT,
    isPending: isSBTPending,
    isConfirming: isSBTConfirming,
    isSuccess: isSBTSuccess,
  } = useMintTestSBT();
  const [usdcMinted, setUSDCMinted] = useState(false);
  const [sbtMinted, setSBTMinted] = useState(false);
  const [sbtError, setSBTError] = useState<string | null>(null);

  const handleMintUSDC = () => {
    if (address) {
      mintUSDC(address);
      setUSDCMinted(true);
    }
  };

  const handleMintSBT = () => {
    setSBTError(null);
    if (address) {
      try {
        mintSBT(address);
        setSBTMinted(true);
      } catch (error) {
        setSBTError("Failed to mint SBT. You may already have one.");
      }
    }
  };

  // Hide section if user already has good balances
  const hasEnoughUSDC = Boolean(usdcBalance && usdcBalance > BigInt(5000) * BigInt(10) ** BigInt(6));
  const shouldShow = !hasEnoughUSDC || !hasSBT;

  if (!shouldShow) return null;

  return (
    <Card title="🎁 Get Test Tokens" icon="⚡">
      <div className="space-y-4">
        <p className="text-sm text-white/60">
          Mint test tokens to interact with the platform. Each wallet can mint once.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Mint USDC Button */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="text-emerald-400" size={18} />
                <span className="text-sm font-semibold text-emerald-300">Mock USDC</span>
              </div>
              {isUSDCSuccess || usdcMinted ? (
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                  ✓ Minted
                </span>
              ) : null}
            </div>
            <p className="text-xs text-white/40 mb-3">
              Mint 10,000 USDC for rent payments and escrow interactions
            </p>
            <button
              onClick={handleMintUSDC}
              disabled={isUSDCPending || isUSDCConfirming || isUSDCSuccess || usdcMinted || hasEnoughUSDC}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                isUSDCPending || isUSDCConfirming
                  ? "bg-white/10 text-white/50 cursor-wait"
                  : isUSDCSuccess || usdcMinted || hasEnoughUSDC
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-emerald-500/30 text-emerald-300 hover:bg-emerald-500/40 active:scale-95 cursor-pointer"
              }`}
            >
              {isUSDCPending ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Signing...
                </>
              ) : isUSDCConfirming ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Confirming...
                </>
              ) : isUSDCSuccess || usdcMinted || hasEnoughUSDC ? (
                <>✓ Done</>
              ) : (
                "Mint 10,000 USDC"
              )}
            </button>
          </div>

          {/* Mint SBT Button */}
          <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="text-violet-400" size={18} />
                <span className="text-sm font-semibold text-violet-300">Reputation SBT</span>
              </div>
              {isSBTSuccess || sbtMinted || hasSBT ? (
                <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
                  ✓ Minted
                </span>
              ) : null}
            </div>
            <p className="text-xs text-white/40 mb-3">
              Mint your soulbound reputation token to start building trust
            </p>
            {sbtError && (
              <p className="text-xs text-red-300 mb-2 p-2 bg-red-500/10 rounded">
                ⚠️ {sbtError}
              </p>
            )}
            <button
              onClick={handleMintSBT}
              disabled={isSBTPending || isSBTConfirming || isSBTSuccess || sbtMinted || hasSBT}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                isSBTPending || isSBTConfirming
                  ? "bg-white/10 text-white/50 cursor-wait"
                  : isSBTSuccess || sbtMinted || hasSBT
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-violet-500/30 text-violet-300 hover:bg-violet-500/40 active:scale-95 cursor-pointer"
              }`}
            >
              {isSBTPending ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Signing...
                </>
              ) : isSBTConfirming ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Confirming...
                </>
              ) : isSBTSuccess || sbtMinted || hasSBT ? (
                <>✓ Done</>
              ) : (
                "Mint SBT"
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-white/40 border-t border-white/10 pt-3">
          💡 <strong>Tip:</strong> After minting, refresh your balances and start testing! Pay rent, write
          reviews, and earn reputation points.
        </p>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO — Immersive cinematic landing
   ═══════════════════════════════════════════════════════ */
function HeroSection() {
  const features = [
    {
      icon: "💰",
      title: "DeFi Rent Escrow",
      desc: "USDC-powered escrow with automated late fees, security deposits, and instant FLEX token rewards for on-time payments.",
      gradient: "from-emerald-500 to-teal-500",
      tag: "50 FLEX / payment",
    },
    {
      icon: "🤖",
      title: "AI-Powered Reviews",
      desc: "Oracle-verified sentiment analysis prevents fake reviews. Community voting ensures quality. Earn tokens for honest feedback.",
      gradient: "from-amber-500 to-orange-500",
      tag: "10 FLEX / review",
    },
    {
      icon: "🎖️",
      title: "Soulbound Reputation",
      desc: "Non-transferable ERC721 tokens track trust across 5 tiers — from Bronze to Diamond. Your reputation is earned, never bought.",
      gradient: "from-violet-500 to-purple-500",
      tag: "5 tiers",
    },
    {
      icon: "��️",
      title: "DAO Governance",
      desc: "Token-weighted voting with timelock protection. Propose changes, vote on platform decisions, shape the future of co-living.",
      gradient: "from-fuchsia-500 to-pink-500",
      tag: "4% quorum",
    },
  ];

  const contracts = [
    { name: "FlexToken", standard: "ERC-20 + Votes", icon: "🪙" },
    { name: "PropertyNFT", standard: "ERC-721", icon: "🏠" },
    { name: "RentEscrow", standard: "DeFi", icon: "💰" },
    { name: "ReviewSystem", standard: "AI Oracle", icon: "⭐" },
    { name: "ReputationSBT", standard: "Soulbound", icon: "🎖️" },
    { name: "FlexGovernor", standard: "Governor", icon: "🗳️" },
  ];

  const stats = [
    { value: "7", label: "OZ Libraries" },
    { value: "6", label: "Smart Contracts" },
    { value: "32", label: "Tests Passing" },
    { value: "100M", label: "Max Supply" },
  ];

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
      {/* ═══ HERO TOP SECTION ═══ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4">
        {/* Background layers */}
        <div className="hero-grid" />
        <div className="aurora" />
        <div className="orb w-[600px] h-[600px] bg-violet-600 -top-40 -left-40" />
        <div
          className="orb w-[500px] h-[500px] bg-fuchsia-600 -bottom-32 -right-32"
          style={{ animationDelay: "-7s" }}
        />
        <div
          className="orb w-[300px] h-[300px] bg-blue-600 top-1/3 right-1/4"
          style={{ animationDelay: "-12s" }}
        />

        {/* Decorative spinning rings */}
        <div className="spin-ring w-[500px] h-[500px] left-1/2 top-1/2" />
        <div className="spin-ring-reverse w-[700px] h-[700px] left-1/2 top-1/2" />

        {/* Floating protocol tags */}
        <div className="absolute top-[18%] left-[8%] float-tag hidden lg:block">
          <div className="glass rounded-xl px-3 py-2 text-[11px] text-white/30 flex items-center gap-2">
            <span className="text-violet-400">◆</span> ERC-20 Votes
          </div>
        </div>
        <div className="absolute top-[25%] right-[10%] float-tag-delayed hidden lg:block">
          <div className="glass rounded-xl px-3 py-2 text-[11px] text-white/30 flex items-center gap-2">
            <span className="text-fuchsia-400">◆</span> Soulbound SBT
          </div>
        </div>
        <div className="absolute bottom-[30%] left-[12%] float-tag-slow hidden lg:block">
          <div className="glass rounded-xl px-3 py-2 text-[11px] text-white/30 flex items-center gap-2">
            <span className="text-emerald-400">◆</span> DeFi Escrow
          </div>
        </div>
        <div className="absolute bottom-[22%] right-[8%] float-tag hidden lg:block">
          <div className="glass rounded-xl px-3 py-2 text-[11px] text-white/30 flex items-center gap-2">
            <span className="text-amber-400">◆</span> AI Oracle
          </div>
        </div>

        {/* Main content */}
        <div className="relative text-center max-w-4xl mx-auto z-10">
          {/* Live badge */}
          <div className="animate-fadeUp inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.06] rounded-full px-5 py-2 mb-10 backdrop-blur-sm">
            <div className="pulse-dot" />
            <span className="text-[12px] text-white/50 tracking-wider uppercase font-medium">
              Live on Polkadot Hub
            </span>
            <span className="text-[10px] text-white/20">•</span>
            <span className="text-[11px] text-violet-400/70 font-mono">Chain 420420417</span>
          </div>

          {/* Title */}
          <h1 className="animate-fadeUp delay-100 text-6xl sm:text-8xl lg:text-9xl font-black tracking-[-0.04em] leading-[0.85] mb-8">
            <span className="bg-linear-to-r from-violet-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent text-glow-purple">
              Flex
            </span>
            <span className="bg-linear-to-r from-white/95 to-white/70 bg-clip-text text-transparent">
              Living
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fadeUp delay-200 text-lg sm:text-xl text-white/30 max-w-2xl mx-auto mb-6 leading-relaxed font-light">
            The <span className="text-white/60">decentralized co-living protocol</span> with trustless rent
            payments, AI-verified reviews, and soulbound reputation — all governed by its community.
          </p>

          {/* Tech credits */}
          <div className="animate-fadeUp delay-300 flex items-center justify-center gap-3 mb-12">
            <span className="text-[12px] text-white/20 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-violet-500" />
              OpenZeppelin 5.x
            </span>
            <span className="text-white/10">·</span>
            <span className="text-[12px] text-white/20 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-fuchsia-500" />
              Solidity 0.8.28
            </span>
            <span className="text-white/10">·</span>
            <span className="text-[12px] text-white/20 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-pink-500" />
              Polkadot Hub
            </span>
          </div>

          {/* Protocol badges */}
          <div className="animate-fadeUp delay-400 flex flex-wrap justify-center gap-2 mb-16">
            {[
              { label: "ERC-20 Votes", color: "purple" as const },
              { label: "ERC-721 NFT", color: "blue" as const },
              { label: "DeFi Escrow", color: "green" as const },
              { label: "Soulbound SBT", color: "pink" as const },
              { label: "AI Sentiment", color: "yellow" as const },
              { label: "Governor DAO", color: "red" as const },
            ].map((b) => (
              <Badge key={b.label} color={b.color}>
                {b.label}
              </Badge>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="animate-fadeUp delay-500 flex flex-col items-center gap-2">
            <span className="text-[11px] text-white/15 tracking-widest uppercase">Explore</span>
            <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1.5">
              <div className="w-1 h-2 rounded-full bg-white/20 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="relative border-y border-white/[0.04] bg-white/[0.01] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={s.label} className={`text-center animate-fadeUp delay-${(i + 1) * 100}`}>
              <p className="text-3xl sm:text-4xl font-black bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="text-[12px] text-white/25 mt-1 tracking-wider uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16 animate-fadeUp">
          <p className="text-[12px] text-violet-400/60 tracking-widest uppercase mb-3 font-medium">
            Protocol Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white/90 tracking-tight">
            Built for trust. Designed for scale.
          </h2>
          <p className="text-white/25 text-sm mt-3 max-w-lg mx-auto">
            Six composable smart contracts powered by seven OpenZeppelin libraries, deployed on Polkadot Hub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`glass rounded-2xl p-7 hover-lift group animate-fadeUp delay-${(i + 1) * 100}`}
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`w-12 h-12 rounded-2xl bg-linear-to-br ${f.gradient} flex items-center justify-center text-xl opacity-80 group-hover:opacity-100 transition-opacity shadow-lg`}
                >
                  {f.icon}
                </div>
                <span className="text-[10px] text-white/20 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full font-mono tracking-wide">
                  {f.tag}
                </span>
              </div>
              <h3
                className={`text-lg font-bold bg-linear-to-r ${f.gradient} bg-clip-text text-transparent mb-2`}
              >
                {f.title}
              </h3>
              <p className="text-[13px] text-white/30 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CONTRACTS ARCHITECTURE ═══ */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="text-center mb-12 animate-fadeUp">
          <p className="text-[12px] text-fuchsia-400/60 tracking-widest uppercase mb-3 font-medium">
            Architecture
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white/90 tracking-tight">
            6 Contracts. 1 Protocol.
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 stagger">
          {contracts.map((c) => (
            <div key={c.name} className="glass rounded-2xl p-5 text-center hover-lift group cursor-default">
              <span className="text-2xl block mb-3 group-hover:scale-110 transition-transform duration-300">
                {c.icon}
              </span>
              <p className="text-[13px] font-semibold text-white/80 mb-1">{c.name}</p>
              <p className="text-[11px] text-white/25 font-mono">{c.standard}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA BOTTOM ═══ */}
      <section className="relative border-t border-white/[0.04] overflow-hidden">
        <div className="orb w-[400px] h-[400px] bg-violet-600 -bottom-40 left-1/2 -translate-x-1/2" />
        <div className="relative max-w-3xl mx-auto px-4 py-24 text-center">
          <div className="animate-fadeUp">
            <h2 className="text-3xl sm:text-5xl font-bold text-white/90 tracking-tight mb-4">
              Ready to move in?
            </h2>
            <p className="text-white/25 text-sm mb-10 max-w-md mx-auto">
              Connect your wallet to explore properties, pay rent with crypto, build your soulbound
              reputation, and govern the platform.
            </p>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-[13px] text-white/40">Connect wallet above to get started</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[11px] text-white/15">
              <span>Polkadot Hub Testnet</span>
              <span>Chain ID 420420417</span>
              <span>OpenZeppelin 5.x</span>
              <span>Solidity 0.8.28</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
