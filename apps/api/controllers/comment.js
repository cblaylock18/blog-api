const prisma = require("../models");
const { body, validationResult } = require("express-validator");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);
const sanitizeRichText = (value) => {
    return DOMPurify.sanitize(value);
};

const commentValidator = [
    body("content")
        .trim()
        .notEmpty()
        .withMessage("Your comment must not be empty.")
        .isLength({ max: 1000 })
        .withMessage("Maximum comment length is 1000 characters.")
        .customSanitizer(sanitizeRichText),
];

const commentPost = [
    ...commentValidator,
    async (req, res, next) => {
        const { id } = req.user;
        const postId = req.params.postId;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Failed to create comment due to validation error.",
                errors: errors.array(),
                body: req.body,
            });
        }

        const { content } = req.body;

        try {
            const post = await prisma.post.findUnique({
                where: {
                    id: postId,
                    published: true,
                },
            });

            if (!post) {
                return res.status(404).json({
                    message: "Post not found.",
                });
            }

            const newComment = await prisma.comment.create({
                data: {
                    content,
                    user: {
                        connect: {
                            id,
                        },
                    },
                    post: {
                        connect: {
                            id: postId,
                        },
                    },
                },
            });

            if (!newComment) {
                throw new Error("Failed to create comment. Database error.");
            }

            return res.status(200).json({
                message: "New comment created.",
                comment: newComment,
            });
        } catch (error) {
            console.error("Failed to created comment: ", error);
            next(error);
        }
    },
];

const commentPut = [
    ...commentValidator,
    async (req, res, next) => {
        const { id } = req.user;
        const { postId, commentId } = req.params;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Failed to update comment due to validation error.",
                errors: errors.array(),
                body: req.body,
            });
        }

        const { content } = req.body;

        try {
            const post = await prisma.post.findUnique({
                where: {
                    id: postId,
                    published: true,
                },
            });

            if (!post) {
                return res.status(404).json({
                    message: "Post not found.",
                });
            }

            const comment = await prisma.comment.findUnique({
                where: {
                    id: commentId,
                },
                select: {
                    userId: true,
                },
            });

            if (!comment) {
                return res.status(404).json({
                    message: "Comment not found.",
                });
            }

            if (comment.userId !== id) {
                return res.status(403).json({
                    message: "This comment doesn't belong to you.",
                });
            }

            const updatedComment = await prisma.comment.update({
                where: {
                    id: commentId,
                },
                data: {
                    content,
                },
            });

            if (!updatedComment) {
                throw new Error("Failed to update comment. Database error.");
            }

            return res.status(200).json({
                message: "Comment updated.",
                comment: updatedComment,
            });
        } catch (error) {
            console.error("Failed to update comment: ", error);
            next(error);
        }
    },
];

const commentDelete = async (req, res, next) => {
    const { id } = req.user;
    const { postId, commentId } = req.params;

    try {
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
                published: true,
            },
        });

        if (!post) {
            return res.status(404).json({
                message: "Post not found.",
            });
        }

        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId,
            },
            select: {
                userId: true,
                post: {
                    select: {
                        authorId: true,
                    },
                },
            },
        });

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found.",
            });
        }

        if (comment.userId !== id && comment.post.authorId !== id) {
            return res.status(403).json({
                message:
                    "You're not authorized to delete this comment because you didn't create it and you don't own the post.",
            });
        }

        const deletedComment = await prisma.comment.delete({
            where: {
                id: commentId,
            },
        });

        if (!deletedComment) {
            throw new Error("Failed to delete comment. Database error.");
        }

        return res.status(200).json({
            message: "Comment deleted.",
            comment: deletedComment,
        });
    } catch (error) {
        console.error("Failed to delete comment: ", error);
        next(error);
    }
};

const commentGet = async (req, res, next) => {
    const postId = req.params.postId;
    const totalCommentsToLoad = parseInt(req.query.offset) || 50; // default starting at 50

    try {
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
            },
            select: {
                id: true,
                comments: {
                    orderBy: {
                        updatedAt: "desc",
                    },
                    take: totalCommentsToLoad,
                    select: {
                        id: true,
                        content: true,
                        updatedAt: true,
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });

        if (!post) {
            return res.status(404).json({
                message: "No post found that matches. Please try again.",
            });
        }

        return res.status(200).json({ post });
    } catch (error) {
        console.error("Error retrieving post:", error);
        next(error);
    }
};

module.exports = {
    commentPost,
    commentPut,
    commentDelete,
    commentGet,
};
