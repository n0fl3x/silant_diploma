import { useAuthContext } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import "../styles/Dashboard.css";


export default function Dashboard () {
    const { isAuthenticated, logout, user } = useAuthContext();
    const [isLoading, setIsLoading] = useState(true);

    useEffect( () =>
        {
            if ( !isAuthenticated ) {
                window.location.href = "/login";
            }
            else {
                setIsLoading(false);
            }
        },
        [isAuthenticated]
    );

    if ( isLoading ) {
        return <div>Загрузка личного кабинета...</div>
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>
                    Личный кабинет
                </h1>
                {user && <p>Добро пожаловать, {user.username}!</p>}
            </header>
            <main className="dashboard-content">
                <p>
                    Здесь будет основной контент личного кабинета.
                </p>
            </main>
        </div>
    )
};
