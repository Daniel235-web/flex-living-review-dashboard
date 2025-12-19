'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  ChevronUp,
  ChevronDown,
  Star,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';
import { NormalizedReview } from '../../lib/types';
import { format } from 'date-fns';
import { cn } from '../../lib/cn-utils';

interface ReviewsTableProps {
  reviews: NormalizedReview[];
  onApprove: (reviewId: number) => void;
  onReject: (reviewId: number) => void;
  onViewDetails: (reviewId: number) => void;
}

export function ReviewsTable({
  reviews,
  onApprove,
  onReject,
  onViewDetails,
}: ReviewsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'submittedAt', desc: true },
  ]);

  const columns: ColumnDef<NormalizedReview>[] = [
    {
      accessorKey: 'guestName',
      header: 'Guest',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-sm">
              {row.original.guestName.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.original.guestName}</div>
            <div className="text-xs text-gray-500">{row.original.listingName}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'overallRating',
      header: 'Rating',
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="flex items-center mr-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3',
                  i < Math.floor(row.original.overallRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <span className="font-medium text-gray-900">
            {row.original.overallRating.toFixed(1)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'sentiment',
      header: 'Sentiment',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.sentiment === 'positive'
              ? 'success'
              : row.original.sentiment === 'negative'
              ? 'destructive'
              : 'warning'
          }
          className="capitalize"
        >
          {row.original.sentiment}
        </Badge>
      ),
    },
    {
      accessorKey: 'channel',
      header: 'Channel',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(
            row.original.channel === 'Airbnb'
              ? 'border-pink-200 text-pink-700 bg-pink-50'
              : row.original.channel === 'Booking.com'
              ? 'border-blue-200 text-blue-700 bg-blue-50'
              : row.original.channel === 'VRBO'
              ? 'border-purple-200 text-purple-700 bg-purple-50'
              : 'border-gray-200 text-gray-700 bg-gray-50'
          )}
        >
          {row.original.channel}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          className={cn(
            'capitalize',
            row.original.status === 'published'
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : row.original.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          )}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'submittedAt',
      header: 'Date',
      cell: ({ row }) => (
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-3 w-3 mr-1" />
          {format(row.original.submittedAt, 'MMM d, yyyy')}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const review = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetails(review.id)}
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {review.status === 'pending' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onApprove(review.id)}
                  title="Approve review"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onReject(review.id)}
                  title="Reject review"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: reviews,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border border-gray-200">
      <Table>
        <TableHeader className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="font-semibold text-gray-700">
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'flex items-center cursor-pointer select-none',
                          header.column.getCanSort() && 'hover:bg-gray-100 px-2 py-1 rounded'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="ml-1">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <div className="h-4 w-4 opacity-0" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-gray-500"
              >
                No reviews found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}