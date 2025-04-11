const postPost = async (req, res) => {
    const { id, author } = req.user;

    if (!author) {
        return res.status(403).json({
            message:
                "You are not authorized to create posts. Contact the blog administrator to be made an author.",
        });
    }

    return res.json({
        message: "You accessed the secret route!",
        user: req.user,
    });
};

module.exports = { postPost };
