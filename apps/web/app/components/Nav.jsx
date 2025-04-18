import { NavLink } from "react-router";
import { useAuth } from "./AuthProvider";

export function Nav() {
    const { user, logout } = useAuth();

    return (
        <nav className="rounded-3xl border border-gray-200 p-6 m-6 dark:border-gray-700">
            <ul className="flex flex-wrap space-x-8 text-2xl">
                <li>
                    <NavLink to="/">Home</NavLink>
                </li>
                {user ? (
                    <>
                        <li className="ml-auto">Hi, {user.name}</li>
                        <li>
                            <NavLink to="/edit-profile">Profile</NavLink>
                        </li>
                        {user.author ? <a href="/">Blog Author Site</a> : ""}
                        <button onClick={logout} className="cursor-pointer">
                            Log Out
                        </button>
                    </>
                ) : (
                    <>
                        <li className="ml-auto">
                            <NavLink to="/login">Login</NavLink>
                        </li>
                        <li>
                            <NavLink to="/create-account">
                                Create Account
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}
