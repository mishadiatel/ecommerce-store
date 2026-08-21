export interface Review {
  _id: string;
  productId: string;
  language: string;
  firstName: string;
  lastName: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}
