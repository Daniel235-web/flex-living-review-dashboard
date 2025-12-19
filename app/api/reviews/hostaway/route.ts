import { NextRequest, NextResponse } from 'next/server';
import { generateMockReviews, normalizeReview } from '../../../../lib/utils';
import { HostawayApiResponse } from '../../../../lib/types';

const HOSTAWAY_API_URL = 'https://api.hostaway.com/v1/reviews';

// Mock data to use when API is unavailable or for development
const MOCK_REVIEWS_DATA: HostawayApiResponse = {
  status: "success",
  result: [
    {
      "id": 7453,
      "type": "host-to-guest",
      "status": "published",
      "rating": null,
      "publicReview": "Shane and family are wonderful! Would definitely host again :)",
      "reviewCategory": [
        { "category": "cleanliness", "rating": 10 },
        { "category": "communication", "rating": 10 },
        { "category": "respect_house_rules", "rating": 10 }
      ],
      "submittedAt": "2020-08-21 22:45:14",
      "guestName": "Shane Finkelstein",
      "listingName": "2B N1 A - 29 Shoreditch Heights"
    },
    {
      "id": 7454,
      "type": "guest-to-host",
      "status": "published",
      "rating": 4.5,
      "publicReview": "Great location and clean apartment. Would stay again!",
      "reviewCategory": [
        { "category": "cleanliness", "rating": 9 },
        { "category": "location", "rating": 10 },
        { "category": "value", "rating": 8 }
      ],
      "submittedAt": "2020-08-22 10:30:00",
      "guestName": "Alex Johnson",
      "listingName": "Luxury Penthouse - Covent Garden (Airbnb)"
    },
    {
      "id": 7455,
      "type": "guest-to-host",
      "status": "pending",
      "rating": 3.0,
      "publicReview": "The apartment was okay but could use some updates.",
      "reviewCategory": [
        { "category": "cleanliness", "rating": 7 },
        { "category": "check-in", "rating": 6 },
        { "category": "amenities", "rating": 5 }
      ],
      "submittedAt": "2020-08-23 14:15:22",
      "guestName": "Maria Garcia",
      "listingName": "Modern Studio - Canary Wharf (Booking.com)"
    }
  ]
};

async function fetchHostawayReviews(): Promise<HostawayApiResponse> {
  const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
  const apiKey = process.env.HOSTAWAY_API_KEY;

  if (!accountId || !apiKey) {
    console.warn('Hostaway API credentials not found. Using mock data.');
    return {
      ...MOCK_REVIEWS_DATA,
      result: [...MOCK_REVIEWS_DATA.result, ...generateMockReviews(20)]
    };
  }

  try {
    const response = await fetch(HOSTAWAY_API_URL, {
      headers: {
        'Cache-Control': 'no-cache',
        'Authorization': `Bearer ${apiKey}`,
        'X-User-Id': accountId,
      },
    });

    if (!response.ok) {
      throw new Error(`Hostaway API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // If API returns empty or invalid data, fall back to mock data
    if (!data.result || !Array.isArray(data.result)) {
      console.warn('Hostaway API returned invalid data structure. Using mock data.');
      return {
        ...MOCK_REVIEWS_DATA,
        result: [...MOCK_REVIEWS_DATA.result, ...generateMockReviews(20)]
      };
    }

    return data;
  } catch (error) {
    console.error('Error fetching Hostaway reviews:', error);
    // Return mock data as fallback
    return {
      ...MOCK_REVIEWS_DATA,
      result: [...MOCK_REVIEWS_DATA.result, ...generateMockReviews(20)]
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get filter parameters
    const listingId = searchParams.get('listingId');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');
    const status = searchParams.get('status');
    const channel = searchParams.get('channel');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Fetch reviews from Hostaway API (with mock fallback)
    const apiData = await fetchHostawayReviews();
    
    // Normalize all reviews
    const normalizedReviews = apiData.result.map(normalizeReview);

    // Apply filters
    let filteredReviews = normalizedReviews;

    if (listingId) {
      filteredReviews = filteredReviews.filter(review => review.listingId === listingId);
    }

    if (minRating) {
      filteredReviews = filteredReviews.filter(review => review.overallRating >= parseFloat(minRating));
    }

    if (maxRating) {
      filteredReviews = filteredReviews.filter(review => review.overallRating <= parseFloat(maxRating));
    }

    if (status) {
      const statusArray = status.split(',');
      filteredReviews = filteredReviews.filter(review => statusArray.includes(review.status));
    }

    if (channel) {
      const channelArray = channel.split(',');
      filteredReviews = filteredReviews.filter(review => channelArray.includes(review.channel));
    }

    if (startDate) {
      const start = new Date(startDate);
      filteredReviews = filteredReviews.filter(review => review.submittedAt >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredReviews = filteredReviews.filter(review => review.submittedAt <= end);
    }

    // Apply pagination
    const totalCount = filteredReviews.length;
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;
    const paginatedReviews = filteredReviews.slice(offsetNum, offsetNum + limitNum);

    // Calculate statistics
    const stats = {
      total: totalCount,
      averageRating: filteredReviews.length > 0 
        ? filteredReviews.reduce((sum, review) => sum + review.overallRating, 0) / filteredReviews.length 
        : 0,
      publishedCount: filteredReviews.filter(r => r.status === 'published').length,
      pendingCount: filteredReviews.filter(r => r.status === 'pending').length,
      draftCount: filteredReviews.filter(r => r.status === 'draft').length,
    };

    return NextResponse.json({
      status: 'success',
      data: {
        reviews: paginatedReviews,
        pagination: {
          total: totalCount,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < totalCount,
        },
        statistics: stats,
      },
      message: 'Reviews fetched successfully',
    });

  } catch (error) {
    console.error('Error in Hostaway reviews API:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch reviews',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Optional: POST endpoint to update review status (approve/reject)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, action } = body;

    if (!reviewId || !action) {
      return NextResponse.json(
        { status: 'error', message: 'Missing reviewId or action' },
        { status: 400 }
      );
    }

    // In a real implementation, you would update the review in Hostaway API
    // For now, we'll simulate a successful update
    
    return NextResponse.json({
      status: 'success',
      message: `Review ${reviewId} ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: { reviewId, status: action === 'approve' ? 'published' : 'draft' },
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to update review',
      },
      { status: 500 }
    );
  }
}