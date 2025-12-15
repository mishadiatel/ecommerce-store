import LoginForm from '@/components/admin/login/form/LoginForm';

export default function Login() {
  return (
    <div className={'flex flex-col justify-center items-center min-h-screen gap-8 p-4 w-[400px] max-w-full mx-auto'}>
      <span>Login page</span>
      <LoginForm />

    </div>
  )
}