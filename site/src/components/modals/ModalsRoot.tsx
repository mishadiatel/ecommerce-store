'use client';

import { useModalStore } from '@/stores/useModalStore';
import SearchModal from '@/components/modals/searchModal/SearchModal';
import CartModal from '@/components/modals/cartModal/CartModal';


export default function ModalsRoot() {
  const activeModal = useModalStore(s => s.modal);
  return (
    <>
      <CartModal open={activeModal?.type === 'cart'} />
      <SearchModal open={activeModal?.type === 'search'} />
      {/*<MessagePopup open={activePopup === 'message'} />*/}
    </>
  );
}