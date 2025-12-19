'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Star, ThumbsUp, ThumbsDown, MoreVertical, ExternalLink } from 'lucide-react';
import { NormalizedReview } from '../../lib/types';
import { format } from 'date-fns';
import { cn } from '../../lib/cn-utils';

interface RecentReviewsProps {
  reviews: NormalizedReview[];
}

export function RecentReviews({ reviews }: RecentReviewsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'Airbnb':
        return 'bg-pink-100 text-pink-800';
      case 'Booking.com':
        return 'bg-blue-100 text-blue-800';
      case 'VRBO':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Recent Reviews
        </CardTitle>
        <Button variant="outline" size="sm">
          View All Reviews
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {review.guestName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {review.guestName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {review.listingName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(review.status)}>
                    {review.status}
                  </Badge>
                  <Badge className={getChannelColor(review.channel)}>
                    {review.channel}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < Math.floor(review.overallRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                  <span className="ml-2 font-semibold text-gray-900">
                    {review.overallRating.toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {format(review.submittedAt, 'MMM d, yyyy • h:mm a')}
                </div>
              </div>

              <p className="text-gray-700 mb-3 line-clamp-2">
                {review.publicReview}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {review.categories.slice(0, 3).map((category) => (
                    <Badge
                      key={category.category}
                      variant="outline"
                      className="text-xs"
                    >
                      {category.category}: {category.rating}/10
                    </Badge>
                  ))}
                  {review.categories.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{review.categories.length - 3} more
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {review.sentiment === 'positive' ? (
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                  ) : review.sentiment === 'negative' ? (
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                  ) : null}
                  <Button variant="ghost" size="sm" className="h-8">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}