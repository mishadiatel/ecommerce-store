'use client'

import {ReactNode, useEffect, useState} from "react";
import {useRouter} from "@/i18n/navigation";
import {getMe} from "@/services/auth";
import {useAuthStore} from "@/stores/authStore";
import Loader from "@/components/ui/loader/Loader";


export default function ProtectedRoute({children}: {children: ReactNode}) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const setAuth = useAuthStore(s => s.setAuth)
    const logoutAuth = useAuthStore(s => s.logout)
    useEffect(() => {
        setIsLoading(true)
        getMe()
            .then((data) => {
                if(data) {
                    setAuth(data);
                    setIsAuthenticated(true)
                } else {
                    logoutAuth();
                    router.replace('/account/login');
                }
            })
            .catch(() => {
                setIsLoading(false);
                logoutAuth();
                router.replace('/account/login');
            })
            .finally(() => setIsLoading(false));
    }, [])

    if(isLoading && !isAuthenticated) {
        return  (
            <div className="my-[64px] sm:my-[80px] lg:my-[100px]">
                <div className="container flex items-center justify-center min-h-[40vh]">
                    <Loader />
                </div>
            </div>
        )
    }
    if(!isLoading && isAuthenticated) {
        return (
            <>
                {children}
            </>
        )
    }

    return (
        <div className="my-[64px] sm:my-[80px] lg:my-[100px]">
            <div className="container flex items-center justify-center min-h-[40vh]">
                <Loader />
            </div>
        </div>
    );

}