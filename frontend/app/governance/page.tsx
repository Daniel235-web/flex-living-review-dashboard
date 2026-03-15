"use client";

import { useAccount } from "wagmi";
import { Card, Button, Badge, StatCard, PageHeader, Input, EmptyState } from "@/components/ui";
import { useFlexBalance, useFlexVotes, useDelegateFlex, useFlexTotalSupply, formatFLEX } from "@/lib/hooks";
import { useState } from "react";

export default function GovernancePage() {
  const { address, isConnected } = useAccount();
  const { data: flexBalance } = useFlexBalance(address);
  const { data: votes } = useFlexVotes(address);
  const { data: totalSupply } = useFlexTotalSupply();
  const { delegate, isPending, isConfirming, isSuccess } = useDelegateFlex();
  const [delegatee, setDelegatee] = useState("");

  const votingPower = votes ? Number(votes) : 0;
  const total = totalSupply ? Number(totalSupply) : 1;
  const percentage = ((votingPower / total) * 100).toFixed(4);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Governance"
        subtitle="DAO governance with FlexGovernor + TimelockController"
        icon="🏛️"
      />

      {isConnected && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          <StatCard
            icon="🪙"
            label="FLEX Balance"
            value={formatFLEX(flexBalance as bigint)}
            gradient="from-pink-500 to-purple-500"
          />
          <StatCard
            icon="🗳️"
            label="Voting Power"
            value={formatFLEX(votes as bigint)}
            gradient="from-blue-400 to-indigo-400"
          />
          <StatCard
            icon="📊"
            label="% of Supply"
            value={`${percentage}%`}
            gradient="from-emerald-400 to-cyan-400"
          />
          <StatCard
            icon="📋"
            label="Proposal Threshold"
            value="1,000 FLEX"
            gradient="from-amber-400 to-orange-400"
          />
        </div>
      )}

      {/* Delegation */}
      <div className="animate-fadeUp" style={{ animationDelay: "0.05s" }}>
        <Card title="Delegate Voting Power" icon="🗳️" glow="purple">
          <p className="text-[13px] text-white/35 mb-5">
            To participate in governance, you must delegate your FLEX tokens. You can delegate to yourself or
            another address.
          </p>
          {!isConnected ? (
            <EmptyState icon="🔗" message="Connect wallet to delegate" />
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  onClick={() => address && delegate(address)}
                  loading={isPending || isConfirming}
                  variant="primary"
                >
                  🙋 Delegate to Self
                </Button>
                {isSuccess && <Badge color="green">✅ Delegation successful!</Badge>}
              </div>
              <div className="border-t border-white/[0.04] pt-5">
                <label className="block text-[13px] text-white/40 mb-2 tracking-wide">
                  Or delegate to another address:
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      value={delegatee}
                      onChange={(e) => setDelegatee(e.target.value)}
                      placeholder="0x..."
                      mono
                    />
                  </div>
                  <Button
                    onClick={() => delegate(delegatee as `0x${string}`)}
                    loading={isPending || isConfirming}
                    variant="secondary"
                    disabled={!delegatee.startsWith("0x")}
                  >
                    Delegate
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Governor Parameters */}
      <div className="animate-fadeUp" style={{ animationDelay: "0.1s" }}>
        <Card title="Governor Parameters" icon="⚙️">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {[
              {
                label: "Voting Delay",
                value: "1 day",
                desc: "Time before voting starts after proposal",
                icon: "⏳",
                color: "from-amber-400 to-orange-400",
              },
              {
                label: "Voting Period",
                value: "1 week",
                desc: "Duration of active voting period",
                icon: "📅",
                color: "from-blue-400 to-cyan-400",
              },
              {
                label: "Quorum",
                value: "4%",
                desc: "Minimum participation for valid vote",
                icon: "📊",
                color: "from-emerald-400 to-green-400",
              },
              {
                label: "Timelock",
                value: "1 day",
                desc: "Delay before execution after passing",
                icon: "🔒",
                color: "from-violet-400 to-fuchsia-400",
              },
            ].map((p) => (
              <div
                key={p.label}
                className="glass rounded-xl p-5 text-center group hover:border-white/[0.08] transition-all relative overflow-hidden"
              >
                <div className={`absolute -top-6 -right-6 w-16 h-16 rounded-full bg-linear-to-br ${p.color} opacity-[0.06] blur-xl`} />
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${p.color} mx-auto mb-3 flex items-center justify-center text-lg opacity-80`}>
                    {p.icon}
                  </div>
                  <p className={`text-xl font-bold bg-linear-to-r ${p.color} bg-clip-text text-transparent`}>
                    {p.value}
                  </p>
                  <p className="text-sm font-semibold text-white/60 mt-0.5">{p.label}</p>
                  <p className="text-[11px] text-white/25 mt-1">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Proposal Lifecycle */}
      <div className="animate-fadeUp" style={{ animationDelay: "0.15s" }}>
        <Card title="Proposal Lifecycle" icon="📜">
          <div className="flex flex-col md:flex-row gap-2 items-stretch">
            {[
              { step: "1", title: "Propose", desc: "Need 1,000+ FLEX", color: "from-pink-400 to-rose-400" },
              { step: "2", title: "Voting Delay", desc: "1 day cooldown", color: "from-amber-400 to-orange-400" },
              { step: "3", title: "Active Voting", desc: "1 week period", color: "from-blue-400 to-cyan-400" },
              { step: "4", title: "Queue", desc: "Queue on Timelock", color: "from-violet-400 to-fuchsia-400" },
              { step: "5", title: "Execute", desc: "After 1 day delay", color: "from-emerald-400 to-green-400" },
            ].map((s, i) => (
              <div key={s.step} className="flex-1 flex items-center gap-2">
                <div className="flex-1 glass rounded-xl p-4 text-center group hover:border-white/[0.08] transition-all relative overflow-hidden">
                  <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full bg-linear-to-br ${s.color} opacity-[0.06] blur-lg`} />
                  <div className="relative">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-0.5">
                      Step {s.step}
                    </p>
                    <p className={`text-sm font-semibold bg-linear-to-r ${s.color} bg-clip-text text-transparent`}>
                      {s.title}
                    </p>
                    <p className="text-[11px] text-white/25">{s.desc}</p>
                  </div>
                </div>
                {i < 4 && (
                  <span className="text-white/10 hidden md:block text-lg">→</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Governance Actions */}
      <div className="animate-fadeUp" style={{ animationDelay: "0.2s" }}>
        <Card title="What Can Governance Control?" icon="🏛️">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Update reward rates (rent, review, governance, referral)",
              "Add/remove property verifiers and arbiters",
              "Adjust platform fee percentage",
              "Pause/unpause contracts in emergency",
              "Update AI oracle address",
              "Modify reputation point weights",
              "Adjust escrow grace period",
              "Manage treasury funds",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
              >
                <span className="text-violet-400/60 group-hover:text-violet-400 transition-colors text-sm">✓</span>
                <p className="text-[13px] text-white/40 group-hover:text-white/60 transition-colors">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
