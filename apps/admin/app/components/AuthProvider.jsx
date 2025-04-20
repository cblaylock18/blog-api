import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem("jwt");

        if (stored) {
            try {
                const decoded = jwtDecode(stored);

                if (decoded.exp * 1000 > Date.now()) {
                    setToken(stored);
                    setUser(decoded);
                } else {
                    localStorage.removeItem("jwt");
                }
            } catch {
                localStorage.removeItem("jwt");
            }
        }
    }, []);

    const login = (newToken) => {
        localStorage.setItem("jwt", newToken);
        setToken(newToken);
        setUser(jwtDecode(newToken));
    };

    const logout = () => {
        localStorage.removeItem("jwt");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
