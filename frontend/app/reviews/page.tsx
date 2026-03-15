"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card, Button, Badge, PageHeader, Input, EmptyState } from "@/components/ui";
import {
  usePropertyCount,
  usePropertyReviews,
  useReview,
  useSubmitReview,
  useVoteReview,
  usePropertyAverageRating,
  usePropertyAISentiment,
} from "@/lib/hooks";

export default function ReviewsPage() {
  const { isConnected } = useAccount();
  const { data: totalProperties } = usePropertyCount();
  const [selectedProperty, setSelectedProperty] = useState<number>(0);
  const [showForm, setShowForm] = useState(false);

  const count = Number(totalProperties ?? 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reviews"
        subtitle="AI-enhanced decentralized reviews with sentiment analysis"
        icon="⭐"
        action={
          isConnected ? (
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "✍️ Write Review"}
            </Button>
          ) : undefined
        }
      />

      {showForm && <ReviewForm onDone={() => setShowForm(false)} />}

      {/* Property Selector */}
      {count > 0 && (
        <div className="animate-fadeUp flex items-center gap-3 flex-wrap">
          <label className="text-[13px] text-white/30">Select Property:</label>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
                onClick={() => setSelectedProperty(i)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedProperty === i
                    ? "bg-linear-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-900/25"
                    : "glass hover:bg-white/[0.06] text-white/40 hover:text-white/60"
                }`}
              >
                Property #{i}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Property Sentiment Overview */}
      <PropertySentiment propertyId={BigInt(selectedProperty)} />

      {/* Reviews List */}
      <PropertyReviewsList propertyId={BigInt(selectedProperty)} />

      {/* Feature Cards */}
      <div className="animate-fadeUp" style={{ animationDelay: "0.2s" }}>
        <Card title="Review System Features" icon="🤖">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
            {[
              {
                icon: "🤖",
                title: "AI Sentiment",
                desc: "Off-chain AI analyzes review sentiment (-100 to +100) and confidence (0-100%).",
                color: "from-blue-400 to-cyan-400",
              },
              {
                icon: "🛡️",
                title: "Anti-Spam",
                desc: "One review per tenant per property. SBT reputation required.",
                color: "from-violet-400 to-fuchsia-400",
              },
              {
                icon: "👍",
                title: "Community Voting",
                desc: "Vote reviews as helpful or unhelpful. Self-voting prevented.",
                color: "from-emerald-400 to-green-400",
              },
            ].map((f) => (
              <div key={f.title} className="glass rounded-xl p-5 text-center group hover:border-white/[0.08] transition-all relative overflow-hidden">
                <div className={`absolute -top-6 -right-6 w-16 h-16 rounded-full bg-linear-to-br ${f.color} opacity-[0.06] blur-xl`} />
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${f.color} mx-auto mb-3 flex items-center justify-center text-lg opacity-80`}>
                    {f.icon}
                  </div>
                  <p className={`text-sm font-semibold bg-linear-to-r ${f.color} bg-clip-text text-transparent mb-1`}>
                    {f.title}
                  </p>
                  <p className="text-[12px] text-white/30">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function PropertySentiment({ propertyId }: { propertyId: bigint }) {
  const { data: avgRating } = usePropertyAverageRating(propertyId);
  const { data: sentiment } = usePropertyAISentiment(propertyId);

  const avgRatingNum = avgRating ? Number(avgRating) : 0;
  const sentimentData = sentiment as [bigint, bigint] | undefined;
  const avgSentiment = sentimentData ? Number(sentimentData[0]) : 0;
  const reviewCount = sentimentData ? Number(sentimentData[1]) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
      <div className="glass rounded-xl p-5 text-center group relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-amber-500/[0.06] blur-xl" />
        <div className="relative">
          <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">Average Rating</p>
          <p className="text-2xl font-bold text-amber-400 mb-1">
            {"⭐".repeat(Math.round(avgRatingNum / 20))}
          </p>
          <p className="text-sm text-white/30">{(avgRatingNum / 20).toFixed(1)} / 5.0</p>
        </div>
      </div>
      <div className="glass rounded-xl p-5 text-center group relative overflow-hidden">
        <div className={`absolute -top-8 -right-8 w-20 h-20 rounded-full ${avgSentiment >= 0 ? "bg-emerald-500/[0.06]" : "bg-red-500/[0.06]"} blur-xl`} />
        <div className="relative">
          <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">AI Sentiment</p>
          <p className={`text-2xl font-bold ${avgSentiment >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {avgSentiment >= 0 ? "😊" : "😞"} {avgSentiment}
          </p>
          <p className="text-sm text-white/30">Range: -100 to +100</p>
        </div>
      </div>
      <div className="glass rounded-xl p-5 text-center group relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-blue-500/[0.06] blur-xl" />
        <div className="relative">
          <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">Total Reviews</p>
          <p className="text-2xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {reviewCount}
          </p>
          <p className="text-sm text-white/30">For Property #{propertyId.toString()}</p>
        </div>
      </div>
    </div>
  );
}

function PropertyReviewsList({ propertyId }: { propertyId: bigint }) {
  const { data: reviewIds } = usePropertyReviews(propertyId);

  if (!reviewIds || (reviewIds as bigint[]).length === 0) {
    return (
      <Card title={`Reviews for Property #${propertyId.toString()}`} icon="📝">
        <EmptyState icon="✍️" message="No reviews yet. Be the first to review this property!" />
      </Card>
    );
  }

  return (
    <Card title={`Reviews for Property #${propertyId.toString()}`} icon="📝">
      <div className="space-y-4">
        {(reviewIds as bigint[]).map((id) => (
          <ReviewCard key={id.toString()} reviewId={id} />
        ))}
      </div>
    </Card>
  );
}

function ReviewCard({ reviewId }: { reviewId: bigint }) {
  const { data } = useReview(reviewId);
  const { voteReview, isPending } = useVoteReview();

  if (!data) return null;

  const review = data as {
    propertyId: bigint;
    reviewer: string;
    rating: number;
    title: string;
    contentHash: string;
    timestamp: bigint;
    verified: boolean;
    aiSentiment: number;
    aiConfidence: number;
    helpfulVotes: number;
    unhelpfulVotes: number;
    flagged: boolean;
  };

  return (
    <div
      className={`glass rounded-xl p-4 transition-all ${
        review.flagged ? "border-red-500/20 glow-pink" : "hover:border-white/[0.08]"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-amber-400 text-sm">{"⭐".repeat(review.rating)}</span>
            {review.verified && <Badge color="green">✓ AI Verified</Badge>}
            {review.flagged && <Badge color="red">⚠ Flagged</Badge>}
          </div>
          <h4 className="font-semibold text-white/90 text-sm">{review.title}</h4>
        </div>
        <span className="text-[11px] text-white/20 font-mono">#{reviewId.toString()}</span>
      </div>

      <p className="text-[11px] text-white/20 font-mono mb-3">By: {review.reviewer}</p>

      {review.verified && (
        <div className="flex gap-4 mb-3 text-xs">
          <span className={`px-2 py-0.5 rounded-full ${review.aiSentiment >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            Sentiment: {review.aiSentiment > 0 ? "+" : ""}
            {review.aiSentiment}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
            Confidence: {review.aiConfidence}%
          </span>
        </div>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-white/[0.04]">
        <button
          onClick={() => voteReview(reviewId, true)}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-emerald-400 transition-colors disabled:opacity-40"
        >
          👍 <span>{review.helpfulVotes}</span>
        </button>
        <button
          onClick={() => voteReview(reviewId, false)}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
        >
          👎 <span>{review.unhelpfulVotes}</span>
        </button>
      </div>
    </div>
  );
}

function ReviewForm({ onDone }: { onDone: () => void }) {
  const [propertyId, setPropertyId] = useState("0");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [contentHash, setContentHash] = useState("ipfs://");

  const { submitReview, isPending, isConfirming, isSuccess } = useSubmitReview();

  if (isSuccess) {
    return (
      <Card glow="emerald" className="animate-fadeUp">
        <div className="text-center py-4">
          <span className="text-4xl block mb-3">🎉</span>
          <h3 className="text-lg font-bold text-white/90 mb-1">Review Submitted!</h3>
          <p className="text-white/40 text-sm mb-4">You earned 10 FLEX tokens for your review!</p>
          <Button onClick={onDone} variant="secondary">Close</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="animate-fadeUp">
      <Card title="Write a Review" icon="✍️" glow="purple">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitReview(BigInt(propertyId), rating, title, contentHash);
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
            <div>
              <label className="block text-[13px] text-white/40 mb-1.5 tracking-wide">Rating</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRating(r)}
                    className={`text-2xl transition-all duration-200 ${
                      r <= rating ? "scale-110 drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]" : "opacity-20 hover:opacity-40"
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Input
            label="Review Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Great co-living experience!"
            required
          />
          <Input
            label="Content Hash (IPFS)"
            value={contentHash}
            onChange={(e) => setContentHash(e.target.value)}
            mono
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isPending || isConfirming}>
              Submit Review (+10 FLEX)
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
