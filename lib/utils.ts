import { HostawayReview, NormalizedReview } from './types';


// Extract listing ID from name (mocked for now)
export function extractListingId(listingName: string): string {
  // Simple hash function for demo
  return `list_${Math.abs(listingName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0))}`;
}

// Determine channel from listing name or other data
export function determineChannel(listingName: string): string {
  if (listingName.toLowerCase().includes('airbnb')) return 'Airbnb';
  if (listingName.toLowerCase().includes('booking')) return 'Booking.com';
  if (listingName.toLowerCase().includes('vrbo')) return 'VRBO';
  return 'Direct';
}

// Calculate sentiment from rating
export function calculateSentiment(rating: number): 'positive' | 'neutral' | 'negative' {
  if (rating >= 4) return 'positive';
  if (rating >= 2.5) return 'neutral';
  return 'negative';
}

// Normalize Hostaway review data
export function normalizeReview(review: HostawayReview): NormalizedReview {
  // Calculate average category rating
  const categoryRatings = review.reviewCategory.map(cat => cat.rating);
  const avgCategoryRating = categoryRatings.length > 0 
    ? categoryRatings.reduce((a, b) => a + b, 0) / categoryRatings.length 
    : 0;

  // Use provided rating or calculate from categories
  const overallRating = review.rating !== null ? review.rating : avgCategoryRating;

  return {
    id: review.id,
    type: review.type,
    status: review.status,
    overallRating,
    averageCategoryRating: avgCategoryRating,
    publicReview: review.publicReview,
    categories: review.reviewCategory,
    submittedAt: new Date(review.submittedAt),
    guestName: review.guestName,
    listingName: review.listingName,
    listingId: extractListingId(review.listingName),
    channel: determineChannel(review.listingName),
    sentiment: calculateSentiment(overallRating),
    isApproved: review.status === 'published',
  };
}

// Calculate rating distribution
export function calculateRatingDistribution(reviews: NormalizedReview[]) {
  const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  reviews.forEach(review => {
    const roundedRating = Math.round(review.overallRating);
    if (roundedRating >= 1 && roundedRating <= 5) {
      distribution[roundedRating]++;
    }
  });

  const total = reviews.length;
  
  return Object.entries(distribution).map(([rating, count]) => ({
    rating: parseInt(rating),
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }));
}

// Generate mock data for testing
export function generateMockReviews(count: number): HostawayReview[] {
  const mockReviews: HostawayReview[] = [];
  const listings = [
    '2B N1 A - 29 Shoreditch Heights',
    'Luxury Penthouse - Covent Garden',
    'Modern Studio - Canary Wharf',
    'Family Apartment - Kensington',
    'City View Loft - Shoreditch',
  ];

  const channels = ['Airbnb', 'Booking.com', 'VRBO', 'Direct'];
  const categories = ['cleanliness', 'communication', 'check-in', 'accuracy', 'location', 'value'];

  for (let i = 1; i <= count; i++) {
    const listing = listings[Math.floor(Math.random() * listings.length)];
    const categoryCount = Math.floor(Math.random() * 3) + 2; // 2-4 categories
    
    const reviewCategories = [];
    for (let j = 0; j < categoryCount; j++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      // Avoid duplicate categories
      if (!reviewCategories.find(c => c.category === category)) {
        reviewCategories.push({
          category,
          rating: Math.floor(Math.random() * 5) + 6, // 6-10
        });
      }
    }

    const avgRating = reviewCategories.reduce((sum, cat) => sum + cat.rating, 0) / reviewCategories.length;
    
    mockReviews.push({
      id: 7000 + i,
      type: Math.random() > 0.5 ? 'guest-to-host' : 'host-to-guest',
      status: Math.random() > 0.7 ? 'draft' : Math.random() > 0.5 ? 'pending' : 'published',
      rating: Math.random() > 0.3 ? parseFloat(avgRating.toFixed(1)) : null,
      publicReview: `This is a mock review ${i} for testing purposes. ${Math.random() > 0.5 ? 'Great experience!' : 'Could be better.'}`,
      reviewCategory: reviewCategories,
      submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      guestName: `Guest ${i}`,
      listingName: `${listing} ${Math.random() > 0.5 ? '(Airbnb)' : '(Booking.com)'}`,
    });
  }

  return mockReviews;
}

// Filter reviews based on criteria
export function filterReviews(
  reviews: NormalizedReview[],
  filters: {
    listingId?: string;
    minRating?: number;
    maxRating?: number;
    status?: string[];
    startDate?: Date;
    endDate?: Date;
    channel?: string[];
  }
): NormalizedReview[] {
  return reviews.filter(review => {
    if (filters.listingId && review.listingId !== filters.listingId) return false;
    if (filters.minRating && review.overallRating < filters.minRating) return false;
    if (filters.maxRating && review.overallRating > filters.maxRating) return false;
    if (filters.status && filters.status.length > 0 && !filters.status.includes(review.status)) return false;
    if (filters.channel && filters.channel.length > 0 && !filters.channel.includes(review.channel)) return false;
    if (filters.startDate && review.submittedAt < filters.startDate) return false;
    if (filters.endDate && review.submittedAt > filters.endDate) return false;
    return true;
  });
}