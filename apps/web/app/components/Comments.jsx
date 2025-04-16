import { useState } from "react";
const apiUrl = import.meta.env.VITE_API_URL;

export function Comments({ comments, postId }) {
    const [writingComment, setWritingComment] = useState(false);

    const handleWritingComment = () => setWritingComment(!writingComment);

    return (
        <div className="m-6 pl-10 border-t">
            <h3 className="p-6 pl-0 pb-4 text-3xl font-bold">Comments</h3>
            <button
                onClick={handleWritingComment}
                className="rounded-3xl border border-gray-200 p-4 mb-2 text-2xl font-bold cursor-pointer dark:border-gray-700"
            >
                {writingComment
                    ? "Close"
                    : "Add a Comment (You must be logged in!)"}
            </button>
            {writingComment ? (
                <form
                    action={`${apiUrl}/post/${postId}/comment`}
                    method="POST"
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
                        required
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        className="self-start bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
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
