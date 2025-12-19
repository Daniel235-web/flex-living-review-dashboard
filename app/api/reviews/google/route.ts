export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    status: 'success',
    data: {
      result: {
        name: "Flex Living Properties",
        rating: 4.7,
        user_ratings_total: 128,
        reviews: [
          {
            author_name: "Sarah Johnson",
            rating: 5,
            relative_time_description: "a week ago",
            text: "Excellent service!",
          },
          {
            author_name: "Michael Chen", 
            rating: 4,
            relative_time_description: "2 weeks ago",
            text: "Great experience overall.",
          },
        ],
      },
    },
    message: 'Mock Google reviews',
  });
}
