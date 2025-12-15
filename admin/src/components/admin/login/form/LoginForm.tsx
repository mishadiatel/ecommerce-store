'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import InputGroup from '@/components/admin/ui/inputGroup';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { login } from '@/services/auth';
import { useRouter } from '@/i18n/navigation';


export default function LoginForm() {
  const router = useRouter();
  const loginFormSchema = z.object({
    email: z.string({ error: 'email is required' }).min(1, { message: 'email is required' }).email(),
    password: z.string({ error: 'passwrod is required' }).min(8, { message: 'password min length 8' }),
  });
  type LoginFormData = z.infer<typeof loginFormSchema>

  const {
    control,
    handleSubmit,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data)
      .then(data => {
        if(data.userData.role === 'admin') {
          toast.success('Successfully login!');
          router.push('/adminPanel/admin823479234/dashboard');
        }else {
          toast.error('please login as admin');
        }

      }).catch(error => {
        toast.error(error.response.data.message);
      });
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className={'w-full flex flex-col gap-6'}>
      <InputGroup control={control} name={'email'} label={'email'} placeholder={'email'} />
      <InputGroup control={control} name={'password'} label={'password'} placeholder={'password'} />
      <Button type="submit" className={'w-fit'}>Login</Button>
    </form>
  );
}