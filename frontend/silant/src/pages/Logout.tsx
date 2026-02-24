import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function Logout() {
    const navigate = useNavigate();

    useEffect( () =>
        {
            const performLogout = async () => {
                try {
                    const response = await fetch(
                        "/api/v1/logout",
                        {
                            method: "POST",
                            credentials: "include"
                        }
                    );

                    if ( response.ok ) {
                        navigate(
                            "/login",
                            { replace: true }
                        )
                    }
                    else {
                        navigate(
                            "/login",
                            { replace: true }
                        )
                    }
                }
                catch (error) {
                    console.error("Logging out error:", error);
                    navigate(
                        "/login",
                        { replace: true }
                    )
                }
            };

            performLogout();
        },
        [navigate]
    );

    return (
        <div className="logout-container">
            <p>
                Выход...
            </p>
        </div>
    )
};
