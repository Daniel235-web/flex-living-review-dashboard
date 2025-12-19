import { NextRequest, NextResponse } from 'next/server';

// Mock Google Reviews API response structure
interface GoogleReview {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
  profile_photo_url?: string;
  language?: string;
}

interface GooglePlaceDetails {
  result: {
    name: string;
    rating: number;
    user_ratings_total: number;
    reviews: GoogleReview[];
    formatted_address: string;
    website?: string;
  };
  status: string;
}

// Mock data for development
const MOCK_GOOGLE_REVIEWS: GooglePlaceDetails = {
  status: "OK",
  result: {
    name: "Flex Living - Shoreditch Heights",
    rating: 4.7,
    user_ratings_total: 128,
    formatted_address: "29 Shoreditch High St, London E1 6PE, UK",
    website: "https://flexliving.com",
    reviews: [
      {
        author_name: "Sarah Johnson",
        rating: 5,
        relative_time_description: "a week ago",
        text: "Absolutely fantastic stay! The apartment was spotless, well-equipped, and in a perfect location. The host was incredibly responsive and helpful throughout our stay. Would definitely book again!",
        time: Date.now() / 1000 - 7 * 24 * 60 * 60,
        profile_photo_url: "https://via.placeholder.com/40",
      },
      {
        author_name: "Michael Chen",
        rating: 4,
        relative_time_description: "2 weeks ago",
        text: "Great value for money. Clean and comfortable apartment with good amenities. Location is excellent with plenty of restaurants and shops nearby. Minor issue with WiFi was resolved quickly.",
        time: Date.now() / 1000 - 14 * 24 * 60 * 60,
        profile_photo_url: "https://via.placeholder.com/40",
      },
      {
        author_name: "Emma Wilson",
        rating: 3,
        relative_time_description: "a month ago",
        text: "The apartment was okay but could use some updates. Furniture felt a bit dated and the kitchen appliances weren't the newest. Good location though.",
        time: Date.now() / 1000 - 30 * 24 * 60 * 60,
        profile_photo_url: "https://via.placeholder.com/40",
      },
      {
        author_name: "David Brown",
        rating: 5,
        relative_time_description: "2 months ago",
        text: "Perfect stay! Everything was exactly as described. The check-in process was smooth and the apartment had everything we needed. Highly recommend!",
        time: Date.now() / 1000 - 60 * 24 * 60 * 60,
        profile_photo_url: "https://via.placeholder.com/40",
      },
      {
        author_name: "Lisa Martinez",
        rating: 4,
        relative_time_description: "3 months ago",
        text: "Lovely apartment with great views. Very clean and well-maintained. Only suggestion would be to add a few more cooking utensils. Otherwise excellent!",
        time: Date.now() / 1000 - 90 * 24 * 60 * 60,
        profile_photo_url: "https://via.placeholder.com/40",
      },
    ],
  },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const placeId = searchParams.get('placeId');
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!placeId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Place ID is required',
        },
        { status: 400 }
      );
    }

    // If no API key is configured, return mock data
    if (!apiKey || apiKey === 'your-google-api-key-here') {
      console.warn('Google Places API key not configured. Using mock data.');
      return NextResponse.json({
        status: 'success',
        data: MOCK_GOOGLE_REVIEWS,
        message: 'Using mock data (Google API key not configured)',
      });
    }

    // Real Google Places API implementation (commented out for reference)
    /*
    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json`;
    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'name,rating,user_ratings_total,reviews,formatted_address,website',
      key: apiKey,
    });

    const response = await fetch(`${apiUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Google Places API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    return NextResponse.json({
      status: 'success',
      data: data,
      message: 'Google reviews fetched successfully',
    });
    */

    // Return mock data for now
    return NextResponse.json({
      status: 'success',
      data: MOCK_GOOGLE_REVIEWS,
      message: 'Using mock data',
    });

  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch Google reviews',
        error: error instanceof Error ? error.message : 'Unknown error',
        data: MOCK_GOOGLE_REVIEWS, // Fallback to mock data
      },
      { status: 500 }
    );
  }
}