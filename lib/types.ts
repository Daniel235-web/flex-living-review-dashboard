// Review types
export interface ReviewCategory {
  category: string;
  rating: number;
}

export interface HostawayReview {
  id: number;
  type: 'host-to-guest' | 'guest-to-host';
  status: 'published' | 'draft' | 'pending';
  rating: number | null;
  publicReview: string;
  reviewCategory: ReviewCategory[];
  submittedAt: string;
  guestName: string;
  listingName: string;
  channel?: string;
}

export interface NormalizedReview {
  id: number;
  type: 'host-to-guest' | 'guest-to-host';
  status: 'published' | 'draft' | 'pending';
  overallRating: number;
  averageCategoryRating: number;
  publicReview: string;
  categories: ReviewCategory[];
  submittedAt: Date;
  guestName: string;
  listingName: string;
  listingId: string;
  channel: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  isApproved: boolean;
}

export interface HostawayApiResponse {
  status: string;
  result: HostawayReview[];
}

// Dashboard types
export interface ListingStats {
  listingId: string;
  listingName: string;
  totalReviews: number;
  averageRating: number;
  publishedCount: number;
  pendingCount: number;
  latestReview: Date | null;
}

export interface FilterOptions {
  listingId?: string;
  minRating?: number;
  maxRating?: number;
  status?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  channel?: string[];
}

// Chart data types
export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface TrendData {
  date: string;
  averageRating: number;
  reviewCount: number;
}