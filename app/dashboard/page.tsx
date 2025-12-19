'use client';

import { useQuery } from '@tanstack/react-query';
import { StatsCards } from '../../components/dashboard/stats-cards';
import { RatingChart } from '../../components/dashboard/rating-chart';
import { PropertyTable } from '../../components/dashboard/property-table';
import { RecentReviews } from '../../components/dashboard/recent-reviews';
import { GoogleReviews } from '../../components/reviews/google-reviews';
import { reviewsApi } from '../../lib/api';
import { calculateRatingDistribution } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Star, TrendingUp, AlertCircle, MessageSquare, CheckCircle, Download, Bell } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

export default function DashboardPage() {
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['dashboard-reviews'],
    queryFn: () => reviewsApi.getHostawayReviews({ limit: 100 }),
  });

  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => reviewsApi.getDashboardStats(),
  });

  if (isLoadingReviews || isLoadingStats) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-48 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const reviews = reviewsData?.reviews || [];
  const stats = dashboardStats || {
    totalReviews: 0,
    averageRating: 0,
    publishedCount: 0,
    pendingCount: 0,
    listings: [],
  };

  const ratingDistribution = calculateRatingDistribution(reviews);
  const recentReviews = reviews.slice(0, 5);

  // Calculate insights
  const highRatingReviews = reviews.filter(r => r.overallRating >= 4.5).length;
  const lowRatingReviews = reviews.filter(r => r.overallRating <= 2.5).length;
  const responseNeeded = reviews.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reviews Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage guest reviews across all Flex Living properties
        </p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              High Ratings (4.5+)
            </CardTitle>
            <Star className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {highRatingReviews}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Excellent performance reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Needs Attention (≤2.5)
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {lowRatingReviews}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Reviews requiring immediate follow-up
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Response Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {responseNeeded}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Reviews awaiting your response
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RatingChart data={ratingDistribution} />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-primary-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Approve Pending Reviews</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {responseNeeded} reviews are awaiting your approval to be published publicly.
                </p>
                <Button variant="ghost" className="text-sm font-medium text-primary-600 hover:text-primary-700 p-0 h-auto">
                  Review pending →
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Export Reviews</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Download all reviews as CSV for analysis or reporting.
                </p>
                <Button variant="ghost" className="text-sm font-medium text-primary-600 hover:text-primary-700 p-0 h-auto">
                  <Download className="h-3 w-3 mr-1 inline" />
                  Export data →
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Set Up Alerts</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get notified about new reviews, especially low ratings.
                </p>
                <Button variant="ghost" className="text-sm font-medium text-primary-600 hover:text-primary-700 p-0 h-auto">
                  <Bell className="h-3 w-3 mr-1 inline" />
                  Configure alerts →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GoogleReviews />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Review Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Top Performing Categories</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Cleanliness and communication are your highest-rated categories.
                </p>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Cleanliness: 9.2/10</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Communication: 8.9/10</span>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Areas for Improvement</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Guests have mentioned issues with check-in process and amenities.
                </p>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">Check-in: 7.1/10</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">Amenities: 7.5/10</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Response Performance</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Average response time: 4.2 hours (Industry average: 6 hours)
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Faster than 85% of similar properties</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PropertyTable listings={stats.listings} />

      <RecentReviews reviews={recentReviews} />
    </div>
  );
}