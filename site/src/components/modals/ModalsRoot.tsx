'use client';

import { useModalStore } from '@/stores/useModalStore';
import SearchModal from '@/components/modals/searchModal/SearchModal';


export default function ModalsRoot() {
  const activeModal = useModalStore(s => s.modal);
  return (
    <>
      {/*<CartPopup open={activePopup === 'cart'} />*/}
      <SearchModal open={activeModal?.type === 'search'} />
      {/*<MessagePopup open={activePopup === 'message'} />*/}
    </>
  );
}