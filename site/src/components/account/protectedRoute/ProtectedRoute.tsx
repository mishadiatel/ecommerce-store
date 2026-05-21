'use client'

import { ReactNode, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/authStore";
import Loader from "@/components/ui/loader/Loader";


export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const router = useRouter();
    const isAuth = useAuthStore(s => s.isAuth);
    const isLoading = useAuthStore(s => s.isLoading);

    useEffect(() => {
        if (!isLoading && !isAuth) {
            router.replace('/account/login');
        }
    }, [isLoading, isAuth, router]);

    if (isAuth) {
        return <>{children}</>;
    }

    return (
        <div className="my-[64px] sm:my-[80px] lg:my-[100px]">
            <div className="container flex items-center justify-center min-h-[40vh]">
                <Loader />
            </div>
        </div>
    );
}
