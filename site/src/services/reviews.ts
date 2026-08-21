export interface Review {
  _id: string;
  productId: string;
  language: string;
  firstName: string;
  lastName: string;
  rating: number;
  comment: string;
  isVisible?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReviewsResponse {
  data: Review[];
  averageRating: number;
  count: number;
}

export async function getPublicReviews(
  productId: string,
  language: string,
): Promise<ProductReviewsResponse> {
  const url = `${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/reviews/public/product/${productId}?language=${encodeURIComponent(language)}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { data: [], averageRating: 0, count: 0 };
    return res.json();
  } catch {
    return { data: [], averageRating: 0, count: 0 };
  }
}
