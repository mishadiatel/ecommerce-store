import SearchForm from '@/components/search/form/SearchForm';
import { useModalStore } from '@/stores/useModalStore';
import { useTranslations } from 'next-intl';

export default function SearchModal({open}: {open: boolean}) {
  const closeModal = useModalStore(state => state.closeModal);
  const t = useTranslations('Search');
  return (
    <div className="modal-search-block" onClick={closeModal}>
      <div
        className={`modal-search-main p-6 sm:p-8 rounded-2xl flex flex-col gap-6 sm:gap-8 ${open ? 'open' : ''}`}
        onClick={(event) => {event.stopPropagation();}}
      >
        <div className="flex justify-between items-center">
          <div className="heading2">{t('popupTitle')}</div>
          <button className="button-main icon-button middle bg-gray" onClick={closeModal}>
            <i className="icon icon-x"></i>
          </button>
        </div>
        <div className="form-search relative w-full">
          <SearchForm onSubmit={closeModal} />
        </div>
        <div className="keyword">
          <div className="heading3">{t('popularQueries')}</div>
          <div className="list-keyword flex items-center flex-wrap gap-2 mt-6">
            <button className="item px-5 py-1.5 bg-extra-light-gray rounded-full text-gray-90 caption1">Гранола</button>
            <button className="item px-5 py-1.5 bg-extra-light-gray rounded-full text-gray-90 caption1">Хлібці з
              буряком
            </button>
            <button className="item px-5 py-1.5 bg-extra-light-gray rounded-full text-gray-90 caption1">Цукерки Bliss
              Balls
            </button>
            <button className="item px-5 py-1.5 bg-extra-light-gray rounded-full text-gray-90 caption1">Печиво вівсяне
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}