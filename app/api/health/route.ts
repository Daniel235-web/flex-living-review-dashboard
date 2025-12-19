export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    success: true,
    message: 'API is working on Vercel',
    timestamp: new Date().toISOString(),
    reviewCount: 23,
    avgRating: 4.3,
  });
}
