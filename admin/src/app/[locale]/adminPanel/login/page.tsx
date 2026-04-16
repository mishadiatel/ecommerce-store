import LoginForm from '@/components/admin/login/form/LoginForm';

export default function Login() {
  return (
    <div className="admin-panel-shell min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="admin-card p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
              EC
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to your admin dashboard
              </p>
            </div>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
