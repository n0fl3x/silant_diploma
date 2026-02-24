import React, { createContext, useContext, useState, useEffect } from "react";


interface AuthContextType {
    isAuthenticated: boolean;
    user: {
        username: string;
        email: string;
    } | null;
    checkAuth: () => Promise<void>;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider(
    { children }: { children: React.ReactNode }
) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<{ username: string; email: string } | null>(null);

    const checkAuth = async () => {
        try {
            const response = await fetch(
                "/api/v1/authenticated",
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if ( response.ok ) {
                const data = await response.json();
                setIsAuthenticated(true);
                setUser(data.user)
            }
            else {
                setIsAuthenticated(false);
                setUser(null)
            }
        }
        catch ( error ) {
            setIsAuthenticated(false);
          setUser(null)
        }
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch("/api/v1/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });
          
            if (response.ok) {
                const data = await response.json();
                setIsAuthenticated(true);
                setUser(data.user || { username, email: "" });
                return true;
            }
            
            return false;
        }
        catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    };

    const logout = async () => {
        await fetch(
            "/api/v1/logout",
            {
                method: "POST",
                credentials: "include"
            }
        );
        setIsAuthenticated(false);
        setUser(null)
    };

    useEffect( () =>
        {
            checkAuth()
        },
        []
    );

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, checkAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
  
    if ( context === undefined ) {
        throw new Error("useAuth must be used within an AuthProvider")
    };
  
    return context
};
