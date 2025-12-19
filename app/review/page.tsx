'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Download, MessageSquare, Star, Filter, Calendar, Building } from 'lucide-react';
import Link from 'next/link';
import { reviewsApi } from '../../lib/api';

export default function ReviewPage() {  // Singular name
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => reviewsApi.getHostawayReviews({ limit: 50 }),
  });

  const reviews = reviewsData?.reviews || [];
  const stats = reviewsData?.statistics || {
    total: 0,
    averageRating: 0,
    publishedCount: 0,
    pendingCount: 0,
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-600 mt-2">
            Manage and respond to guest reviews across all channels
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Respond to All
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.publishedCount}
                </p>
              </div>
              <Badge className="h-12 w-12 text-lg bg-green-100 text-green-800">
                {stats.publishedCount}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingCount}
                </p>
              </div>
              <Badge className="h-12 w-12 text-lg bg-yellow-100 text-yellow-800">
                {stats.pendingCount}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">
                All Reviews ({reviews.length})
              </h3>
            </div>
            <div className="text-sm text-gray-500">
              Showing {reviews.length} of {stats.total} reviews
            </div>
          </div>
          
          <div className="space-y-4">
            {reviews.map((review) => (
              <Link
                key={review.id}
                href={`/review/${review.id}`}  // Singular path
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
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
                      <div className="text-sm text-gray-500 flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {review.listingName}
                      </div>
                    </div>
                  </div>
                  <Badge className={
                    review.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : review.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }>
                    {review.status}
                  </Badge>
                </div>

                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(review.overallRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-semibold text-gray-900">
                      {review.overallRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(review.submittedAt).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-gray-700 line-clamp-2 mt-2">
                  {review.publicReview}
                </p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
