'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { TrendingUp, TrendingDown, Users, Star, MessageSquare, Clock } from 'lucide-react';
import { cn } from '../../lib/cn-utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
}

function StatsCard({ title, value, change, icon, description }: StatsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-1 text-xs mt-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : isNegative ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : null}
            <span
              className={cn(
                'font-medium',
                isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
              )}
            >
              {change > 0 ? '+' : ''}{change}% from last month
            </span>
          </div>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStats {
  totalReviews: number;
  averageRating: number;
  publishedCount: number;
  pendingCount: number;
  responseRate?: number;
  listingsCount?: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Reviews"
        value={stats.totalReviews}
        change={12}
        icon={<MessageSquare className="h-4 w-4 text-primary-600" />}
        description="Across all properties"
      />
      <StatsCard
        title="Avg. Rating"
        value={stats.averageRating.toFixed(1)}
        change={5}
        icon={<Star className="h-4 w-4 text-primary-600" />}
        description="Overall guest satisfaction"
      />
      <StatsCard
        title="Published"
        value={stats.publishedCount}
        icon={<Users className="h-4 w-4 text-primary-600" />}
        description="Approved for public display"
      />
      <StatsCard
        title="Pending Review"
        value={stats.pendingCount}
        change={-8}
        icon={<Clock className="h-4 w-4 text-primary-600" />}
        description="Awaiting approval"
      />
    </div>
  );
}