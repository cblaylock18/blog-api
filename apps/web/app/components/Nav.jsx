import { Link } from "react-router";

export function Nav() {
    return (
        <nav className="rounded-3xl border border-gray-200 p-6 m-6 dark:border-gray-700">
            <ul className="flex flex-wrap space-x-4 text-2xl">
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li className="ml-auto">
                    <Link to="/login">Login</Link>
                </li>
                <li>
                    <Link to="/create-account">Create Account</Link>
                </li>
            </ul>
        </nav>
    );
}
