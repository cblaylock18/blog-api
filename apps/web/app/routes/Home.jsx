export function meta({}) {
    return [
        { title: "Blog" },
        { name: "description", content: "Welcome to the Blog API viewer!" },
    ];
}

export async function clientLoader() {
    const res = await fetch("http://localhost:3000/post");

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
    console.log(posts);

    return (
        <section>
            <h1 className="text-2xl font-bold mb-4">Blog Posts</h1>
            <ul className="space-y-2">
                {posts.map((post) => (
                    <li key={post.id} className="p-4 border rounded">
                        <h2 className="text-xl font-semibold">{post.title}</h2>
                        <p>{post.author}</p>
                        <p>{post.contentPreview}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
