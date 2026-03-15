"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card, Button, Badge, StatCard, PageHeader, Input, EmptyState } from "@/components/ui";
import {
  useTenantLeases,
  useLease,
  useCreateLease,
  usePayRent,
  useApproveUSDC,
  useTenantPaymentHistory,
  useUSDCBalance,
  formatUSDC,
  formatFLEX,
  useFlexBalance,
} from "@/lib/hooks";
import { CONTRACT_ADDRESSES as ADDRS } from "@/lib/contracts/addresses";
import { maxUint256 } from "viem";

export default function EscrowPage() {
  const { address, isConnected } = useAccount();
  const { data: tenantLeases } = useTenantLeases(address);
  const { data: history } = useTenantPaymentHistory(address);
  const { data: usdcBal } = useUSDCBalance(address);
  const { data: flexBal } = useFlexBalance(address);
  const [showForm, setShowForm] = useState(false);

  const onTimePayments = history ? Number((history as unknown[])[0]) : 0;
  const totalPayments = history ? Number((history as unknown[])[1]) : 0;
  const leaseCount = history ? Number((history as unknown[])[2]) : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Rent & Escrow"
        subtitle="DeFi-powered rent payments with stablecoin escrow"
        icon="💵"
        action={
          isConnected ? (
            <div className="flex gap-3">
              <ApproveUSDCButton />
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? "Cancel" : "＋ New Lease"}
              </Button>
            </div>
          ) : undefined
        }
      />

      {isConnected && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          <StatCard
            icon="💵"
            label="USDC Balance"
            value={`$${formatUSDC(usdcBal as bigint)}`}
            gradient="from-emerald-400 to-cyan-400"
          />
          <StatCard
            icon="🪙"
            label="FLEX Earned"
            value={formatFLEX(flexBal as bigint)}
            gradient="from-pink-500 to-purple-500"
          />
          <StatCard
            icon="📊"
            label="On-Time Rate"
            value={totalPayments ? `${Math.round((onTimePayments / totalPayments) * 100)}%` : "N/A"}
            gradient="from-blue-400 to-indigo-400"
          />
          <StatCard
            icon="📜"
            label="Total Leases"
            value={leaseCount}
            gradient="from-amber-400 to-orange-400"
          />
        </div>
      )}

      {showForm && <CreateLeaseForm onDone={() => setShowForm(false)} />}

      {/* My Leases */}
      <div className="animate-fadeUp" style={{ animationDelay: "0.1s" }}>
        <Card title="My Leases" icon="📜">
          {!isConnected ? (
            <EmptyState icon="🔗" message="Connect wallet to view your leases" />
          ) : !tenantLeases || (tenantLeases as bigint[]).length === 0 ? (
            <EmptyState icon="📜" message="No active leases. Create one to get started!" />
          ) : (
            <div className="space-y-4">
              {(tenantLeases as bigint[]).map((id) => (
                <LeaseCard key={id.toString()} leaseId={id} />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* How It Works */}
      <div className="animate-fadeUp" style={{ animationDelay: "0.2s" }}>
        <Card title="How DeFi Escrow Works" icon="ℹ️">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {[
              {
                step: "1",
                title: "Create Lease",
                desc: "Deposit security deposit in USDC. Funds held in smart contract.",
                icon: "📝",
                color: "from-violet-400 to-fuchsia-400",
              },
              {
                step: "2",
                title: "Pay Rent",
                desc: "Monthly USDC payments escrowed for 3-day grace period.",
                icon: "💸",
                color: "from-blue-400 to-cyan-400",
              },
              {
                step: "3",
                title: "Earn Rewards",
                desc: "Get 50 FLEX tokens for every on-time payment!",
                icon: "🪙",
                color: "from-pink-400 to-rose-400",
              },
              {
                step: "4",
                title: "Dispute Resolution",
                desc: "Arbiter splits funds fairly if issues arise.",
                icon: "⚖️",
                color: "from-emerald-400 to-green-400",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="glass rounded-xl p-5 text-center group hover:border-white/[0.08] transition-all relative overflow-hidden"
              >
                <div className={`absolute -top-6 -right-6 w-16 h-16 rounded-full bg-linear-to-br ${s.color} opacity-[0.06] blur-xl`} />
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${s.color} mx-auto mb-3 flex items-center justify-center text-lg opacity-80`}>
                    {s.icon}
                  </div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">
                    Step {s.step}
                  </p>
                  <p className="text-sm font-semibold text-white/80 mb-1">{s.title}</p>
                  <p className="text-[12px] text-white/30">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function LeaseCard({ leaseId }: { leaseId: bigint }) {
  const { data } = useLease(leaseId);
  const { payRent, isPending, isConfirming } = usePayRent();

  if (!data) return null;

  const lease = data as {
    propertyId: bigint;
    tenant: string;
    landlord: string;
    monthlyRent: bigint;
    totalPayments: number;
    paymentsMade: number;
    status: number;
    startTime: bigint;
  };

  const statusMap = ["Active", "Completed", "Terminated", "Disputed"];
  const statusColors: Array<"green" | "blue" | "red" | "yellow"> = ["green", "blue", "red", "yellow"];
  const progressPct = lease.totalPayments > 0 ? (lease.paymentsMade / lease.totalPayments) * 100 : 0;

  return (
    <div className="glass rounded-xl p-5 group hover:border-white/[0.08] transition-all relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-violet-500/[0.04] blur-2xl group-hover:bg-violet-500/[0.08] transition-all" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-white/90 text-[15px]">Lease #{leaseId.toString()}</h4>
            <p className="text-[11px] text-white/25 font-mono">Property #{lease.propertyId.toString()}</p>
          </div>
          <Badge color={statusColors[lease.status]}>{statusMap[lease.status]}</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
          <div className="bg-white/[0.03] rounded-lg p-2.5">
            <p className="text-white/25 text-[10px] uppercase tracking-wider mb-0.5">Monthly Rent</p>
            <p className="text-white/90 font-mono text-sm">${formatUSDC(lease.monthlyRent)}</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-2.5">
            <p className="text-white/25 text-[10px] uppercase tracking-wider mb-0.5">Payments</p>
            <p className="text-white/90 text-sm">
              {lease.paymentsMade} / {lease.totalPayments}
            </p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-2.5">
            <p className="text-white/25 text-[10px] uppercase tracking-wider mb-1">Progress</p>
            <div className="w-full bg-white/[0.06] rounded-full h-2">
              <div
                className="bg-linear-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-2.5">
            <p className="text-white/25 text-[10px] uppercase tracking-wider mb-0.5">Landlord</p>
            <p className="text-white/60 font-mono text-[11px] truncate">{lease.landlord}</p>
          </div>
        </div>

        {lease.status === 0 && lease.paymentsMade < lease.totalPayments && (
          <Button onClick={() => payRent(leaseId)} loading={isPending || isConfirming} className="w-full">
            💸 Pay Rent (${formatUSDC(lease.monthlyRent)} USDC → Earn 50 FLEX)
          </Button>
        )}
      </div>
    </div>
  );
}

function CreateLeaseForm({ onDone }: { onDone: () => void }) {
  const [propertyId, setPropertyId] = useState("0");
  const [duration, setDuration] = useState("6");
  const { createLease, isPending, isConfirming, isSuccess } = useCreateLease();

  if (isSuccess) {
    return (
      <Card glow="emerald" className="animate-fadeUp">
        <div className="text-center py-4">
          <span className="text-4xl block mb-3">🎉</span>
          <h3 className="text-lg font-bold text-white/90 mb-1">Lease Created!</h3>
          <p className="text-white/40 text-sm mb-4">Security deposit has been escrowed.</p>
          <Button onClick={onDone} variant="secondary">Close</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="animate-fadeUp">
      <Card title="Create New Lease" icon="📝" glow="purple">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createLease(BigInt(propertyId), parseInt(duration));
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Property ID"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              type="number"
              min="0"
              required
            />
            <Input
              label="Duration (months)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              type="number"
              min="1"
              required
            />
          </div>
          <div className="glass-subtle rounded-lg p-3 flex items-start gap-2">
            <span className="text-amber-400 text-sm mt-0.5">⚠</span>
            <p className="text-[12px] text-white/30">
              Security deposit will be taken from your USDC balance immediately. Make sure you have approved the escrow contract.
            </p>
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={isPending || isConfirming}>
              Create Lease
            </Button>
            <Button variant="ghost" onClick={onDone}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function ApproveUSDCButton() {
  const { approve, isPending, isConfirming, isSuccess } = useApproveUSDC();

  if (isSuccess) return <Badge color="green">✅ USDC Approved</Badge>;

  return (
    <Button
      variant="secondary"
      onClick={() => approve(ADDRS.rentEscrow, maxUint256)}
      loading={isPending || isConfirming}
    >
      Approve USDC
    </Button>
  );
}
