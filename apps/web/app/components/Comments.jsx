import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Link } from "react-router";
const apiUrl = import.meta.env.VITE_API_URL;

export function Comments({ comments, postId }) {
    const [writingComment, setWritingComment] = useState(false);
    const [body, setBody] = useState("");
    const [error, setError] = useState(null);
    const { user, token } = useAuth();

    const handleWritingComment = () => setWritingComment(!writingComment);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch(`${apiUrl}/post/${postId}/comment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: body }),
        });

        const data = await res.json();

        if (res.ok) {
            setBody("");
            setWritingComment(false);
            location.reload();
        } else {
            if (data.errors && Array.isArray(data.errors)) {
                setError(data.errors);
            } else {
                setError(data.message || "Comment upload failed");
            }
        }
    };

    return (
        <div className="m-6 pl-10 border-t">
            <h3 className="p-6 pl-0 pb-4 mb-4 text-3xl font-bold">Comments</h3>
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
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow"
                >
                    <label htmlFor="content" className="text-xl font-semibold">
                        Comment (1000 character limit)
                    </label>
                    {error &&
                        Array.isArray(error) &&
                        error.map((err, index) => (
                            <p key={index} className="text-red-500 mb-4">
                                {err.msg}
                            </p>
                        ))}
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
                        className="self-start bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded pointer-cursor"
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
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="rounded-3xl border border-gray-200 p-6 mb-6 dark:border-gray-700"
                        >
                            <p className="prose text-xl">{comment.content}</p>
                            <p className="pb-4">
                                {comment.user.firstName +
                                    " " +
                                    comment.user.lastName}
                            </p>
                            <p className="pb-4">{Date(comment.updatedAt)}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
