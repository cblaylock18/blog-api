// src/routes/Post.jsx
import { useState } from "react";
import { useNavigate, useLoaderData } from "react-router";
import { useAuth } from "../components/AuthProvider";
import { Editor } from "@tinymce/tinymce-react";

const apiUrl = import.meta.env.VITE_API_URL;
const tinyMCEAPIKey = import.meta.env.VITE_TINYMCE_API_KEY;

export async function loader({ params }) {
    const { postId } = params;
    const res = await fetch(`${apiUrl}/post/${postId}`);
    if (!res.ok) {
        throw new Response("Failed to load post", { status: res.status });
    }
    const { post } = await res.json();
    return post;
}

export function meta({ data: post }) {
    return [{ title: `Edit: ${post.title}` }];
}

export default function PostEdit() {
    const post = useLoaderData();
    const navigate = useNavigate();
    const { token } = useAuth();

    // initialize form state from the loaded post
    const [title, setTitle] = useState(post.title);
    const [content, setContent] = useState(post.content);
    const [published, setPublished] = useState(post.published);
    const [error, setError] = useState(null);

    const handleEditorChange = (newHtml) => {
        setContent(newHtml);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return navigate("/login", { replace: true });

        try {
            const res = await fetch(`${apiUrl}/author/post/${post.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content, published }),
            });
            const data = await res.json();
            if (!res.ok) throw data;
            // go back to the post view
            navigate(`/post/${post.id}`);
        } catch (err) {
            setError(err.errors ?? [{ msg: err.message || "Update failed" }]);
        }
    };

    return (
        <main className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Edit Post</h1>
            {error &&
                error.map((err, i) => (
                    <p key={i} className="text-red-500 mb-2">
                        {err.msg}
                    </p>
                ))}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex items-center text-xl">
                    <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="mr-2"
                    />
                    Published?
                </label>

                <label htmlFor="title" className="text-xl">
                    Title
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border rounded p-2"
                    required
                />

                <label className="text-xl">Body</label>
                <Editor
                    apiKey={tinyMCEAPIKey}
                    value={content}
                    init={{
                        height: 400,
                        menubar: false,
                        plugins: [
                            "advlist autolink lists link image charmap preview anchor",
                            "searchreplace visualblocks code fullscreen",
                            "insertdatetime media table paste help wordcount",
                        ],
                        toolbar:
                            "undo redo | formatselect | bold italic backcolor | " +
                            "alignleft aligncenter alignright alignjustify | " +
                            "bullist numlist outdent indent | removeformat | help",
                    }}
                    onEditorChange={handleEditorChange}
                />

                <button
                    type="submit"
                    className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700"
                >
                    Save Changes
                </button>
            </form>
        </main>
    );
}
