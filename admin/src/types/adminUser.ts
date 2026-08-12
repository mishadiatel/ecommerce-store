import { Order } from './order';

export interface AdminUserListItem {
  _id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  role: 'user' | 'admin';
  isActivated: boolean;
  hasAbandonedCart: boolean;
  cartItemsCount: number;
  ordersCount: number;
  totalSpent: number;
}

export interface AdminUserListResponse {
  data: AdminUserListItem[];
  totalDocuments: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface AdminUserCartItem {
  productId: string;
  quantity: number;
  name: string | null;
  price: number | null;
  image: string | null;
}

export interface AdminUserCart {
  items: AdminUserCartItem[];
  totalQuantity: number;
  estimatedTotal: number;
}

export interface AdminUserDetails {
  user: {
    _id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    birthDay: string | null;
    role: 'user' | 'admin';
    isActivated: boolean;
  };
  cart: AdminUserCart | null;
  orders: Order[];
  ordersSummary: {
    totalOrders: number;
    totalRevenue: number;
    paidRevenue: number;
  };
}
