import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input/Input';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { Link } from '@/i18n/navigation';

export default function SubscribeForm() {
  const t = useTranslations('Subscribe');
  const subscribeFormSchema = z.object({
    email: z
      .string({ error: t('emailRequiredMessage') })
      .min(1, { message: t('emailRequiredMessage') })
      .email(t('emailNotValidMessage')),
    // isAgree: z.literal(true).refine(() => true, {
    //   message: 'You must agree to the privacy policy',
    // }),
    isAgree: z
      .boolean()
      .refine(val => val === true, {
        message: t('agreeRequiredMessage'),
      }),
  });
  type SubscribeFormData = z.infer<typeof subscribeFormSchema>

  const {
    control,
    handleSubmit,
  } = useForm<SubscribeFormData>({
    resolver: zodResolver(subscribeFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      isAgree: false,
    },
  });

  const onSubmit = (data: SubscribeFormData ) => {
    console.log(data);
  };

  return (
    <form className={'w-full h-full relative flex flex-col gap-4'} onSubmit={handleSubmit(onSubmit)}>
      <Input control={control} name={'email'} placeholder={'example@email.com'} className="w-full" />

      <Checkbox control={control} name={'isAgree'} label={t.rich('agreeText', {
          link: (chunks) => (
            <Link
              href="/public-offer-agreement"
              className="text-primary-green underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {chunks}
            </Link>
          ),
        })} />


      <button name="button" type="submit" className="button-main w-full sm:inline-flex">Підписатись
      </button>

    </form>
  )
}