import { Link, useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../components/AuthProvider";

const apiUrl = import.meta.env.VITE_API_URL;
const pageSize = 10;

export function meta() {
    return [
        { title: "Blog" },
        { name: "description", content: "Your blog posts dashboard" },
    ];
}

export default function Home() {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchPosts = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/author/post`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw data;
            setPosts(data.allPosts);
        } catch (err) {
            setError(
                err.errors ?? [{ msg: err.message || "Failed to load posts." }]
            );
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (user === undefined) return;
        if (!token || user === null) {
            navigate("/login", { replace: true });
            return;
        }
        if (!user.author) {
            navigate("/edit-profile", { replace: true });
            return;
        }
        fetchPosts();
    }, [user, token, navigate, fetchPosts]);

    const handleToggle = (id, currentlyPublished) => async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(`${apiUrl}/author/post/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (!res.ok) throw data;
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === id ? { ...p, published: !currentlyPublished } : p
                )
            );
        } catch (err) {
            setError(
                err.errors ?? [
                    { msg: err.message || "Failed to toggle publish." },
                ]
            );
        }
    };

    const handleDelete = (id) => async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(`${apiUrl}/author/post/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw data;
            setPosts((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            setError(
                err.errors ?? [{ msg: err.message || "Failed to delete post." }]
            );
        }
    };

    const fetchMorePosts = async (e) => {
        e.preventDefault();
        setError(null);
        setLoadingMore(true);
        try {
            const res = await fetch(
                `${apiUrl}/author/post?offset=${posts.length}&limit=${pageSize}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (!res.ok) throw data;
            setPosts((prev) => [...prev, ...data.allPosts]);
        } catch (err) {
            setError(
                err.errors ?? [
                    { msg: err.message || "Loading more posts failed." },
                ]
            );
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <section className="container mx-auto p-6">
            <h2 className="text-3xl font-bold mb-4">Your Blog Posts</h2>
            <Link
                to="/new-post"
                className="inline-block mb-6 rounded border px-4 py-2 hover:bg-gray-500"
            >
                + New Post
            </Link>

            {error &&
                error.map((e, i) => (
                    <p key={i} className="text-red-500 mb-2">
                        {e.msg}
                    </p>
                ))}

            {loading ? (
                <p>Loading posts…</p>
            ) : posts.length === 0 ? (
                <p>No posts yet — click “New Post” to get started.</p>
            ) : (
                <ul className="space-y-4">
                    {posts.map((post) => (
                        <li
                            key={post.id}
                            className="border rounded-lg p-4 flex flex-col space-y-2"
                        >
                            <div className="flex items-center">
                                <Link
                                    to={`/post/${post.id}`}
                                    className="flex-1"
                                >
                                    <h3 className="text-2xl font-semibold">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {post.contentPreview}
                                    </p>
                                </Link>
                                <span className="ml-4 text-sm">
                                    {post.published ? "✅ Published" : "Draft"}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleToggle(
                                        post.id,
                                        post.published
                                    )}
                                    disabled={loadingMore}
                                    className="px-3 py-1 border rounded hover:bg-gray-500 disabled:opacity-50 cursor-pointer"
                                >
                                    {post.published ? "Unpublish" : "Publish"}
                                </button>
                                <button
                                    onClick={handleDelete(post.id)}
                                    disabled={loadingMore}
                                    className="px-3 py-1 border rounded hover:bg-red-100 text-red-600 disabled:opacity-50 cursor-pointer"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {posts.length % pageSize === 0 && posts.length > 0 && (
                <button
                    onClick={fetchMorePosts}
                    disabled={loadingMore}
                    className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loadingMore ? "Loading…" : "Load 10 More Posts"}
                </button>
            )}
        </section>
    );
}
