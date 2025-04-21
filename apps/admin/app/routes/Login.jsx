import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../components/AuthProvider";
import { jwtDecode } from "jwt-decode";

const apiUrl = import.meta.env.VITE_API_URL;

export function meta() {
    return [{ title: "Log In" }];
}

export default function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user === undefined) return;
        if (user) {
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch(`${apiUrl}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw data;
            }

            const decoded = jwtDecode(data.token);
            login(data.token);

            if (!decoded.author) {
                navigate("/edit-profile", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        } catch (err) {
            if (err.errors && Array.isArray(err.errors)) {
                setError(err.errors);
            } else {
                setError([{ msg: err.message || "Login failed" }]);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (user === undefined) {
        return <p className="p-6">Checking login status…</p>;
    }

    return (
        <main className="container mx-auto p-6 max-w-md">
            <h1 className="text-3xl font-bold mb-4">Log In</h1>

            {error &&
                error.map((err, idx) => (
                    <p key={idx} className="text-red-500 mb-2">
                        {err.msg}
                    </p>
                ))}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label htmlFor="email" className="text-xl">
                    Email
                </label>
                <input
                    id="email"
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded p-2"
                    autoComplete="current-password"
                    required
                />

                <button
                    type="submit"
                    disabled={submitting}
                    className={`bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600
            ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {submitting ? "Logging in…" : "Log In"}
                </button>
            </form>
        </main>
    );
}
