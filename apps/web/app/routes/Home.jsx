import { Link } from "react-router";
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
    const posts = loaderData;

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
        </section>
    );
}
