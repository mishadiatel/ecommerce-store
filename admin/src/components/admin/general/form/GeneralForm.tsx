'use client';

import { GeneralSettings } from '@/types/general';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import InputGroup from '@/components/admin/ui/inputGroup';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import FileInput from '@/components/admin/ui/fileInput';
import { updateSettings } from '@/services/general';

interface GeneralFormProps {
  generalSettings?: GeneralSettings;
}

export default function GeneralForm({generalSettings}: GeneralFormProps) {
  const editGeneralSettingsSchema = z.object({
    companyName: z.string({ error: 'companyName is required' }).min(1, { message: 'companyName is required' }),
    logo:  z.string({ error: 'logo is required' }).min(1, { message: 'logo is required' })
    .url("Image must be a valid URL")
    .refine(
      (val) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(val.split("?")[0]),
      {
        message: "Image URL must end with a valid image extension",
      }
    ),
    favicon: z.string({ error: 'favicon is required' }).min(1, { message: 'favicon is required' })
      .url("Image must be a valid URL")
      .refine(
        (val) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(val.split("?")[0]),
        {
          message: "Image URL must end with a valid image extension",
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
        toast.success('Successfully updated general settings!');
      }).catch(error => {
      toast.error('Error while updating settings, try again letter');
    }).finally(() => {
    });
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={'grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6'}>
        <InputGroup control={control} name={'companyName'} label={'companyName'} placeholder={'companyName'} />
        <FileInput control={control} name={`logo`} label="logo" placeholder={'logo'} />
        <FileInput control={control} name={`favicon`} label="favicon" placeholder={'favicon'} />
        <InputGroup control={control} name={'instagram'} label={'instagram'} placeholder={'instagram'} />
        <InputGroup control={control} name={'facebook'} label={'facebook'} placeholder={'facebook'} />
        <InputGroup control={control} name={'tiktok'} label={'tiktok'} placeholder={'tiktok'} />
        <InputGroup control={control} name={'telegram'} label={'telegram'} placeholder={'telegram'} />
        <InputGroup control={control} name={'phoneNumber'} label={'phoneNumber'} placeholder={'phoneNumber'} />
        <InputGroup control={control} name={'email'} label={'email'} placeholder={'email'} />
        <InputGroup control={control} name={'mailjetEmail'} label={'mailjetEmail'} placeholder={'mailjetEmail'} />
        <InputGroup control={control} name={'mailjetName'} label={'mailjetName'} placeholder={'mailjetName'} />
      </div>
      <Button type="submit" className={'w-fit'}>Save changes</Button>

    </form>
  )
}