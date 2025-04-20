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
        .isLength({ max: 255 })
        .withMessage("Max title length is 255 characters.")
        .customSanitizer(sanitizeRichText),
    body("content")
        .optional()
        .trim()
        .isLength({ max: 65535 })
        .withMessage("Maximum article length is 65535 characters.")
        .customSanitizer(sanitizeRichText),
    body("published")
        .optional()
        .trim()
        .isBoolean()
        .withMessage("Published selection must be 'true' or 'false'.")
        .toBoolean(),
];

const postAllGet = async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;

    try {
        const allPosts = await prisma.$queryRaw`
        SELECT 
          "Post".id,
          "Post".title,
          regexp_replace(
            SUBSTRING("Post".content FROM 1 FOR 200),
            '<[^>]+>',
            '',
            'g'
          ) AS "contentPreview",
          CONCAT("User"."firstName", ' ', "User"."lastName") AS author,
          "Post"."updatedAt",
          "Post".published
        FROM "Post"
        LEFT JOIN "User" ON "User".id = "Post"."authorId"
        WHERE "Post"."authorId" = ${req.user.id}
        ORDER BY "Post"."updatedAt" DESC
        LIMIT ${limit} OFFSET ${offset};
      `;

        return res
            .status(200)
            .json({ message: "All posts retrieved.", allPosts });
    } catch (error) {
        console.error("Error retrieving posts:", error);
        next({
            status: 400,
            errors: [{ msg: error.message }],
        });
    }
};

const postSingleGet = async (req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await prisma.post.findFirst({
            where: {
                id: postId,
                authorId: req.user.id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!post) {
            return res.status(404).json({
                message: "No post found that matches. Please try again.",
            });
        }

        return res.status(200).json({ message: "Post retrieved.", post });
    } catch (error) {
        console.error("Error retrieving post:", error);
        next({
            status: 400,
            errors: [{ msg: error.message }],
        });
    }
};

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
            const post = await prisma.post.findUnique({
                where: {
                    id: postId,
                },
                select: {
                    authorId: true,
                },
            });

            if (!post) {
                return res.status(404).json({
                    message: "Post not found.",
                });
            }

            if (post.authorId !== id) {
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
            console.error("Error updating post: ", error);
            next({
                status: 400,
                errors: [{ msg: error.message }],
            });
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
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
            },
            select: {
                authorId: true,
            },
        });

        if (!post) {
            return res.status(404).json({
                message: "Post not found.",
            });
        }

        if (post.authorId !== id) {
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
        next({
            status: 400,
            errors: [{ msg: error.message }],
        });
    }
};

const postPatch = async (req, res, next) => {
    const { id, author } = req.user;
    const postId = req.params.postId;

    if (!author) {
        return res.status(403).json({
            message:
                "You are not authorized to publish posts. Contact the blog administrator to be made an author.",
        });
    }

    if (!postId) {
        return res.status(404).json({
            message: "This post doesn't exist.",
        });
    }

    try {
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
            },
            select: {
                authorId: true,
                published: true,
            },
        });

        if (!post) {
            return res.status(404).json({
                message: "Post not found.",
            });
        }

        if (post.authorId !== id) {
            return res.status(403).json({
                message: "This post doesn't belong to you.",
            });
        }

        const togglePublishPost = await prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                published: !post.published,
            },
        });

        if (!togglePublishPost) {
            throw new Error("Failed to update post. Database error.");
        }

        return res.status(200).json({
            message: "Post updated.",
            post: togglePublishPost,
        });
    } catch (error) {
        console.error("Error updating post: ", error);
        next({
            status: 400,
            errors: [{ msg: error.message }],
        });
    }
};

module.exports = {
    postAllGet,
    postSingleGet,
    postPost,
    postPut,
    postDelete,
    postPatch,
};
