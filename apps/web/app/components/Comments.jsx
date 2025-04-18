import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { Link, useRevalidator } from "react-router";
import CommentItem from "./CommentItem";
const apiUrl = import.meta.env.VITE_API_URL;

export function Comments({ commentsInitial, postId }) {
    const [comments, setComments] = useState(commentsInitial);
    const [writingComment, setWritingComment] = useState(false);
    const [body, setBody] = useState("");
    const [error, setError] = useState(null);
    const { user, token } = useAuth();
    const revalidator = useRevalidator();

    useEffect(() => setComments(commentsInitial), [commentsInitial]);

    const handleWritingComment = () => setWritingComment(!writingComment);

    const handleComments = (method, commentId, newBody) => async (e) => {
        e.preventDefault();

        let url = `${apiUrl}/post/${postId}/comment`;
        if (commentId) url += `/${commentId}`;

        const contentToSend = newBody !== undefined ? newBody : body;

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: contentToSend }),
            });

            const data = await res.json();

            if (res.ok) {
                setBody("");
                setWritingComment(false);
                revalidator.revalidate();
            } else {
                if (data.errors && Array.isArray(data.errors)) {
                    setError(data.errors);
                } else {
                    setError(data.message || "Comment upload failed");
                }
            }
        } catch {
            setError("Something failed");
        }
    };

    const handlePost = handleComments("POST");
    const handlePut = (id, newBody) => handleComments("PUT", id, newBody);
    const handleDelete = (id) => handleComments("DELETE", id);

    const batchSize = 10;

    const fetchMoreComments = async (e) => {
        e.preventDefault();

        const offset = comments.length;

        const res = await fetch(
            `${apiUrl}/post/${postId}/comment/?offset=${offset}&limit=${batchSize}`
        );

        const data = await res.json();

        if (res.ok && data.post.comments) {
            setComments((prev) => [...prev, ...data.post.comments]);
        } else {
            if (data.errors && Array.isArray(data.errors)) {
                setError(data.errors);
            } else {
                setError(data.message || "Fetching more comments failed");
            }
        }
    };

    return (
        <div className="m-6 pl-10 border-t">
            <h3 className="p-6 pl-0 pb-4 mb-4 text-3xl font-bold">Comments</h3>
            {error &&
                Array.isArray(error) &&
                error.map((err, index) => (
                    <p key={index} className="text-red-500 mb-4">
                        {err.msg}
                    </p>
                ))}
            {user ? (
                <button
                    onClick={handleWritingComment}
                    className="rounded-3xl border border-gray-200 p-4 mb-2 text-2xl font-bold cursor-pointer dark:border-gray-700"
                >
                    {writingComment ? "Close" : "Add a Comment"}
                </button>
            ) : (
                <Link
                    to="/login"
                    className="rounded-3xl border border-gray-200 p-4 mb-2 text-2xl font-bold cursor-pointer dark:border-gray-700"
                >
                    Login to Add a Comment
                </Link>
            )}
            {writingComment ? (
                <form
                    onSubmit={handlePost}
                    className="flex flex-col gap-4 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow"
                >
                    <label htmlFor="content" className="text-xl font-semibold">
                        Comment (1000 character limit)
                    </label>
                    <textarea
                        type="text"
                        maxLength={1000}
                        name="content"
                        id="content"
                        rows="4"
                        onChange={(e) => setBody(e.target.value)}
                        required
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        className="self-start bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer"
                    >
                        Submit
                    </button>
                </form>
            ) : (
                ""
            )}
            <div className="p-6">
                {comments.length === 0 ? (
                    <div className="rounded-3xl border border-gray-200 p-6 mb-6 dark:border-gray-700">
                        <p className="prose text-xl">No comments yet!</p>
                        <p className="pb-4">
                            Your friendly neighborhood Blog API developer!
                        </p>
                    </div>
                ) : (
                    comments.map((c) => (
                        <CommentItem
                            key={c.id}
                            comment={c}
                            userId={user?.id}
                            onUpdate={handlePut}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>
            {comments.length % batchSize === 0 && comments.length > 0 && (
                <button
                    onClick={fetchMoreComments}
                    className="self-start bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer"
                >
                    Load 10 More Comments
                </button>
            )}
        </div>
    );
}
