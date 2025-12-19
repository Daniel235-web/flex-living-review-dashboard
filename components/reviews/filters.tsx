'use client';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Filter,
  Star,
  Calendar,
  Building,
  MessageSquare,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/cn-utils';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

interface ReviewsFiltersProps {
  listings: Array<{ id: string; name: string }>;
  channels: string[];
  onFilterChange: (filters: {
    listingId?: string;
    minRating?: number;
    maxRating?: number;
    status?: string[];
    channel?: string[];
    dateRange?: { start: Date; end: Date };
  }) => void;
}

export function ReviewsFilters({ listings, channels, onFilterChange }: ReviewsFiltersProps) {
  const [selectedListing, setSelectedListing] = useState<string>('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [ratingRange, setRatingRange] = useState<[number, number]>([1, 5]);

  const statusOptions: FilterOption[] = [
    { id: 'published', label: 'Published', value: 'published' },
    { id: 'pending', label: 'Pending', value: 'pending' },
    { id: 'draft', label: 'Draft', value: 'draft' },
  ];

  const ratingOptions = [1, 2, 3, 4, 5];

  const handleStatusToggle = (status: string) => {
    const newStatus = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    
    setSelectedStatus(newStatus);
    applyFilters({ status: newStatus });
  };

  const handleChannelToggle = (channel: string) => {
    const newChannels = selectedChannels.includes(channel)
      ? selectedChannels.filter(c => c !== channel)
      : [...selectedChannels, channel];
    
    setSelectedChannels(newChannels);
    applyFilters({ channel: newChannels });
  };

  const handleRatingSelect = (rating: number) => {
    const newRange: [number, number] = [rating, rating];
    setRatingRange(newRange);
    applyFilters({ minRating: rating, maxRating: rating });
  };

  const handleClearFilters = () => {
    setSelectedListing('');
    setSelectedChannels([]);
    setSelectedStatus([]);
    setRatingRange([1, 5]);
    onFilterChange({});
  };

  const applyFilters = (updates: any) => {
    onFilterChange({
      listingId: selectedListing || undefined,
      minRating: ratingRange[0],
      maxRating: ratingRange[1],
      status: selectedStatus.length > 0 ? selectedStatus : undefined,
      channel: selectedChannels.length > 0 ? selectedChannels : undefined,
      ...updates,
    });
  };

  const hasActiveFilters = selectedListing || selectedChannels.length > 0 || selectedStatus.length > 0 || ratingRange[0] !== 1 || ratingRange[1] !== 5;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-sm"
            >
              <X className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Property Filter */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Building className="h-4 w-4 text-gray-500" />
              <h4 className="font-medium text-gray-700">Property</h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <select
                value={selectedListing}
                onChange={(e) => {
                  setSelectedListing(e.target.value);
                  applyFilters({ listingId: e.target.value || undefined });
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Properties</option>
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Star className="h-4 w-4 text-gray-500" />
              <h4 className="font-medium text-gray-700">Rating</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {ratingOptions.map((rating) => (
                <Button
                  key={rating}
                  variant={ratingRange[0] === rating && ratingRange[1] === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRatingSelect(rating)}
                  className={cn(
                    ratingRange[0] === rating && ratingRange[1] === rating
                      ? 'bg-primary-600 hover:bg-primary-700'
                      : ''
                  )}
                >
                  {rating} ★
                </Button>
              ))}
              <Button
                variant={ratingRange[0] === 1 && ratingRange[1] === 5 ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setRatingRange([1, 5]);
                  applyFilters({ minRating: undefined, maxRating: undefined });
                }}
                className={cn(
                  ratingRange[0] === 1 && ratingRange[1] === 5
                    ? 'bg-primary-600 hover:bg-primary-700'
                    : ''
                )}
              >
                All
              </Button>
            </div>
          </div>

          {/* Channel Filter */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <h4 className="font-medium text-gray-700">Channel</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {channels.map((channel) => (
                <Badge
                  key={channel}
                  variant={selectedChannels.includes(channel) ? "default" : "outline"}
                  className={cn(
                    'cursor-pointer px-3 py-1',
                    selectedChannels.includes(channel)
                      ? 'bg-primary-600 hover:bg-primary-700'
                      : 'hover:bg-gray-100'
                  )}
                  onClick={() => handleChannelToggle(channel)}
                >
                  {channel}
                </Badge>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <h4 className="font-medium text-gray-700">Status</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <Badge
                  key={status.id}
                  variant={selectedStatus.includes(status.value) ? "default" : "outline"}
                  className={cn(
                    'cursor-pointer px-3 py-1',
                    selectedStatus.includes(status.value)
                      ? status.value === 'published'
                        ? 'bg-green-600 hover:bg-green-700'
                        : status.value === 'pending'
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-gray-600 hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                  )}
                  onClick={() => handleStatusToggle(status.value)}
                >
                  {status.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}