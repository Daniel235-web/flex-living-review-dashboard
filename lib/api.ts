import axios from 'axios';
import { NormalizedReview } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  status: string;
  data: T;
  message: string;
}

export interface ReviewsResponse {
  reviews: NormalizedReview[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  statistics: {
    total: number;
    averageRating: number;
    publishedCount: number;
    pendingCount: number;
    draftCount: number;
  };
}

export interface UpdateReviewRequest {
  reviewId: number;
  action: 'approve' | 'reject';
}

class ReviewsApi {
  private client = axios.create({
    baseURL: API_BASE_URL,
  });

  async getHostawayReviews(params?: {
    listingId?: string;
    minRating?: number;
    maxRating?: number;
    status?: string;
    channel?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<ReviewsResponse> {
    const response = await this.client.get<ApiResponse<ReviewsResponse>>('/api/reviews/hostaway', {
      params,
    });
    return response.data.data;
  }

  async updateReviewStatus(request: UpdateReviewRequest): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<ApiResponse<{ reviewId: number; status: string }>>(
      '/api/reviews/hostaway',
      request
    );
    
    return {
      success: response.data.status === 'success',
      message: response.data.message,
    };
  }

  // Get statistics for dashboard
  async getDashboardStats() {
    const reviews = await this.getHostawayReviews({ limit: 1000 });
    
    // Group by listing
    const listingsMap = new Map<string, {
      listingId: string;
      listingName: string;
      totalReviews: number;
      totalRating: number;
      publishedCount: number;
      pendingCount: number;
      latestReview: Date | null;
    }>();

    reviews.reviews.forEach(review => {
      const existing = listingsMap.get(review.listingId);
      
      if (existing) {
        existing.totalReviews++;
        existing.totalRating += review.overallRating;
        if (review.status === 'published') existing.publishedCount++;
        if (review.status === 'pending') existing.pendingCount++;
        if (!existing.latestReview || review.submittedAt > existing.latestReview) {
          existing.latestReview = review.submittedAt;
        }
      } else {
        listingsMap.set(review.listingId, {
          listingId: review.listingId,
          listingName: review.listingName,
          totalReviews: 1,
          totalRating: review.overallRating,
          publishedCount: review.status === 'published' ? 1 : 0,
          pendingCount: review.status === 'pending' ? 1 : 0,
          latestReview: review.submittedAt,
        });
      }
    });

    const listingsStats = Array.from(listingsMap.values()).map(listing => ({
      ...listing,
      averageRating: listing.totalRating / listing.totalReviews,
    }));

    return {
      totalReviews: reviews.statistics.total,
      averageRating: reviews.statistics.averageRating,
      listings: listingsStats,
      publishedCount: reviews.statistics.publishedCount,
      pendingCount: reviews.statistics.pendingCount,
    };
  }
}

export const reviewsApi = new ReviewsApi();