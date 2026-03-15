"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card, Button, Badge, PageHeader, Input, EmptyState } from "@/components/ui";
import {
  usePropertyCount,
  useProperty,
  useListProperty,
  useLandlordProperties,
  formatUSDC,
  STATUS_MAP,
  STATUS_COLORS,
} from "@/lib/hooks";

export default function PropertiesPage() {
  const { address, isConnected } = useAccount();
  const { data: totalCount } = usePropertyCount();
  const { data: myProperties } = useLandlordProperties(address);
  const [showForm, setShowForm] = useState(false);

  const count = Number(totalCount ?? 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Properties"
        subtitle="Browse and list co-living spaces on-chain"
        icon="🏠"
        action={
          isConnected ? (
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "＋ List Property"}
            </Button>
          ) : undefined
        }
      />

      {showForm && <ListPropertyForm onDone={() => setShowForm(false)} />}

      {/* My Properties */}
      {Array.isArray(myProperties) && (myProperties as bigint[]).length > 0 && (
        <div className="animate-fadeUp">
          <Card title="My Properties" icon="🏠" glow="purple">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(myProperties as bigint[]).map((id) => (
                <PropertyCard key={id.toString()} tokenId={id} />
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* All Properties */}
      <div className="animate-fadeUp" style={{ animationDelay: "0.1s" }}>
        <Card title="All Listed Properties" icon="��️">
          {count === 0 ? (
            <EmptyState icon="🏠" message="No properties listed yet. Be the first to list a co-living space!" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: count }, (_, i) => (
                <PropertyCard key={i} tokenId={BigInt(i)} />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Info Cards */}
      <div className="animate-fadeUp" style={{ animationDelay: "0.2s" }}>
        <Card title="Property Features" icon="✨">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
            {[
              {
                icon: "🤖",
                title: "AI Quality Score",
                desc: "Each property receives an AI-generated quality assessment from 0-100.",
                color: "from-blue-400 to-cyan-400",
              },
              {
                icon: "✅",
                title: "Multi-Step Verification",
                desc: "Properties undergo community verification before being listed.",
                color: "from-emerald-400 to-green-400",
              },
              {
                icon: "🎨",
                title: "NFT Ownership",
                desc: "Each property is minted as an ERC-721 NFT with on-chain metadata.",
                color: "from-violet-400 to-fuchsia-400",
              },
            ].map((f) => (
              <div key={f.title} className="glass rounded-xl p-5 text-center group hover:border-white/[0.08] transition-all">
                <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${f.color} mx-auto mb-3 flex items-center justify-center text-xl opacity-80 group-hover:opacity-100 transition-opacity`}>
                  {f.icon}
                </div>
                <p className={`text-sm font-semibold bg-linear-to-r ${f.color} bg-clip-text text-transparent mb-1`}>
                  {f.title}
                </p>
                <p className="text-xs text-white/30">{f.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function PropertyCard({ tokenId }: { tokenId: bigint }) {
  const { data } = useProperty(tokenId);
  if (!data) return <PropertySkeleton />;

  const prop = data as {
    location: string;
    capacity: number;
    monthlyRentWei: bigint;
    securityDeposit: bigint;
    landlord: string;
    status: number;
    aiQualityScore: number;
    totalReviews: number;
    averageRating: number;
  };

  return (
    <div className="glass rounded-xl p-5 group hover:border-white/[0.08] transition-all relative overflow-hidden">
      {/* Subtle corner glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-violet-500/[0.06] blur-2xl group-hover:bg-violet-500/[0.1] transition-all" />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-white/90 text-[15px]">{prop.location}</h4>
            <p className="text-[11px] text-white/25 font-mono">Token #{tokenId.toString()}</p>
          </div>
          <Badge color={STATUS_COLORS[prop.status]}>{STATUS_MAP[prop.status]}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="bg-white/[0.03] rounded-lg p-2.5">
            <p className="text-white/25 text-[10px] uppercase tracking-wider mb-0.5">Monthly Rent</p>
            <p className="text-white/90 font-mono text-sm">${formatUSDC(prop.monthlyRentWei)}</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-2.5">
            <p className="text-white/25 text-[10px] uppercase tracking-wider mb-0.5">Deposit</p>
            <p className="text-white/90 font-mono text-sm">${formatUSDC(prop.securityDeposit)}</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-2.5">
            <p className="text-white/25 text-[10px] uppercase tracking-wider mb-0.5">Capacity</p>
            <p className="text-white/90 text-sm">{prop.capacity} tenants</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-2.5">
            <p className="text-white/25 text-[10px] uppercase tracking-wider mb-0.5">AI Score</p>
            <p className="text-sm">
              {prop.aiQualityScore > 0 ? (
                <span
                  className={
                    prop.aiQualityScore >= 80
                      ? "text-emerald-400"
                      : prop.aiQualityScore >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                  }
                >
                  {prop.aiQualityScore}/100
                </span>
              ) : (
                <span className="text-white/20">Pending</span>
              )}
            </p>
          </div>
        </div>

        {prop.totalReviews > 0 && (
          <div className="flex items-center gap-2 text-xs text-white/30 pt-3 border-t border-white/[0.04]">
            <span className="text-yellow-400">{"⭐".repeat(Math.round(prop.averageRating / 20))}</span>
            <span>
              {(prop.averageRating / 20).toFixed(1)} ({prop.totalReviews} reviews)
            </span>
          </div>
        )}

        <p className="text-[10px] text-white/15 mt-2 font-mono truncate">Owner: {prop.landlord}</p>
      </div>
    </div>
  );
}

function PropertySkeleton() {
  return (
    <div className="glass rounded-xl p-5">
      <div className="shimmer h-4 rounded w-2/3 mb-3" />
      <div className="shimmer h-3 rounded w-1/3 mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <div className="shimmer h-12 rounded-lg" />
        <div className="shimmer h-12 rounded-lg" />
      </div>
    </div>
  );
}

function ListPropertyForm({ onDone }: { onDone: () => void }) {
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [rent, setRent] = useState("1000");
  const [deposit, setDeposit] = useState("2000");
  const [tokenURI, setTokenURI] = useState("ipfs://");

  const { listProperty, isPending, isConfirming, isSuccess } = useListProperty();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    listProperty(location, parseInt(capacity), rent, deposit, tokenURI);
  };

  if (isSuccess) {
    return (
      <Card glow="emerald" className="animate-fadeUp">
        <div className="text-center py-4">
          <span className="text-4xl block mb-3">🎉</span>
          <h3 className="text-lg font-bold text-white/90 mb-1">Property Listed!</h3>
          <p className="text-white/40 text-sm mb-4">Your property is pending verification.</p>
          <Button onClick={onDone} variant="secondary">Close</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="animate-fadeUp">
      <Card title="List New Property" icon="��" glow="purple">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Berlin, Germany"
            required
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              type="number"
              min="1"
              required
            />
            <Input
              label="Rent (USDC/mo)"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              required
              mono
            />
            <Input
              label="Deposit (USDC)"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              required
              mono
            />
          </div>
          <Input
            label="Metadata URI"
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
            mono
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isPending || isConfirming}>
              List Property
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
