import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../components/AuthProvider";

const apiUrl = import.meta.env.VITE_API_URL;

export function meta() {
    return [{ title: "Log In" }];
}

export default function CreateAccount() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [author, setAuthor] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch(`${apiUrl}/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                password,
                confirmPassword,
                firstName,
                lastName,
                author,
            }),
        });
        const data = await res.json();
        if (res.ok && data.token) {
            login(data.token);
            navigate(-1);
        } else {
            if (data.errors && Array.isArray(data.errors)) {
                setError(data.errors);
            } else {
                setError(data.message || "User creation failed");
            }
        }
    };

    return (
        <main className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Create an Account</h1>
            {error &&
                Array.isArray(error) &&
                error.map((err, index) => (
                    <p key={index} className="text-red-500 mb-4">
                        {err.msg}
                    </p>
                ))}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label htmlFor="email" className="text-xl">
                    Your Email (this will become your username)
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
                    autoComplete="new-password"
                    required
                />
                <label htmlFor="confirmPassword" className="text-xl">
                    Confirm Password
                </label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border rounded p-2"
                    required
                />
                <label htmlFor="firstName" className="text-xl">
                    First Name
                </label>
                <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border rounded p-2"
                    required
                />
                <label htmlFor="lastName" className="text-xl">
                    Last Name
                </label>
                <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border rounded p-2"
                    required
                />
                <label htmlFor="author" className="flex items-center text-xl">
                    <input
                        id="author"
                        name="author"
                        type="checkbox"
                        checked={author}
                        onChange={(e) => setAuthor(e.target.checked)}
                        className="mr-2 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    Would you like to be a blog author? If yes, you'll see a
                    link to the secret blog author site!
                </label>
                <button
                    type="submit"
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                >
                    Create Account and Log In
                </button>
            </form>
        </main>
    );
}
