'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Review } from '@/services/reviews';
import {
  addLocalReview,
  getLocalReviewsForProduct,
  type LocalReview,
} from '@/lib/localReviews';
import ReviewFormModal from '@/components/products/reviews/ReviewFormModal';

interface Props {
  productId: string;
  productName: string;
  initialReviews: Review[];
  initialAverage: number;
  initialCount: number;
}

const INITIAL_LIMIT = 3;

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = d.getFullYear();
    return `${dd}.${mm}.${yy}`;
  } catch {
    return iso;
  }
}

function Stars({ value, className = '' }: { value: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <div className={`rate flex items-center gap-1 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <i
          key={i}
          className={
            i < rounded ? 'icon-filled_star' : 'icon-heroicons-solid_star'
          }
        />
      ))}
    </div>
  );
}

export default function ReviewsBlock({
  productId,
  productName,
  initialReviews,
  initialAverage,
  initialCount,
}: Props) {
  const t = useTranslations('Reviews');
  const [localReviews, setLocalReviews] = useState<LocalReview[]>([]);
  const [dbReviews, setDbReviews] = useState<Review[]>(initialReviews);
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Читаємо localStorage тільки на клієнті (щоб не було hydration mismatch)
  useEffect(() => {
    setLocalReviews(getLocalReviewsForProduct(productId));
  }, [productId]);

  // Об'єднуємо: локальні першими, потім з БД
  const allReviews = useMemo(() => {
    const local = localReviews.map((r) => ({
      _id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      isLocal: true as const,
    }));
    const db = dbReviews.map((r) => ({
      _id: r._id,
      firstName: r.firstName,
      lastName: r.lastName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      isLocal: false as const,
    }));
    return [...local, ...db];
  }, [localReviews, dbReviews]);

  const totalCount = allReviews.length;
  const visibleReviews = showAll ? allReviews : allReviews.slice(0, INITIAL_LIMIT);

  // Середня оцінка з урахуванням локальних + серверних
  const averageRating = useMemo(() => {
    if (totalCount === 0) return 0;
    const sum = allReviews.reduce((s, r) => s + r.rating, 0);
    return Math.round((sum / totalCount) * 100) / 100;
  }, [allReviews, totalCount]);

  const handleSubmitReview = (data: {
    firstName: string;
    lastName: string;
    rating: number;
    comment: string;
  }) => {
    addLocalReview({ productId, ...data });
    setLocalReviews(getLocalReviewsForProduct(productId));
    setIsModalOpen(false);
  };

  const displayAverage = totalCount > 0 ? averageRating : initialAverage;
  const displayCount = totalCount > 0 ? totalCount : initialCount;

  return (
    <div className="review-block py-12 lg:py-14 bg-green-50" id="productReviews">
      <div className="container">
        <div className="heading1 text-center mb-8 sm:mb-10">
          {t('title', { name: productName })}
        </div>
        <div className="top-overview flex justify-between max-lg:flex-col gap-y-6">
          <div className="rating black-start lg:w-1/3 w-full">
            <div className="heading flex items-center gap-6 mb-6">
              <div className="text-[50px] font-bold text-black">
                {displayAverage.toFixed(2)}
              </div>
              <div className="flex flex-col items-start">
                <Stars value={displayAverage} />
                <div className="text-gray-90 text-title font-semibold mt-3">
                  ({t('reviewsCount', { count: displayCount })})
                </div>
              </div>
            </div>
            <div className="">
              <div className="heading4 text-gray-90 mb-4">
                {t('leaveReviewTitle')}
              </div>
              <button
                type="button"
                className="button-main w-full sm:w-fit"
                onClick={() => setIsModalOpen(true)}
              >
                {t('leaveReviewButton')}
              </button>
            </div>
          </div>
          <div className="list-review flex flex-col gap-6 lg:w-2/3 lg:pl-[60px]">
            {visibleReviews.length === 0 ? (
              <div className="bg-white p-5 lg:p-8 rounded-2xl text-gray-90">
                {t('empty')}
              </div>
            ) : (
              visibleReviews.map((r) => (
                <div
                  key={r._id}
                  className="testimonial-main bg-white p-5 lg:p-8 rounded-2xl h-fit"
                >
                  <Stars value={r.rating} className="text-[16px]" />
                  <div className="desc mt-3 text-gray-90 review-text whitespace-pre-line">
                    {r.comment}
                  </div>
                  <div className="heading6 mt-5 lg:mt-6 text-black">
                    {r.firstName} {r.lastName}
                    {r.isLocal && (
                      <span className="ml-2 text-xs uppercase text-primary-green">
                        {t('yourReviewBadge')}
                      </span>
                    )}
                  </div>
                  <div className="caption1 text-gray-30">
                    {formatDate(r.createdAt)}
                  </div>
                </div>
              ))
            )}

            {totalCount > INITIAL_LIMIT && !showAll && (
              <button
                type="button"
                className="button-main whitespace-nowrap w-full lg:w-fit text-center"
                onClick={() => setShowAll(true)}
              >
                {t('showAllButton')}
              </button>
            )}
          </div>
        </div>
      </div>

      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={productName}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
}
