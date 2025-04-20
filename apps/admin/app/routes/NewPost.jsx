import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../components/AuthProvider";
import { Editor } from "@tinymce/tinymce-react";

const apiUrl = import.meta.env.VITE_API_URL;
const tinyMCEAPIKey = import.meta.env.VITE_TINYMCE_API_KEY;

export function meta() {
    return [{ title: "Create a New Post" }];
}

export default function NewPost() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [published, setPublished] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { token } = useAuth();

    const handleEditorChange = (newContent) => {
        setContent(newContent);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return navigate("/login");

        try {
            const res = await fetch(`${apiUrl}/author/post`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content, published }),
            });

            const data = await res.json();
            if (!res.ok) throw data;
            navigate(`/post/${data.post.id}`);
        } catch (err) {
            setError(
                err.errors ?? [{ msg: err.message || "Post creation failed" }]
            );
        }
    };

    return (
        <main className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Create a Post</h1>
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
                    Publish?
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
                    initialValue="<p>Start writing…</p>"
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
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                >
                    Submit Post
                </button>
            </form>
        </main>
    );
}
