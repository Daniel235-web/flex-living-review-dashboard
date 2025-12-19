'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Star, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/cn-utils';

interface GoogleReview {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
  profile_photo_url?: string;
}

interface GoogleReviewsProps {
  placeId?: string;
}

export function GoogleReviews({ placeId = 'ChIJN1t_tDeuEmsRUsoyG83frY4' }: GoogleReviewsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['google-reviews', placeId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/google?placeId=${placeId}`);
      if (!response.ok) throw new Error('Failed to fetch Google reviews');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const placeDetails = data?.data?.result;
  const reviews = placeDetails?.reviews || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
            Google Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Google Reviews Unavailable
            </h3>
            <p className="text-gray-600 mb-4">
              Unable to fetch Google reviews at this time. This could be due to:
            </p>
            <ul className="text-sm text-gray-500 text-left max-w-md mx-auto mb-4 space-y-1">
              <li>• Missing Google Places API key</li>
              <li>• API quota exceeded</li>
              <li>• Invalid Place ID</li>
              <li>• Network connectivity issues</li>
            </ul>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Google Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6 mb-3"></div>
                <div className="h-16 bg-gray-200 rounded mb-2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center">
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google Reviews
          </CardTitle>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-semibold text-gray-900 ml-1">
                {placeDetails?.rating?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <span className="text-gray-500">•</span>
            <span className="text-sm text-gray-600">
              {placeDetails?.user_ratings_total || 0} reviews
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('h-3 w-3 mr-1', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
          <Button size="sm">
            <ExternalLink className="h-3 w-3 mr-1" />
            View on Google
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {placeDetails?.formatted_address && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Location</p>
            <p className="text-gray-600">{placeDetails.formatted_address}</p>
          </div>
        )}

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
          {reviews.map((review: GoogleReview, index: number) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {review.profile_photo_url ? (
                    <img
                      src={review.profile_photo_url}
                      alt={review.author_name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {review.author_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {review.author_name}
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center mr-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-3 w-3',
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            )}
                          />
                        ))}
                      </div>
                      <Badge
                        variant={
                          review.rating >= 4
                            ? 'success'
                            : review.rating >= 3
                            ? 'warning'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {review.rating}
                      </Badge>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {review.relative_time_description}
                </span>
              </div>

              <p className="text-gray-700 line-clamp-3">{review.text}</p>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">No Google Reviews Found</h3>
            <p className="text-gray-600">
              No reviews are available for this location on Google.
            </p>
          </div>
        )}

        {data?.message?.includes('mock data') && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Using Mock Google Reviews Data
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  To use real Google Reviews, add your Google Places API key to the environment variables.
                </p>
                <a
                  href="https://developers.google.com/maps/documentation/places/web-service/get-api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-yellow-800 hover:text-yellow-900 underline mt-2 inline-block"
                >
                  Get Google Places API Key →
                </a>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}