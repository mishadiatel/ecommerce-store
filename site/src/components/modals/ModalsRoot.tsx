'use client';

import { useModalStore } from '@/stores/useModalStore';
import SearchModal from '@/components/modals/searchModal/SearchModal';
import CartModal from '@/components/modals/cartModal/CartModal';
import PromoCodeModal from '@/components/modals/promoCodeModal/PromoCodeModal';


export default function ModalsRoot() {
  const activeModal = useModalStore(s => s.modal);
  return (
    <>
      <CartModal open={activeModal?.type === 'cart'} />
      <SearchModal open={activeModal?.type === 'search'} />
      <PromoCodeModal open={activeModal?.type === 'promoCodeResult'} />
      {/*<MessagePopup open={activePopup === 'message'} />*/}
    </>
  );
}
