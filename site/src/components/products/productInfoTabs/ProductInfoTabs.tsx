'use client'
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { cleanHtmlString } from '@/lib/utils';
import { FullProductWithTranslations } from '@/types/product';
import { useSettings } from '@/context/generalSettings/GeneralSettingsContext';
import { useTranslations } from 'next-intl';

interface ProductInfoTabsProps {
  productInfo: FullProductWithTranslations
}

export default function ProductInfoTabs({productInfo}: ProductInfoTabsProps) {
  const settings = useSettings();
  const t = useTranslations('Product');
  return (
    <div className="desc-tab mt-10">
      {productInfo?.translations[0]?.longDescription && (
        <Dropdown
          options={[]}
          initialOpenState={false}
          dropdownContainerClass={'desc-block border-b border-t border-extra-light-gray'}
          disableAutoClose={true}
        >
          {({
              isOpen,
              toggle,
            }) => (
            <>
              <div
                className={`flex items-center justify-between w-full cursor-pointer py-4 sm:py-6 ${isOpen ? 'active' : ''}`}
                data-btn
                onClick={toggle}
              >
                <div className="tab-item heading4 ">
                  {t('descriptionLabel')}
                </div>
                <i className="icon icon-plus"></i>
                <i className="icon icon-minus"></i>
              </div>

              <div
                className={`desc-item description formated-text green-marked-link ${isOpen ? 'open' : ''}`}
                dangerouslySetInnerHTML={{__html: cleanHtmlString(String(productInfo.translations[0].longDescription))}}
              ></div>
            </>
          )}
        </Dropdown>
      ) }
      {productInfo?.translations[0]?.composition && (
        <Dropdown
          options={[]}
          initialOpenState={false}
          dropdownContainerClass={'desc-block border-b border-t border-extra-light-gray'}
          disableAutoClose={true}
        >
          {({
              isOpen,
              toggle,
            }) => (
            <>
              <div
                className={`flex items-center justify-between w-full cursor-pointer py-4 sm:py-6 ${isOpen ? 'active' : ''}`}
                data-btn
                onClick={toggle}
              >
                <div className="tab-item heading4 ">
                  {t('compositionLabel')}
                </div>
                <i className="icon icon-plus"></i>
                <i className="icon icon-minus"></i>
              </div>

              <div
                className={`desc-item description formated-text green-marked-link ${isOpen ? 'open' : ''}`}
                dangerouslySetInnerHTML={{__html: cleanHtmlString(String(productInfo.translations[0].composition))}}
              ></div>
            </>
          )}
        </Dropdown>
      ) }
      {productInfo?.translations[0]?.nutritionalTable && (
        <Dropdown
          options={[]}
          initialOpenState={false}
          dropdownContainerClass={'desc-block border-b border-t border-extra-light-gray'}
          disableAutoClose={true}
        >
          {({
              isOpen,
              toggle,
            }) => (
            <>
              <div
                className={`flex items-center justify-between w-full cursor-pointer py-4 sm:py-6 ${isOpen ? 'active' : ''}`}
                data-btn
                onClick={toggle}
              >
                <div className="tab-item heading4 ">
                  {t('nutritionalTableLabel')}
                </div>
                <i className="icon icon-plus"></i>
                <i className="icon icon-minus"></i>
              </div>

              <div
                className={`desc-item description formated-text green-marked-link ${isOpen ? 'open' : ''}`}
                dangerouslySetInnerHTML={{__html: cleanHtmlString(String(productInfo.translations[0].nutritionalTable))}}
              ></div>
            </>
          )}
        </Dropdown>
      ) }

      {productInfo?.translations[0]?.expiration && (
        <Dropdown
          options={[]}
          initialOpenState={false}
          dropdownContainerClass={'desc-block border-b border-t border-extra-light-gray'}
          disableAutoClose={true}
        >
          {({
              isOpen,
              toggle,
            }) => (
            <>
              <div
                className={`flex items-center justify-between w-full cursor-pointer py-4 sm:py-6 ${isOpen ? 'active' : ''}`}
                data-btn
                onClick={toggle}
              >
                <div className="tab-item heading4 ">
                  {t('expirationLabel')}
                </div>
                <i className="icon icon-plus"></i>
                <i className="icon icon-minus"></i>
              </div>

              <div
                className={`desc-item description formated-text green-marked-link ${isOpen ? 'open' : ''}`}
              >
                <div className={'flex justify-between gap-4'}>
                  <span className={'heading6'}>{t('expirationLabel')}:</span>
                  <div className={'text-gray-90 text-right'}>{productInfo.translations[0].expiration}</div>
                </div>
              </div>
            </>
          )}
        </Dropdown>
      ) }

      {settings.translation.payInfo && (
        <Dropdown
          options={[]}
          initialOpenState={false}
          dropdownContainerClass={'desc-block border-b border-t border-extra-light-gray'}
          disableAutoClose={true}
        >
          {({
              isOpen,
              toggle,
            }) => (
            <>
              <div
                className={`flex items-center justify-between w-full cursor-pointer py-4 sm:py-6 ${isOpen ? 'active' : ''}`}
                data-btn
                onClick={toggle}
              >
                <div className="tab-item heading4 ">
                  {t('payInfoLabel')}
                </div>
                <i className="icon icon-plus"></i>
                <i className="icon icon-minus"></i>
              </div>

              <div
                className={`desc-item description formated-text green-marked-link ${isOpen ? 'open' : ''}`}
                dangerouslySetInnerHTML={{__html: cleanHtmlString(String(settings.translation.payInfo))}}
              ></div>
            </>
          )}
        </Dropdown>
      ) }

      {settings.translation.deliveryInfo && (
        <Dropdown
          options={[]}
          initialOpenState={false}
          dropdownContainerClass={'desc-block border-b border-t border-extra-light-gray'}
          disableAutoClose={true}
        >
          {({
              isOpen,
              toggle,
            }) => (
            <>
              <div
                className={`flex items-center justify-between w-full cursor-pointer py-4 sm:py-6 ${isOpen ? 'active' : ''}`}
                data-btn
                onClick={toggle}
              >
                <div className="tab-item heading4 ">
                  {t('deliveryInfoLabel')}
                </div>
                <i className="icon icon-plus"></i>
                <i className="icon icon-minus"></i>
              </div>

              <div
                className={`desc-item description formated-text green-marked-link ${isOpen ? 'open' : ''}`}
                dangerouslySetInnerHTML={{__html: cleanHtmlString(String(settings.translation.deliveryInfo))}}
              ></div>
            </>
          )}
        </Dropdown>
      ) }
    </div>
  )
}