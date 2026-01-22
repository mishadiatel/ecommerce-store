'use client';

import { useSettings } from '@/context/generalSettings/GeneralSettingsContext';
import { useCategories } from '@/context/categoriesContext/CategoriesContext';
import Image from 'next/image';
import { generateFileUrl } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import SubscribeForm from '@/components/subscribe/form/subscribeForm';

export default function Footer() {
  const settings = useSettings();
  const categories = useCategories();
  const t = useTranslations('Footer');

  return (
    <footer id="footer" className="footer">
      <div className="footer-main bg-green-50">
        <div className="container">
          <div className="content-footer flex justify-between flex-wrap gap-y-6">
            <div className="right-content flex flex-wrap gap-y-8 basis-full lg:justify-between">
              <div
                className="company-infor basis-full sm:basis-1/2 lg:basis-1/4 lg:pr-7 sm:max-lg:order-2 sm:flex sm:flex-col">
                {settings.logo && (
                  <div className="footer__brand">
                    <div className="footer__logo">
                      <Link href={'/'}>
                        <Image src={generateFileUrl(settings.logo)} alt={'logo'} width={180} height={43} />
                      </Link>
                    </div>
                  </div>
                )}

                {(settings.email || settings.translation.schedule) && (
                  <div className="flex flex-col gap-5 mt-6 sm:mt-auto">
                    {settings.translation.schedule && (
                      <div className="flex flex-col">
                        <span
                          className="text-[14px] font-bold uppercase text-primary-green">{t('scheduleLabel')} </span>
                        <span className="text-button mt-2">{settings.translation.schedule}</span>
                      </div>
                    )}

                    {settings.email && (
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold uppercase text-primary-green">{t('emailLabel')}</span>
                        <Link href={`mailto:${settings.email}`}
                              className="text-button hover:underline mt-2">{settings.email}</Link>
                      </div>
                    )}
                  </div>
                )}

              </div>
              <div
                className="list-nav flex max-sm:flex-col justify-between basis-[40%] max-lg:basis-full gap-6 sm:max-lg:gap-0 sm:max-lg:order-1">

                <div className="item flex flex-col basis-full sm:basis-1/2">
                  {settings.companyName && (
                    <div className="text-[22px] font-semibold text-black uppercase">
                      {settings.companyName}
                    </div>
                  )}


                  <Link href={'/about'}
                        className="caption1 has-line-before duration-300 w-fit pt-4">{t('pagesAbout')}</Link>
                  <Link href={'/contacts'}
                        className="caption1 has-line-before duration-300 w-fit pt-4">{t('pagesContacts')}</Link>
                  <Link href={'/faq'}
                        className="caption1 has-line-before duration-300 w-fit pt-4">{t('pagesFaq')}</Link>
                  <Link href={'/delivery-and-payment'}
                        className="caption1 has-line-before duration-300 w-fit pt-4">{t('pagesDelivery')}</Link>
                  <Link href={'/where-to-buy'}
                        className="caption1 has-line-before duration-300 w-fit pt-4">{t('pagesWhereBuy')}</Link>
                  <Link href={'/public-offer-agreement'}
                        className="caption1 has-line-before duration-300 w-fit pt-4">{t('pagesAgreement')}</Link>
                </div>

                {categories && categories.length > 0 && (
                  <div className="item flex flex-col basis-full sm:basis-1/2">
                    <div className="text-[22px] font-semibold text-black">
                      {t('categoriesTitle')}
                    </div>
                    {categories.map(category => (
                      <Link
                        key={category._id}
                        href={`/products/${category.slug}`}
                        className="caption1 has-line-before duration-300 w-fit pt-4">
                        {category.translations[0].name}
                      </Link>
                    ))}
                  </div>

                )}
              </div>

                <div
                  className="newsletter basis-full sm:basis-1/2 lg:basis-1/3 lg:pl-7 max-sm:basis-full max-md:pl-0 sm:max-lg:order-3 sm:max-lg:mt-3">

                  <div className="text-[22px] font-semibold text-black">{t('newsTitle')}</div>
                  <div className="caption1 mt-3">{t('newsMessage')}</div>
                  <div className="input-block w-full mt-4">
                    <SubscribeForm />
                  </div>
                  {(settings.instagram || settings.facebook) && (
                    <div className="list-social flex items-center gap-6 mt-6 sm:mt-8">
                      {settings.instagram && (
                        <Link href={settings.instagram} target={'_blank'} rel={'nofollow'} className={'flex'}>
                          <i className={'icon icon-instagram1'}></i>
                        </Link>
                      )}

                      {settings.facebook && (
                        <Link href={settings.facebook} target={'_blank'} rel={'nofollow'} className={'flex'}>
                          <i className={'icon icon-facebook'}></i>
                        </Link>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom py-4">
          <div className="container">
            <div className="flex items-center justify-center gap-8">
              <div className="text-gray-90 text-[14px] max-sm:text-[12px]">
                Copyright © {settings.companyName} {new Date().getFullYear()}
              </div>
              <div className="text-gray-90 text-[14px] max-sm:text-[12px]">
                {t('rightsReversedText')}
              </div>
            </div>
          </div>
        </div>
    </footer>
)
}