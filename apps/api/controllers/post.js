const prisma = require("../models");

const postAllGet = async (req, res, next) => {
    const offset = parseInt(req.query.offset) || 0; // default starting at 0

    try {
        const allPosts = await prisma.$queryRaw`
          SELECT "Post".id, 
                 "Post".title, 
                 SUBSTRING("Post".content FROM 1 FOR 200) AS "contentPreview", 
                 CONCAT("User"."firstName", ' ', "User"."lastName") AS author, 
                 "Post"."updatedAt"
          FROM "Post"
          LEFT JOIN "User" ON "User".id = "Post"."authorId"
          WHERE "Post".published = true
          ORDER BY "Post"."updatedAt" DESC
          LIMIT 10 OFFSET ${offset};
        `;

        return res.status(200).json({ allPosts });
    } catch (error) {
        console.error("Error retrieving posts:", error);
        next(error);
    }
};

const postSingleGet = async (req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
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

        return res.status(200).json({ post });
    } catch (error) {
        console.error("Error retrieving post:", error);
        next(error);
    }
};

module.exports = {
    postAllGet,
    postSingleGet,
};
