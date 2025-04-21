import { Link } from "react-router";
import { useState, useEffect } from "react";
const apiUrl = import.meta.env.VITE_API_URL;

export function meta({}) {
    return [
        { title: "Blog" },
        { name: "description", content: "Welcome to the Blog API viewer!" },
    ];
}

export async function loader() {
    const res = await fetch(`${apiUrl}/post`);

    if (!res.ok) {
        throw new Response("Failed to fetch posts: ", {
            status: res.status,
        });
    }

    const postsRaw = await res.json();
    const posts = Array.from(postsRaw.allPosts);

    return posts;
}

export default function Home({ loaderData }) {
    const [posts, setPosts] = useState(loaderData);
    const [error, setError] = useState(null);

    const batchSize = 10;

    useEffect(() => {
        console.log(apiUrl);
    });

    const fetchMorePosts = async (e) => {
        e.preventDefault();

        const offset = posts.length;

        const res = await fetch(
            `${apiUrl}/post/?offset=${offset}&limit=${batchSize}`
        );

        const data = await res.json();

        if (res.ok && data.allPosts) {
            setPosts((prev) => [...prev, ...data.allPosts]);
        } else {
            if (data.errors && Array.isArray(data.errors)) {
                setError(data.errors);
            } else {
                setError(data.message || "Fetching more posts failed");
            }
        }
    };

    return (
        <section>
            <h2 className="text-3xl font-bold mb-4 p-6 pb-0">Blog Posts</h2>
            <ul className="space-y-2 p-6">
                {posts.map((post) => (
                    <li
                        key={post.id}
                        className="rounded-3xl border border-white-200 p-4 mb-6 hover:scale-99 dark:border-white-700"
                    >
                        <Link to={`/post/${post.id}`}>
                            <h2 className="text-2xl font-semibold">
                                {post.title}
                            </h2>
                            <p className="pb-4">{post.author}</p>
                            <p>{post.contentPreview}</p>
                        </Link>
                    </li>
                ))}
            </ul>
            {error &&
                Array.isArray(error) &&
                error.map((err, index) => (
                    <p key={index} className="text-red-500 mb-4">
                        {err.msg}
                    </p>
                ))}
            {posts.length % batchSize === 0 && posts.length > 0 && (
                <button
                    onClick={fetchMorePosts}
                    className="self-start bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 ml-6 mb-4 rounded cursor-pointer"
                >
                    Load 10 More Posts
                </button>
            )}
        </section>
    );
}
