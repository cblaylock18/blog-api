import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../components/AuthProvider";

const apiUrl = import.meta.env.VITE_API_URL;

export function meta() {
    return [{ title: "Log In" }];
}

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch(`${apiUrl}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok && data.token) {
            login(data.token);
            navigate(-1);
        } else {
            if (data.errors && Array.isArray(data.errors)) {
                setError(data.errors);
            } else {
                setError(data.message || "Login failed");
            }
        }
    };

    return (
        <main className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Log In</h1>
            {error &&
                Array.isArray(error) &&
                error.map((err, index) => (
                    <p key={index} className="text-red-500 mb-4">
                        {err.msg}
                    </p>
                ))}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label htmlFor="email" className="text-xl">
                    Username (Your Email)
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded p-2"
                    autoComplete="username"
                    required
                />
                <label htmlFor="password" className="text-xl">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded p-2"
                    autoComplete="current-password"
                    required
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                >
                    Log In
                </button>
            </form>
        </main>
    );
}
