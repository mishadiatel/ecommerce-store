export interface StatsBreakdownItem {
  count: number;
  revenue: number;
}

export interface StatusBreakdownItem extends StatsBreakdownItem {
  status: string;
}

export interface PaymentBreakdownItem extends StatsBreakdownItem {
  paymentStatus: string;
}

export interface CustomerTypeBreakdownItem extends StatsBreakdownItem {
  type: 'guest' | 'registered';
}

export interface OrderStatsSummary {
  dateFrom: string | null;
  dateTo: string | null;
  totalOrders: number;
  totalRevenue: number;
  paidRevenue: number;
  paidOrders: number;
  avgOrderValue: number;
  totalItems: number;
  statusBreakdown: StatusBreakdownItem[];
  paymentBreakdown: PaymentBreakdownItem[];
  customerTypeBreakdown: CustomerTypeBreakdownItem[];
}

export interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
  ordersCount: number;
}

export interface TimelinePoint {
  bucket: string;
  orders: number;
  revenue: number;
  paidRevenue: number;
  items: number;
}
