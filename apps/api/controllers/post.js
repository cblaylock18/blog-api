const prisma = require("../models");
// next step would be to create validation for posting a new article

const postPost = async (req, res) => {
    const { id, author } = req.user;

    if (!author) {
        return res.status(403).json({
            message:
                "You are not authorized to create posts. Contact the blog administrator to be made an author.",
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
        throw new Error("Failed to create article.");
    }

    return res.json({
        message: "New post created.",
        post: newPost,
    });
};

module.exports = { postPost };
