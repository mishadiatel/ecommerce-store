'use client';

import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cartStore';
import Loader from '@/components/ui/loader/Loader';
import { Link } from '@/i18n/navigation';
import { useEffect, useRef, useState } from 'react';
import { Page } from '@/types/pages';
import { useAuthStore } from '@/stores/authStore';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input/Input';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { RadioGroup } from '@/components/ui/radioGroup/RadioGroup';
import { Textarea } from '@/components/ui/textarea/Textarea';
import AsyncSelect from 'react-select/async';
import { projectApi } from '@/lib/axios';

export default function CheckoutPageComponent({ pageInfo }: { pageInfo: Page }) {
  const t = useTranslations();
  const freeShippingPrice = 2000;
  const cartTotalPrice = useCartStore(s => s.cart?.total) || 0;
  const cartItems = useCartStore(s => s.cart?.items);
  const isCartLoading = useCartStore(s => s.isLoading);
  const totalProducts = useCartStore(s =>
    s.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  );
  const isAuth = useAuthStore(s => s.isAuth);
  const asideRef = useRef<HTMLDivElement | null>(null);
  const [showBottom, setShowBottom] = useState(false);
  const [warehouseOptions, setWarehouseOptions] = useState<Array<{label: string, value: string}>>([])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleScroll = () => {
      if (!asideRef.current) return;
      const isMobile = window.innerWidth < 1024;
      if (!isMobile) {
        setShowBottom(false);
        return;
      }
      const rect = asideRef.current.getBoundingClientRect();
      const isAboveAside = rect.top > window.innerHeight;
      setShowBottom(isAboveAside);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const selectOptionSchema = z.object({
    label: z.string(),
    value: z.string(),
  });

  const checkoutFormSchema = z.object({
    email: z
      .string()
      .trim()
      .min(1, {
        message: t('Form.requiredMessage', { fieldName: t('Checkout.email.label') }),
      })
      .refine(
        val => z.string().email().safeParse(val).success,
        {
          message: t('Form.validEmailMessage', { fieldName: t('Checkout.email.label') }),
        },
      ),
    firstName: z
      .string()
      .trim()
      .min(1, {
        message: t('Form.requiredMessage', { fieldName: t('Checkout.firstName.label') }),
      }),
    lastName: z
      .string()
      .trim()
      .min(1, {
        message: t('Form.requiredMessage', { fieldName: t('Checkout.lastName.label') }),
      }),
    orderForAnotherPerson: z.boolean().optional(),
    anotherFirstName: z.string().optional(),
    anotherLastName: z.string().optional(),
    anotherEmail: z
      .string()
      .trim()
      .or(z.literal(''))
      .refine(
        val => val === '' || z.string().email().safeParse(val).success,
        {
          message: t('Form.validEmailMessage', { fieldName: t('Checkout.email.label') }),
        },
      ),
    deliveryType: z.string().min(1, { message: t('Checkout.requiredDeliveryTypeMessage') }),
    deliveryCity: selectOptionSchema
      .nullable()
      .refine((val) => val !== null, {
        message: t('Form.requiredMessage', {
          fieldName: t('Checkout.city.label'),
        }),
      }),
    deliveryWarehouse: selectOptionSchema
      .nullable()
      .refine((val) => val !== null, {
        message: t('Form.requiredMessage', {
          fieldName: t('Checkout.warehouse.label'),
        }),
      }),
    paymentMethod: z.string().min(1, { message: t('Checkout.paymentMethodRequiredError') }),
    message: z.string().optional(),
    dontCallMe: z.boolean().optional(),
    isAgree: z
      .boolean()
      .refine(val => val === true, {
        message: t('Form.agreeRequiredMessage'),
      }),
  });

  type CheckoutFormData = z.infer<typeof checkoutFormSchema>

  const {
    control,
    handleSubmit,
    watch,
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      orderForAnotherPerson: false,
      anotherFirstName: '',
      anotherLastName: '',
      anotherEmail: '',
      deliveryType: 'novaposhta',
      deliveryCity: null,
      deliveryWarehouse: null,
      paymentMethod: 'online',
      message: '',
      dontCallMe: false,
      isAgree: false,
    },
  });
  const orderForAnotherPerson = watch('orderForAnotherPerson');
  const selectedCity = watch('deliveryCity');

  useEffect(() => {
    setValue('deliveryWarehouse', null);
    if(selectedCity?.value) {
      loadWarehouses('')
    }
  }, [selectedCity, setValue]);

  const onSubmit = (data: CheckoutFormData) => {
    console.log(data);
  };

  const loadCities = async (
    inputValue: string,
  ): Promise<Array<{
    value: string
    label: string
  }>> => {
    const { data } = await projectApi.get(
      '/api/nova-poshta/cities',
      { params: { q: inputValue } },
    );

    return data;
  };
  const loadWarehouses = async (inputValue: string) => {
    if (!selectedCity?.value) return [];

    const { data } = await projectApi.get(
      '/api/nova-poshta/warehouses',
      {
        params: {
          cityRef: selectedCity.value,
          q: inputValue,
        },
      },
    );

    setWarehouseOptions(data)
    return data
  };


  return (
    <>
      <div className="cart-block my-[64px] sm:my-[80px] lg:my-[100px] !mt-0">
        <div className="container">
          {isCartLoading ? (
            <div className={'flex items-center justify-center'}>
              <Loader />
            </div>
          ) : (
            <>
              {cartItems && cartItems?.length > 0 ? (
                <div className="content-main ">
                  <form className={'flex flex-col lg:flex-row justify-between gap-10 sm:gap-8'}
                        onSubmit={handleSubmit(onSubmit)}>
                    <div className="w-full flex-grow">
                      {pageInfo?.breadcrumbTitle && (
                        <div className="heading1 mb-6 sm:mb-8">
                          {pageInfo.breadcrumbTitle}
                        </div>
                      )}

                      {!isAuth && (
                        <div className="p-3 sm:p-4 mb-4 lg:mb-6 bg-green-50 rounded-lg flex items-center gap-2 w-full">
                          <div className="text-sm sm:text-base text-gray-90">
                            {t('Checkout.haveAccountQuestion')}
                          </div>

                          <Link href={'/account/login'}
                                className="text-sm font-bold uppercase text-primary-green">{t('Checkout.loginButtonText')}</Link>
                        </div>
                      )}
                      <div className="heading2 mb-4 lg:mb-5">
                        {t('Checkout.yourContactDataTitle')}
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5 mb-4">
                        <Input
                          control={control}
                          name={'firstName'}
                          placeholder={t('Checkout.firstName.placeholder')}
                          label={t('Checkout.firstName.label')}
                        />
                        <Input
                          control={control}
                          name={'lastName'}
                          placeholder={t('Checkout.lastName.placeholder')}
                          label={t('Checkout.lastName.label')}
                        />
                        <Input
                          control={control}
                          name={'email'}
                          placeholder={t('Checkout.email.placeholder')}
                          label={t('Checkout.email.label')}
                        />
                      </div>
                      <div className={'mb-4'}>
                        <div className={'w-fit'}><Checkbox control={control} name={'orderForAnotherPerson'}
                                                           label={t('Checkout.otherRecipientLabel')} /></div>
                        {orderForAnotherPerson && (
                          <div className={'my-8'}>
                            <div className="heading2 mb-4 lg:mb-5">{t('Checkout.otherRecipientTitle')}</div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">
                              <Input
                                control={control}
                                name={'anotherFirstName'}
                                placeholder={t('Checkout.firstName.placeholder')}
                                label={t('Checkout.firstName.label')}
                              />
                              <Input
                                control={control}
                                name={'anotherLastName'}
                                placeholder={t('Checkout.lastName.placeholder')}
                                label={t('Checkout.lastName.label')}
                              />
                              <Input
                                control={control}
                                name={'anotherEmail'}
                                placeholder={t('Checkout.email.placeholder')}
                                label={t('Checkout.email.label')}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className={'my-8'}>
                        <div className="heading2 mb-4 lg:mb-5">{t('Checkout.deliveryTitle')}</div>
                        <div className={'flex flex-col gap-8'}>
                          <RadioGroup control={control} name={'deliveryType'} options={[
                            { value: 'novaposhta', label: t('Checkout.novaPoshtaLabel') },
                          ]} />


                          <Controller
                            name={'deliveryCity'}
                            control={control}
                            render={({ field, fieldState }) => (
                              <div className={'input-wrapper'}>
                                <span className={'input-label'}>{t('Checkout.city.label')}</span>
                                <AsyncSelect
                                  {...field}
                                  cacheOptions
                                  loadOptions={loadCities}
                                  defaultOptions={
                                    field.value ? [field.value] : []
                                  }
                                  placeholder={t('Checkout.city.placeholder')}
                                  isClearable
                                  noOptionsMessage={() => t('Checkout.noOptionsMessage')}
                                  loadingMessage={() => t('Checkout.loadingMessage')}
                                />
                                {fieldState.error && (
                                  <div className="error-message">{fieldState.error.message}</div>
                                )}
                              </div>

                            )}
                          />
                          <Controller
                            name={'deliveryWarehouse'}
                            control={control}
                            render={({ field, fieldState }) => (
                              <div className={'input-wrapper'}>
                                <span className={'input-label'}>{t('Checkout.warehouse.label')}</span>
                                <AsyncSelect
                                  {...field}
                                  cacheOptions={false}
                                  defaultOptions={warehouseOptions}
                                  loadOptions={loadWarehouses}
                                  placeholder={t('Checkout.warehouse.placeholder')}
                                  isClearable
                                  noOptionsMessage={() => t('Checkout.noOptionsMessage')}
                                  loadingMessage={() => t('Checkout.loadingMessage')}
                                  isDisabled={!selectedCity?.value}
                                />
                                {fieldState.error && (
                                  <div className="error-message">{fieldState.error.message}</div>
                                )}
                              </div>

                            )}
                          />


                        </div>
                      </div>

                      <div className={'mt-8'}>
                        <div className="heading2 mb-4 lg:mb-5">{t('Checkout.paymentMethodTitle')}</div>
                        <div className={'flex flex-col gap-8'}>
                          <RadioGroup control={control} name={'paymentMethod'} options={[
                            { value: 'online', label: t('Checkout.paymentMethodOnlineLabel') },
                            { value: 'afterPay', label: t('Checkout.paymentMethodAfterPayLabel') },
                          ]} />
                          <Textarea
                            control={control}
                            name={'message'}
                            placeholder={t('Checkout.message.placeholder')}
                            label={t('Checkout.message.label')}
                          />
                          <div className={'w-fit'}>
                            <Checkbox control={control} name={'dontCallMe'}
                                      label={t('Checkout.dontCallMeLabel')} />
                          </div>
                        </div>
                      </div>


                    </div>

                    <div
                      className="w-full lg:flex-[0_0_405px] checkout-aside"
                      ref={asideRef}
                    >
                      <div className="checkout-block bg-extra-light-gray px-5 py-6 rounded-2xl lg:sticky lg:top-[90px]">
                        <div className="font-semibold sm:font-bold text-[22px] sm:text-[28px] lg:text-[32px] mb-6">
                          {t('Cart.asideTitle')}
                        </div>
                        {/*<div className="input-wrapper mb-4">*/}
                        {/*  <input type="text"*/}
                        {/*         className="input coupon-input bg-white !pr-[130px]"*/}
                        {/*         placeholder={t('Checkout.promocodeInputPlaceholder')} />*/}
                        {/*  <button type="button"*/}
                        {/*          className="text-sm font-bold uppercase text-primary-green absolute top-4 right-6">*/}
                        {/*    {t('Checkout.applyPromocodeButtonText')}*/}
                        {/*  </button>*/}
                        {/*</div>*/}
                        <div
                          className="flex items-center justify-between pb-3 mb-3 sm:mb-4 sm:pb-4 border-b border-b-gray-20">
                        <span
                          className="heading-6 text-gray-90 js--checkout-total-items">{t('Product.productsCount', { count: totalProducts })}:</span>
                          <span
                            className="secondary-body text-gray-90 ">{cartTotalPrice} {t('Product.currencyUah')}</span>
                        </div>

                        <div
                          className="flex items-center gap-4 justify-between pb-3 mb-3 sm:mb-4 sm:pb-4 border-b border-b-gray-20">
                          <span className="heading-6 text-gray-90">{t('Cart.deliveryTitle')}</span>
                          <span className="secondary-body text-gray-90 text-right">
                          {(cartTotalPrice >= freeShippingPrice) ? t('Cart.freeDeliveryLabel') : t('Cart.paidDeliveryLabel')}
                        </span>
                        </div>
                        <div className="flex items-center gap-4 justify-between mb-6 js--checkout-bottom-element">
                          <span
                            className="font-semibold text-black text-lg sm:text-xl">{t('Checkout.totalToPaidLabel')}</span>
                          <span
                            className="font-semibold text-black text-lg sm:text-xl">{cartTotalPrice} {t('Product.currencyUah')}</span>
                        </div>
                        <div className={'mb-5 sm:mb-6'}>
                          <Checkbox control={control} name={'isAgree'} label={t.rich('Checkout.agree.label', {
                            link: (chunks) => (
                              <Link
                                href="/privacy-policy"
                                className="text-primary-green underline hover:no-underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {chunks}
                              </Link>
                            ),
                          })} />
                        </div>
                        <div className="block-button flex flex-col items-center gap-y-4 mt-5">
                          <button
                            type={'submit'}
                            className="checkout-btn button-main text-center !w-full">
                            {t('Cart.checkoutButtonText')}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`checkout-bottom ${showBottom ? 'active' : ''}`}
                    >
                      <div className="container">
                        <div className="flex items-center justify-between mb-6">
                          <span
                            className="font-semibold text-black text-lg sm:text-xl">{t('Cart.totalLabelText')}</span>
                          <span className="font-semibold text-black text-lg sm:text-xl ">
                          {cartTotalPrice} {t('Product.currencyUah')}
                        </span>
                        </div>
                        <button
                          type={'submit'}
                          className="checkout-btn button-main text-center !w-full">
                          {t('Cart.checkoutButtonText')}
                        </button>
                      </div>
                    </div>
                  </form>

                </div>
              ) : (
                <>
                  <div
                    className={'font-semibold lg:font-bold text-center text-xl sm:text-[22px] lg:text-[32px] mb-5 sm:mb-6 lg:mb-8'}>{t('Cart.emptyCartMessage')}</div>
                  <div className="flex flex-col items-center gap-8">
                    <Link className="button-main w-full sm:w-fit"
                          href={'/products'}>{t('Cart.catalogButtonText')}</Link>
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </div>
    </>

  );
}