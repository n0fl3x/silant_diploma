import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthRedirect } from "../hooks/UseAuthRedirect";
import { useAuth } from "../contexts/AuthContext";


const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useAuthRedirect(
        "/dashboard",
        isAuthenticated === true
    );

    if ( isAuthenticated === null ) {
        return <div>Проверка авторизации...</div>
    };

    if ( isAuthenticated ) {
        return null
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "/api/v1/token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        { username, password }
                    ),
                }
            );

            const data = await response.json();

            if ( response.ok && data.success ) {
                navigate("/dashboard")
            }
            else {
                setError(data.error || "Неверные учётные данные.");
            }
        }
        catch (err) {
            setError("Ошибка подключения к серверу.")
        }
        finally {
            setLoading(false)
        }
    };

    return (
        <div className="login-container">
            <h1>
                Вход в систему
            </h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label htmlFor="username">
                        Логин:
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={ (e) => setUsername(e.target.value) }
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">
                        Пароль:
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={ (e) => setPassword(e.target.value) }
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Вход..." : "Войти"}
                </button>
            </form>
        </div>
    )
};

export default Login;
