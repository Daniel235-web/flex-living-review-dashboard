"use client";

import { useAccount } from "wagmi";
import { Card, Badge, StatCard, PageHeader, EmptyState } from "@/components/ui";
import {
  useHasSBT,
  useReputation,
  useFlexBalance,
  formatFLEX,
  TIER_NAMES,
  TIER_EMOJIS,
} from "@/lib/hooks";

const TIER_THRESHOLDS = [0, 100, 250, 500, 1000];
const TIER_GRADIENTS = [
  "from-gray-400 to-gray-500",
  "from-emerald-400 to-cyan-400",
  "from-blue-400 to-indigo-400",
  "from-violet-400 to-fuchsia-400",
  "from-amber-400 to-orange-400",
];

export default function ReputationPage() {
  const { address, isConnected } = useAccount();
  const { data: hasSBT } = useHasSBT(address);
  const { data: reputation } = useReputation(address);
  const { data: flexBal } = useFlexBalance(address);

  const rep = reputation as
    | {
        points: bigint;
        onTimePayments: bigint;
        positiveReviews: bigint;
        tier: number;
        governanceVotes: bigint;
        disputeWins: bigint;
        identityVerified: boolean;
      }
    | undefined;

  const points = rep ? Number(rep.points) : 0;
  const tier = rep ? rep.tier : 0;
  const nextTier = tier < 4 ? tier + 1 : 4;
  const nextThreshold = TIER_THRESHOLDS[nextTier] ?? 1000;
  const progress =
    tier >= 4 ? 100 : ((points - TIER_THRESHOLDS[tier]) / (nextThreshold - TIER_THRESHOLDS[tier])) * 100;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reputation"
        subtitle="Your soulbound reputation token — earned, not bought"
        icon="🎖️"
      />

      {!isConnected ? (
        <Card>
          <EmptyState icon="🔗" message="Connect your wallet to view your reputation" />
        </Card>
      ) : !hasSBT ? (
        <Card glow="purple" className="animate-fadeUp">
          <div className="text-center py-8">
            <span className="text-5xl block mb-4">🎖️</span>
            <h3 className="text-xl font-bold text-white/90 mb-2">No Reputation SBT</h3>
            <p className="text-white/40 text-sm mb-4 max-w-md mx-auto">
              You don&apos;t have a soulbound reputation token yet. An admin needs to mint one for you.
            </p>
            <Badge color="yellow">Soulbound tokens cannot be transferred or purchased</Badge>
          </div>
        </Card>
      ) : (
        <>
          <div className="glass rounded-2xl p-8 text-center relative overflow-hidden animate-fadeUp">
            <div className={`absolute top-0 left-1/4 w-40 h-40 rounded-full bg-linear-to-br ${TIER_GRADIENTS[tier]} opacity-[0.06] blur-3xl orb`} />
            <div className={`absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-linear-to-br ${TIER_GRADIENTS[tier]} opacity-[0.04] blur-2xl orb`} style={{ animationDelay: "-3s" }} />
            <div className="relative">
              <span className="text-6xl block mb-4 drop-shadow-2xl">{TIER_EMOJIS[tier]}</span>
              <h2 className={`text-3xl font-bold bg-linear-to-r ${TIER_GRADIENTS[tier]} bg-clip-text text-transparent mb-1`}>
                {TIER_NAMES[tier]} Tier
              </h2>
              <p className="text-lg text-white/50 font-mono">{points} Points</p>

              {tier < 4 && (
                <div className="max-w-md mx-auto mt-6">
                  <div className="flex justify-between text-[11px] text-white/25 mb-1.5 font-mono">
                    <span>{TIER_NAMES[tier]}</span>
                    <span>
                      {TIER_NAMES[nextTier]} ({nextThreshold} pts)
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-3 overflow-hidden">
                    <div
                      className={`bg-linear-to-r ${TIER_GRADIENTS[tier]} h-3 rounded-full transition-all duration-700`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-[12px] text-white/25 mt-1.5">
                    {nextThreshold - points} points to {TIER_NAMES[nextTier]}
                  </p>
                </div>
              )}
              {tier >= 4 && (
                <p className="text-sm text-emerald-400 mt-4 flex items-center justify-center gap-2">
                  <span className="pulse-dot" /> Maximum tier reached!
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 stagger">
            <StatCard
              icon="💰"
              label="On-Time Payments"
              value={rep?.onTimePayments?.toString() ?? "0"}
              gradient="from-emerald-400 to-cyan-400"
            />
            <StatCard
              icon="⭐"
              label="Positive Reviews"
              value={rep?.positiveReviews?.toString() ?? "0"}
              gradient="from-amber-400 to-orange-400"
            />
            <StatCard
              icon="🗳️"
              label="Gov Votes"
              value={rep?.governanceVotes?.toString() ?? "0"}
              gradient="from-blue-400 to-indigo-400"
            />
            <StatCard
              icon="⚖️"
              label="Dispute Wins"
              value={rep?.disputeWins?.toString() ?? "0"}
              gradient="from-violet-400 to-fuchsia-400"
            />
            <StatCard
              icon="🪙"
              label="FLEX Balance"
              value={formatFLEX(flexBal as bigint)}
              gradient="from-pink-500 to-purple-500"
            />
            <StatCard
              icon="🆔"
              label="Identity"
              value={rep?.identityVerified ? "Verified ✓" : "Unverified"}
              gradient="from-gray-400 to-gray-500"
            />
          </div>

          <div className="animate-fadeUp" style={{ animationDelay: "0.1s" }}>
            <Card title="How to Earn Points" icon="📈">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 stagger">
                {[
                  { action: "On-Time Payment", points: "+10", icon: "💸", color: "from-emerald-400 to-cyan-400" },
                  { action: "Positive Review", points: "+5", icon: "⭐", color: "from-amber-400 to-orange-400" },
                  { action: "Governance Vote", points: "+2", icon: "🗳️", color: "from-blue-400 to-indigo-400" },
                  { action: "Dispute Win", points: "+15", icon: "⚖️", color: "from-violet-400 to-fuchsia-400" },
                  { action: "Identity Verify", points: "+50", icon: "🆔", color: "from-pink-400 to-rose-400" },
                ].map((a) => (
                  <div
                    key={a.action}
                    className="glass rounded-xl p-5 text-center group hover:border-white/[0.08] transition-all relative overflow-hidden"
                  >
                    <div className={`absolute -top-6 -right-6 w-16 h-16 rounded-full bg-linear-to-br ${a.color} opacity-[0.06] blur-xl`} />
                    <div className="relative">
                      <span className="text-xl block mb-2">{a.icon}</span>
                      <p className={`text-lg font-bold bg-linear-to-r ${a.color} bg-clip-text text-transparent`}>
                        {a.points}
                      </p>
                      <p className="text-[11px] text-white/25 mt-0.5">{a.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="animate-fadeUp" style={{ animationDelay: "0.2s" }}>
            <Card title="Tier Progression" icon="🏆">
              <div className="flex flex-wrap justify-center gap-3">
                {TIER_NAMES.map((name, i) => (
                  <div
                    key={name}
                    className={`flex-1 min-w-[120px] text-center p-4 rounded-xl transition-all ${
                      i === tier
                        ? "glass glow-purple"
                        : i < tier
                        ? "glass"
                        : "bg-white/[0.02] border border-white/[0.04] opacity-40"
                    }`}
                  >
                    <span className="text-2xl block mb-1">{TIER_EMOJIS[i]}</span>
                    <p className="text-sm font-semibold text-white/80">{name}</p>
                    <p className="text-[11px] text-white/25 font-mono">{TIER_THRESHOLDS[i]}+ pts</p>
                    {i === tier && <Badge color="purple">Current</Badge>}
                    {i < tier && <Badge color="green">✓</Badge>}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
