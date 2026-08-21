/**
 * Локальні (клієнтські) відгуки, які лишає користувач з форми на сайті.
 * Зберігаються в localStorage і не потрапляють в базу — тому доступні
 * лише в межах браузера користувача, який їх залишив.
 */

export interface LocalReview {
  id: string;
  productId: string;
  firstName: string;
  lastName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const STORAGE_KEY = 'localProductReviews';

function readAll(): LocalReview[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list: LocalReview[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* quota або приватний режим — просто ігноруємо */
  }
}

export function getLocalReviewsForProduct(productId: string): LocalReview[] {
  return readAll()
    .filter((r) => r.productId === productId)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export function addLocalReview(
  input: Omit<LocalReview, 'id' | 'createdAt'>,
): LocalReview {
  const review: LocalReview = {
    ...input,
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  writeAll([review, ...readAll()]);
  return review;
}
