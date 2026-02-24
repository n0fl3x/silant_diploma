import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";


export default function ProtectedRoute(
    { children }: { children: React.ReactNode }
) {
    const { isAuthenticated, checkAuth } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const hasChecked = useRef(false);

    useEffect( () =>
        {
            if ( hasChecked.current ) return;

            const verifyAuth = async () => {
                hasChecked.current = true;
                await checkAuth();
                setLoading(false)
            };

            verifyAuth();
        },
        [checkAuth]
    );

    if ( loading ) {
        return <div>Проверка авторизации...</div>
    };

    if ( !isAuthenticated ) {
        return <Navigate to="/login" replace />
    };
    
    return <>{children}</>
};
