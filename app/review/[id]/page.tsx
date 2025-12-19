'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { ArrowLeft, Star, Calendar, User, Building, MessageSquare, CheckCircle, XCircle, Edit } from 'lucide-react';
import { reviewsApi } from '../../../lib/api';
import { format } from 'date-fns';

export default function ReviewDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = parseInt(params.id as string);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => reviewsApi.getHostawayReviews({ limit: 100 }),
    select: (data) => data.reviews.find((r) => r.id === reviewId),
  });

  const review = reviewsData;

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

  if (!review) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Review Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The review you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Review Details</h1>
            <p className="text-gray-600">ID: {review.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Review Content</CardTitle>
                <Badge className={
                  review.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : review.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }>
                  {review.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary-50 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {review.guestName}
                  </h3>
                  <p className="text-gray-600">Guest Review</p>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < Math.floor(review.overallRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {review.overallRating.toFixed(1)}
                  </span>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {review.publicReview}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Category Ratings
                </h4>
                <div className="grid gap-3">
                  {review.categories.map((category) => (
                    <div
                      key={category.category}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-700 capitalize">
                        {category.category.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${category.rating * 10}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-8">
                          {category.rating}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-gray-500" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Property Name</p>
                <p className="font-semibold text-gray-900">{review.listingName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Property ID</p>
                <p className="font-mono text-sm text-gray-600">{review.listingId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Channel</p>
                <Badge variant="outline" className="mt-1">
                  {review.channel}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Review Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                Review Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted Date</p>
                <p className="font-semibold text-gray-900">
                  {format(review.submittedAt, 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-500">
                  {format(review.submittedAt, 'h:mm a')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Review Type</p>
                <Badge variant="outline" className="capitalize">
                  {review.type.replace('-', ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Category Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {review.averageCategoryRating.toFixed(1)}/10
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
