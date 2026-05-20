import { create } from 'zustand';

type ModalType =
  | 'cart'
  | 'search'
  | 'message'
  | 'promoCodeResult'
  | 'orderDetails';

interface MessagePayload {
  text: string;
  type?: 'success' | 'error' | 'info';
}

export interface PromoCodeResultPayload {
  success: boolean;
  message: string;
  code?: string;
  discountAmount?: number;
}

export interface OrderDetailsPayload {
  orderId: string;
}

type PopupPayloadMap = {
  cart: undefined;
  search: undefined;
  message: MessagePayload;
  promoCodeResult: PromoCodeResultPayload;
  orderDetails: OrderDetailsPayload;
};

interface ModalState<T extends ModalType = ModalType> {
  type: T;
  payload: PopupPayloadMap[T];
}

interface ModalStore {
  modal: ModalState | null;

  openModal: <T extends ModalType>(
    type: T,
    payload?: PopupPayloadMap[T]
  ) => void;

  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  modal: null,

  openModal: (type, payload = undefined) =>
    set({
      modal: {
        type,
        payload,
      },
    }),

  closeModal: () => set({ modal: null }),
}));
