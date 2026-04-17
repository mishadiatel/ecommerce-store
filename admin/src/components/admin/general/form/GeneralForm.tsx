'use client';

import { GeneralSettings } from '@/types/general';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import InputGroup from '@/components/admin/ui/inputGroup';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import FileInput from '@/components/admin/ui/fileInput';
import { updateSettings } from '@/services/general';

interface GeneralFormProps {
  generalSettings?: GeneralSettings;
}

export default function GeneralForm({generalSettings}: GeneralFormProps) {
  const t = useTranslations('general');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');
  const tVal = useTranslations('validation');
  const editGeneralSettingsSchema = z.object({
    companyName: z.string({ error: tVal('required', { field: tFields('companyName') }) }).min(1, { message: tVal('required', { field: tFields('companyName') }) }),
    logo:  z.string({ error: tVal('required', { field: tFields('logo') }) }).min(1, { message: tVal('required', { field: tFields('logo') }) })
    .refine(
      (val) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(val.split("?")[0]),
      {
        message: tVal('invalidImageExtension'),
      }
    ),
    favicon: z.string({ error: tVal('required', { field: tFields('favicon') }) }).min(1, { message: tVal('required', { field: tFields('favicon') }) })
      .refine(
        (val) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(val.split("?")[0]),
        {
          message: tVal('invalidImageExtension'),
        }
      ),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    telegram: z.string().optional(),
    phoneNumber: z.string().optional(),
    instagram: z.string().optional(),
    email: z.union([
      z.string().email(),
      z.literal(''),
    ]).optional(),

    mailjetName: z.string().optional(),
    mailjetEmail: z.union([
      z.string().email(),
      z.literal(''),
    ]).optional(),
  });
  type EditGenealSettingsData = z.infer<typeof editGeneralSettingsSchema>

  const {
    control,
    handleSubmit,
  } = useForm<EditGenealSettingsData>({
    resolver: zodResolver(editGeneralSettingsSchema),
    mode: 'onChange',
    defaultValues: {
      companyName: generalSettings?.companyName || '',
      logo: generalSettings?.logo || '',
      favicon: generalSettings?.favicon || '',
      instagram: generalSettings?.instagram || '',
      facebook: generalSettings?.facebook || '',
      tiktok: generalSettings?.tiktok || '',
      telegram: generalSettings?.telegram || '',
      phoneNumber: generalSettings?.phoneNumber || '',
      email: generalSettings?.email || '',
      mailjetName: generalSettings?.mailjetName || '',
      mailjetEmail: generalSettings?.mailjetEmail || '',
    },
  });

  const onSubmit = (data: EditGenealSettingsData) => {

    const preparedData = {
      ...data,
      email: data.email ?? '',
    };
    console.log(preparedData);
    updateSettings(preparedData)
      .then(data => {
        toast.success(t('toast.updated'));
      }).catch(error => {
      toast.error(t('toast.updateError'));
    }).finally(() => {
    });
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={'grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6'}>
        <InputGroup control={control} name={'companyName'} label={tFields('companyName')} placeholder={tFields('companyName')} />
        <FileInput control={control} name={`logo`} label={tFields('logo')} placeholder={tFields('logo')} />
        <FileInput control={control} name={`favicon`} label={tFields('favicon')} placeholder={tFields('favicon')} />
        <InputGroup control={control} name={'instagram'} label={tFields('instagram')} placeholder={tFields('instagram')} />
        <InputGroup control={control} name={'facebook'} label={tFields('facebook')} placeholder={tFields('facebook')} />
        <InputGroup control={control} name={'tiktok'} label={tFields('tiktok')} placeholder={tFields('tiktok')} />
        <InputGroup control={control} name={'telegram'} label={tFields('telegram')} placeholder={tFields('telegram')} />
        <InputGroup control={control} name={'phoneNumber'} label={tFields('phoneNumber')} placeholder={tFields('phoneNumber')} />
        <InputGroup control={control} name={'email'} label={tCommon('email')} placeholder={tCommon('email')} />
        <InputGroup control={control} name={'mailjetEmail'} label={tFields('mailjetEmail')} placeholder={tFields('mailjetEmail')} />
        <InputGroup control={control} name={'mailjetName'} label={tFields('mailjetName')} placeholder={tFields('mailjetName')} />
      </div>
      <Button type="submit" className={'w-fit'}>{tCommon('saveChanges')}</Button>

    </form>
  )
}
