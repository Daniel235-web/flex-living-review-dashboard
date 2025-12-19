import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - CRITICAL for Vercel
export const dynamic = 'force-dynamic';

// Hardcoded mock data - NO external dependencies
const MOCK_REVIEWS = [
  {
    id: 7453,
    type: 'host-to-guest',
    status: 'published',
    overallRating: 4.8,
    averageCategoryRating: 9.5,
    publicReview: "Shane and family are wonderful! Would definitely host again :)",
    categories: [
      { category: 'cleanliness', rating: 10 },
      { category: 'communication', rating: 10 },
      { category: 'respect_house_rules', rating: 10 }
    ],
    submittedAt: '2020-08-21T22:45:14',
    guestName: 'Shane Finkelstein',
    listingName: '2B N1 A - 29 Shoreditch Heights',
    listingId: 'list_123',
    channel: 'Airbnb',
    sentiment: 'positive',
    isApproved: true,
  },
  {
    id: 7454,
    type: 'guest-to-host',
    status: 'published',
    overallRating: 4.5,
    averageCategoryRating: 8.5,
    publicReview: "Great location and clean apartment. Would stay again!",
    categories: [
      { category: 'cleanliness', rating: 9 },
      { category: 'location', rating: 10 },
      { category: 'value', rating: 8 }
    ],
    submittedAt: '2020-08-22T10:30:00',
    guestName: 'Alex Johnson',
    listingName: 'Luxury Penthouse - Covent Garden',
    listingId: 'list_456',
    channel: 'Booking.com',
    sentiment: 'positive',
    isApproved: true,
  },
  {
    id: 7455,
    type: 'guest-to-host',
    status: 'pending',
    overallRating: 3.0,
    averageCategoryRating: 6.0,
    publicReview: "The apartment was okay but could use some updates.",
    categories: [
      { category: 'cleanliness', rating: 7 },
      { category: 'check-in', rating: 6 },
      { category: 'amenities', rating: 5 }
    ],
    submittedAt: '2020-08-23T14:15:22',
    guestName: 'Maria Garcia',
    listingName: 'Modern Studio - Canary Wharf',
    listingId: 'list_789',
    channel: 'VRBO',
    sentiment: 'neutral',
    isApproved: false,
  }
];

// Generate 20 more mock reviews
function generateMoreReviews() {
  const reviews = [];
  const listings = [
    '2B N1 A - 29 Shoreditch Heights',
    'Luxury Penthouse - Covent Garden', 
    'Modern Studio - Canary Wharf',
    'Family Apartment - Kensington',
    'City View Loft - Shoreditch'
  ];
  
  for (let i = 1; i <= 20; i++) {
    const rating = parseFloat((Math.random() * 2 + 3).toFixed(1)); // 3.0-5.0
    reviews.push({
      id: 8000 + i,
      type: Math.random() > 0.5 ? 'guest-to-host' : 'host-to-guest',
      status: Math.random() > 0.7 ? 'draft' : Math.random() > 0.5 ? 'pending' : 'published',
      overallRating: rating,
      averageCategoryRating: parseFloat((Math.random() * 3 + 7).toFixed(1)),
      publicReview: `Review ${i}: ${rating >= 4 ? 'Excellent stay!' : rating >= 3 ? 'Good experience' : 'Needs improvement'}.`,
      categories: [
        { category: 'cleanliness', rating: Math.floor(Math.random() * 5) + 6 },
        { category: 'communication', rating: Math.floor(Math.random() * 5) + 6 },
        { category: 'location', rating: Math.floor(Math.random() * 5) + 6 },
      ],
      submittedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      guestName: `Guest ${i}`,
      listingName: listings[Math.floor(Math.random() * listings.length)],
      listingId: `list_${1000 + i}`,
      channel: ['Airbnb', 'Booking.com', 'VRBO', 'Direct'][Math.floor(Math.random() * 4)],
      sentiment: rating >= 4 ? 'positive' : rating >= 2.5 ? 'neutral' : 'negative',
      isApproved: Math.random() > 0.3,
    });
  }
  return reviews;
}

export async function GET(request: NextRequest) {
  console.log('API called on Vercel - returning mock data');
  
  try {
    // Combine all reviews
    const allReviews = [...MOCK_REVIEWS, ...generateMoreReviews()];
    
    // Calculate statistics
    const total = allReviews.length;
    const avgRating = total > 0 
      ? parseFloat((allReviews.reduce((sum, r) => sum + r.overallRating, 0) / total).toFixed(1))
      : 0;
    
    const stats = {
      total: total,
      averageRating: avgRating,
      publishedCount: allReviews.filter(r => r.status === 'published').length,
      pendingCount: allReviews.filter(r => r.status === 'pending').length,
      draftCount: allReviews.filter(r => r.status === 'draft').length,
    };
    
    // Return response with proper headers
    return NextResponse.json({
      status: 'success',
      data: {
        reviews: allReviews,
        pagination: {
          total: total,
          limit: 50,
          offset: 0,
          hasMore: false,
        },
        statistics: stats,
      },
      message: 'Reviews fetched successfully',
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
    
  } catch (error) {
    console.error('API error (unexpected):', error);
    
    // Fallback: return at least basic data
    return NextResponse.json({
      status: 'success',
      data: {
        reviews: MOCK_REVIEWS,
        pagination: { total: 3, limit: 50, offset: 0, hasMore: false },
        statistics: { total: 3, averageRating: 4.1, publishedCount: 2, pendingCount: 1, draftCount: 0 },
      },
      message: 'Using fallback data',
    }, { status: 200 });
  }
}

// Simple POST handler
export async function POST(request: NextRequest) {
  return NextResponse.json({
    status: 'success',
    message: 'Review status updated (mock)',
  });
}