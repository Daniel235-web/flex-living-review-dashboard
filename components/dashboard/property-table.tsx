'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ArrowUpRight, MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { ListingStats } from '../../lib/types';
import { format } from 'date-fns';

interface PropertyTableProps {
  listings: ListingStats[];
}

export function PropertyTable({ listings }: PropertyTableProps) {
  const getTrendIcon = (rating: number) => {
    if (rating >= 4.5) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (rating >= 3.5) {
      return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-50';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Property Performance
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Overview of reviews across all properties
          </p>
        </div>
        <Button variant="outline" size="sm">
          View All Properties
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Property
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Total Reviews
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Avg. Rating
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Published
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Pending
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Last Review
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {listings.map((listing) => (
                <tr key={listing.listingId} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-semibold">
                          {listing.listingName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {listing.listingName}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {listing.listingId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">
                      {listing.totalReviews}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getRatingColor(listing.averageRating)}`}>
                        {listing.averageRating.toFixed(1)}
                      </div>
                      {getTrendIcon(listing.averageRating)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="success" className="font-medium">
                      {listing.publishedCount}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="warning">
                      {listing.pendingCount}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-600">
                      {listing.latestReview 
                        ? format(new Date(listing.latestReview), 'MMM d, yyyy')
                        : 'No reviews'
                      }
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Link href={`/reviews?listing=${listing.listingId}`}>
                        <Button variant="ghost" size="sm" className="h-8">
                          View Reviews
                          <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}