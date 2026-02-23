import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";


export default function Dashboard () {
    const { isAuthenticated, logout, user } = useAuth();
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
                <button onClick={logout} className="logout-button">
                    Выйти
                </button>
            </header>
            <main className="dashboard-content">
                <p>
                    Здесь будет основной контент личного кабинета.
                </p>
            </main>
        </div>
    )
};
