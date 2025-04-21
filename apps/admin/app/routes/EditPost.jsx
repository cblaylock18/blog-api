import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../components/AuthProvider";
import { Editor } from "@tinymce/tinymce-react";
import CommentItem from "../components/CommentItem";

const apiUrl = import.meta.env.VITE_API_URL;
const tinyMCEAPIKey = import.meta.env.VITE_TINYMCE_API_KEY;

export function meta() {
    return [{ title: "Edit Post" }];
}

export default function PostEdit() {
    const { postId } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [published, setPublished] = useState(false);

    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [newBody, setNewBody] = useState("");
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (token === undefined) return;
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        (async () => {
            try {
                const res = await fetch(`${apiUrl}/author/post/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw data;

                setTitle(data.post.title);
                setContent(data.post.content);
                setPublished(data.post.published);
            } catch (err) {
                setError(err.errors ?? [{ msg: err.message }]);
            } finally {
                setLoading(false);
            }
        })();
    }, [postId, token, navigate]);

    const loadComments = useCallback(async () => {
        if (!token) return;
        setLoadingComments(true);
        try {
            const res = await fetch(`${apiUrl}/post/${postId}/comment`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw data;
            setComments(data.post.comments || []);
        } catch (err) {
            console.error("Failed to load comments", err);
        } finally {
            setLoadingComments(false);
        }
    }, [postId, token]);

    useEffect(() => {
        if (!loading && token) loadComments();
    }, [loading, token, loadComments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(`${apiUrl}/author/post/${postId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content, published }),
            });
            const data = await res.json();
            if (!res.ok) throw data;
            navigate(`/post/${postId}`, { replace: true });
        } catch (err) {
            setError(err.errors ?? [{ msg: err.message || "Update failed." }]);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newBody.trim()) return;
        setPosting(true);
        try {
            const res = await fetch(`${apiUrl}/post/${postId}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newBody }),
            });
            const data = await res.json();
            if (!res.ok) throw data;
            setNewBody("");
            await loadComments();
        } catch (err) {
            console.error("Failed to add comment", err);
        } finally {
            setPosting(false);
        }
    };

    const handleDeleteComment = (commentId) => async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(
                `${apiUrl}/post/${postId}/comment/${commentId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json();
            if (!res.ok) throw data;
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (err) {
            console.error("Failed to delete comment", err);
        }
    };

    const handleUpdateComment = (commentId, newBody) => async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(
                `${apiUrl}/post/${postId}/comment/${commentId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ content: newBody }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw data;
            await loadComments();
        } catch (err) {
            console.error("Failed to update comment", err);
        }
    };

    if (loading) {
        return <p className="p-6">Loading post…</p>;
    }

    return (
        <main className="container mx-auto p-6 space-y-8">
            {error?.map((e, i) => (
                <p key={i} className="text-red-500">
                    {e.msg}
                </p>
            ))}
            <section>
                <h1 className="text-3xl font-bold mb-4">Edit Post</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                            className="mr-2"
                        />
                        Published?
                    </label>
                    <label htmlFor="title" className="font-semibold">
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
                    <label className="font-semibold">Body</label>
                    <Editor
                        apiKey={tinyMCEAPIKey}
                        value={content}
                        init={{
                            height: 300,
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
                        onEditorChange={(newHtml) => setContent(newHtml)}
                    />
                    <button
                        type="submit"
                        className="mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                    >
                        Save Changes
                    </button>
                </form>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-2">Add a Comment</h2>
                <form onSubmit={handleAddComment} className="space-y-2">
                    <textarea
                        rows={3}
                        value={newBody}
                        onChange={(e) => setNewBody(e.target.value)}
                        placeholder="Write your comment…"
                        className="w-full border rounded p-2"
                        required
                        disabled={posting}
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={posting}
                    >
                        {posting ? "Posting…" : "Post Comment"}
                    </button>
                </form>
            </section>

            {/* ─── Comments List ─── */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Comments</h2>
                {loadingComments ? (
                    <p>Loading comments…</p>
                ) : comments.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    <div className="space-y-4">
                        {comments.map((c) => (
                            <CommentItem
                                key={c.id}
                                comment={c}
                                userId={user.id}
                                onDelete={handleDeleteComment}
                                onUpdate={handleUpdateComment}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
