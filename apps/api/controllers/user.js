const prisma = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const userValidator = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Must input a valid email.")
        .isLength({ max: 255 })
        .withMessage("Email must be 255 characters or less.")
        .custom(async (value) => {
            const user = await prisma.user.findUnique({
                where: { email: value },
            });
            if (user) {
                throw new Error("Email already in use.");
            }
            return true;
        }),
    body("password")
        .trim()
        .isLength({ min: 5, max: 64 })
        .withMessage("Password must be 5 to 64 characters long."),
    body("confirmPassword")
        .trim()
        .custom((value, { req }) => {
            const doPasswordsMatch = value === req.body.password;
            if (!doPasswordsMatch) {
                throw new Error("Passwords must match.");
            }
            return true;
        }),
    body("firstName")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("You must include your first name.")
        .isLength({ max: 50 })
        .withMessage("First name cannot exceed 50 characters.")
        .isAlpha()
        .withMessage("First name must only include letters."),
    body("lastName")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("You must include your last name.")
        .isLength({ max: 60 })
        .withMessage("Last name cannot exceed 60 characters.")
        .isAlpha()
        .withMessage("First name must only include letters."),
    body("author")
        .trim()
        .optional()
        .isBoolean()
        .withMessage("Author selection must be 'true' or 'false'."),
];

const userPost = [
    ...userValidator,
    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Failed to create user.",
                errors: errors.array(),
                body: req.body,
            });
        }

        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const author = Boolean(req.body.author) || false;

            const newUser = await prisma.user.create({
                data: {
                    email: req.body.email,
                    password: hashedPassword,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    author: author,
                },
            });

            // pass token (aka login the user) on successful sign up
            const token = jwt.sign(
                { email: newUser.email },
                process.env.JWT_SECRET,
                {
                    expiresIn: "30d",
                }
            );

            return res
                .status(200)
                .json({ message: "User was created!", token });
        } catch (err) {
            console.error("Error while creating user: ", err);
            next(err);
        }
    },
];

module.exports = {
    userPost,
};
