const prisma = require("../models");
const { body, validationResult } = require("express-validator");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);
const sanitizeRichText = (value) => {
    return DOMPurify.sanitize(value);
};

const postValidator = [
    body("title")
        .trim()
        .optional()
        .isLength({ max: 255 })
        .withMessage("Max title length is 255 characters.")
        .customSanitizer(sanitizeRichText),
    body("content")
        .trim()
        .optional()
        .isLength({ max: 65535 })
        .withMessage("Maximum article length is 65535 characters.")
        .customSanitizer(sanitizeRichText),
    body("published")
        .trim()
        .optional()
        .isBoolean()
        .withMessage("Published selection must be 'true' or 'false'."),
];

const postPost = [
    ...postValidator,
    async (req, res) => {
        const { id, author } = req.user;

        if (!author) {
            return res.status(403).json({
                message:
                    "You are not authorized to create posts. Contact the blog administrator to be made an author.",
            });
        }

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Failed to create post due to validation error.",
                errors: errors.array(),
                body: req.body,
            });
        }

        const { title, content, published } = req.body;

        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                published: Boolean(published),
                author: {
                    connect: {
                        id,
                    },
                },
            },
        });

        if (!newPost) {
            throw new Error("Failed to create post. Database error.");
        }

        return res.status(200).json({
            message: "New post created.",
            post: newPost,
        });
    },
];

const postPut = [
    ...postValidator,
    async (req, res, next) => {
        const { id, author } = req.user;
        const postId = req.params.postId;

        if (!author) {
            return res.status(403).json({
                message:
                    "You are not authorized to edit posts. Contact the blog administrator to be made an author.",
            });
        }

        if (!postId) {
            return res.status(404).json({
                message: "This post doesn't exist.",
            });
        }

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Failed to update post due to validation error.",
                errors: errors.array(),
                body: req.body,
            });
        }

        try {
            const authorOfPost = await prisma.post.findUnique({
                where: {
                    id: postId,
                },
                select: {
                    authorId: true,
                },
            });

            if (!authorOfPost) {
                return res.status(404).json({
                    message: "Post not found.",
                });
            }

            if (authorOfPost.authorId !== id) {
                return res.status(403).json({
                    message: "This post doesn't belong to you.",
                });
            }

            const { title, content, published } = req.body;

            const updatedPost = await prisma.post.update({
                where: {
                    id: postId,
                },
                data: {
                    title,
                    content,
                    published: Boolean(published),
                },
            });

            if (!updatedPost) {
                throw new Error("Failed to update post. Database error.");
            }

            return res.status(200).json({
                message: "Post updated.",
                post: updatedPost,
            });
        } catch (error) {
            console.error("Error updated post: ", error);
            next(error);
        }
    },
];

const postDelete = async (req, res, next) => {
    const { id, author } = req.user;
    const postId = req.params.postId;

    if (!author) {
        return res.status(403).json({
            message:
                "You are not authorized to delete posts. Contact the blog administrator to be made an author.",
        });
    }

    if (!postId) {
        return res.status(404).json({
            message: "This post doesn't exist.",
        });
    }

    try {
        const authorOfPost = await prisma.post.findUnique({
            where: {
                id: postId,
            },
            select: {
                authorId: true,
            },
        });

        if (!authorOfPost) {
            return res.status(404).json({
                message: "Post not found.",
            });
        }

        if (authorOfPost.authorId !== id) {
            return res.status(403).json({
                message: "This post doesn't belong to you.",
            });
        }

        const deletedPost = await prisma.post.delete({
            where: {
                id: postId,
            },
        });

        if (!deletedPost) {
            throw new Error("Failed to delete post. Database error.");
        }

        return res.status(200).json({
            message: "Post deleted.",
            post: deletedPost,
        });
    } catch (error) {
        console.error("Error deleting post: ", error);
        next(error);
    }
};

module.exports = { postPost, postPut, postDelete };
