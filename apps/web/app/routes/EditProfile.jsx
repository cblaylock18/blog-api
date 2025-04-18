import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../components/AuthProvider";
import { redirect } from "react-router";

const apiUrl = import.meta.env.VITE_API_URL;

export function meta() {
    return [{ title: "Edit Profile" }];
}

export async function clientLoader() {
    let token;

    if (typeof window !== "undefined") {
        token = localStorage.getItem("jwt");
    }
    if (!token) return redirect("/login");

    const res = await fetch(`${apiUrl}/profile`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Response("Failed to fetch user: ", {
            status: res.status,
        });
    }

    const data = await res.json();

    return data;
}

export default function EditProfile({ loaderData }) {
    const user = loaderData;
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [author, setAuthor] = useState(user.author);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login, token } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch(`${apiUrl}/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
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

        console.log(data);

        if (res.ok && data.token) {
            login(data.token);
            navigate(-1);
        } else {
            if (data.errors && Array.isArray(data.errors)) {
                setError(data.errors);
            } else {
                setError(data.message || "User update failed");
            }
        }
    };

    return (
        <main className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Update Your Profile</h1>
            {error &&
                Array.isArray(error) &&
                error.map((err, index) => (
                    <p key={index} className="text-red-500 mb-4">
                        {err.msg}
                    </p>
                ))}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label htmlFor="email" className="text-xl">
                    Your Email (this is your username)
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded p-2"
                    autoComplete="username"
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
                    autoComplete="new-password"
                    className="border rounded p-2"
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
                    Be a Blog Author?
                </label>
                <button
                    type="submit"
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                >
                    Update Account and Log In
                </button>
            </form>
        </main>
    );
}
