const jwt = require("jsonwebtoken");
const prisma = require("../models");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const loginValidator = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Must input a valid email.")
        .isLength({ max: 255 })
        .withMessage("Email must be 255 characters or less."),
    body("password")
        .trim()
        .isLength({ min: 5, max: 64 })
        .withMessage("Password must be 5 to 64 characters long."),
];

const loginPost = [
    ...loginValidator,
    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Failed to create user.",
                errors: errors.array(),
                body: req.body,
            });
        }

        const { email, password } = req.body;

        try {
            const user = await prisma.user.findUnique({
                where: {
                    email: email,
                },
            });

            if (!user) {
                throw new Error("That username does not exist.");
            }

            const passwordsMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (passwordsMatch) {
                const token = jwt.sign({ email }, process.env.JWT_SECRET, {
                    expiresIn: "30d",
                });
                return res.status(200).json({
                    message: "Logged in successfully.",
                    token,
                });
            } else {
                throw new Error(
                    "That username and password combination does not exist."
                );
            }
        } catch (err) {
            err.status = 401;
            next(err);
        }
    },
];

module.exports = { loginPost };
