import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../components/AuthProvider";
import { Editor } from "@tinymce/tinymce-react";

const apiUrl = import.meta.env.VITE_API_URL;
const tinyMCEAPIKey = import.meta.env.VITE_TINYMCE_API_KEY;

export function meta() {
    return [{ title: "Create a New Post" }];
}

export default function NewPost() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const editorRef = useRef(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [published, setPublished] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (token === undefined) return;
        if (token === null) {
            navigate("/login", { replace: true });
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

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
            navigate(`/post/${data.post.id}`, { replace: true });
        } catch (err) {
            setError(
                err.errors ?? [{ msg: err.message || "Post creation failed" }]
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (token === undefined) {
        return <p className="p-6">Checking authentication…</p>;
    }
    if (token === null) {
        return null;
    }

    return (
        <main className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>

            {error &&
                error.map((err, i) => (
                    <p key={i} className="text-red-500 mb-2">
                        {err.msg}
                    </p>
                ))}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex items-center text-lg">
                    <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="mr-2"
                        disabled={submitting}
                    />
                    Publish now
                </label>

                <label htmlFor="title" className="text-lg">
                    Title
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border rounded p-2"
                    disabled={submitting}
                    required
                />

                <label className="text-lg">Body</label>
                <Editor
                    apiKey={tinyMCEAPIKey}
                    onInit={(_, editor) => (editorRef.current = editor)}
                    initialValue={content}
                    init={{
                        height: 400,
                        menubar: false,
                        plugins: [
                            "advlist",
                            "autolink",
                            "lists",
                            "link",
                            "image",
                            "charmap",
                            "preview",
                            "anchor",
                            "searchreplace",
                            "visualblocks",
                            "code",
                            "fullscreen",
                            "insertdatetime",
                            "media",
                            "table",
                            "paste",
                            "help",
                            "wordcount",
                        ],
                        toolbar:
                            "undo redo | formatselect | bold italic backcolor | " +
                            "alignleft aligncenter alignright alignjustify | " +
                            "bullist numlist outdent indent | removeformat | help",
                    }}
                    onEditorChange={(newHtml) => setContent(newHtml)}
                />

                <button
                    type="submit"
                    disabled={submitting}
                    className={`mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 ${
                        submitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {submitting ? "Submitting…" : "Submit Post"}
                </button>
            </form>
        </main>
    );
}
