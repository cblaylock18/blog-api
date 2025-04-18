import { useState } from "react";

export default function CommentItem({ comment, userId, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedBody, setEditedBody] = useState(comment.content);

    const toggleEdit = () => {
        setIsEditing((f) => !f);
        setEditedBody(comment.content);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onUpdate(comment.id, editedBody)(e);
        setIsEditing(false);
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        await onDelete(comment.id)(e);
    };

    return (
        <div className="rounded-3xl border p-6 mb-6 dark:border-gray-700">
            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-2">
                    <textarea
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                        className="w-full border rounded p-2"
                        rows={3}
                    />
                    <div className="flex gap-2">
                        <button type="submit" className="btn">
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={toggleEdit}
                            className="btn"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <p className="prose text-xl pb-4">{comment.content}</p>
                    <p className="pb-2 text-sm text-gray-500">
                        {comment.user.firstName} {comment.user.lastName}
                    </p>
                    <p className="pb-2 text-sm text-gray-500">
                        {Date(comment.updatedAt)}
                    </p>
                    {comment.user.id === userId && (
                        <div className="flex gap-2">
                            <button
                                onClick={toggleEdit}
                                className="rounded-3xl border border-gray-200 p-4 mb-2 text-l font-bold cursor-pointer dark:border-gray-700"
                            >
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded-3xl border border-gray-200 p-4 mb-2 text-l font-bold cursor-pointer dark:border-gray-700 text-red-500  cursor:pointer"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
