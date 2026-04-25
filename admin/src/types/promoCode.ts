export enum PromoDiscountType {
  PERCENT = 'percent',
  FIXED = 'fixed',
}

export interface PromoCode {
  _id: string;
  code: string;
  discountType: PromoDiscountType | string;
  discountValue: number;
  minOrderAmount: number;
  /** null — без обмеження кількості використань */
  maxUses: number | null;
  currentUses: number;
  validFrom: string | null;
  validTo: string | null;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromoCodePayload {
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
  isActive?: boolean;
  description?: string;
}

export type UpdatePromoCodePayload = Partial<CreatePromoCodePayload>;
