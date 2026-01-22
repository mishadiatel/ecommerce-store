import { create } from 'zustand';

type ModalType = 'cart' | 'search' | 'message';

interface MessagePayload {
  text: string;
  type?: 'success' | 'error' | 'info';
}

type PopupPayloadMap = {
  cart: undefined;
  search: undefined;
  message: MessagePayload;
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