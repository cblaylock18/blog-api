import { Link } from "react-router";

export function Nav() {
    return (
        <nav className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
            <ul className="flex space-x-4">
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/login">Login</Link>
                </li>
                <li>
                    <Link to="/create-account">Create Account</Link>
                </li>
            </ul>
        </nav>
    );
}
