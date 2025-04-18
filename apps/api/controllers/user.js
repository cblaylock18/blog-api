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
        .withMessage("Last name must only include letters."),
    body("author")
        .optional()
        .trim()
        .isBoolean()
        .withMessage("Author selection must be 'true' or 'false'."),
];

const updateValidator = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Must input a valid email.")
        .isLength({ max: 255 })
        .withMessage("Email must be 255 characters or less.")
        .custom(async (value, { req }) => {
            const user = await prisma.user.findUnique({
                where: { email: value },
            });
            if (user && user.email !== req.user.email) {
                throw new Error("Email already in use.");
            }
            return true;
        }),
    body("password")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 5, max: 64 })
        .withMessage("Password must be 5 to 64 characters long."),
    body("confirmPassword")
        .trim()
        .custom((value, { req }) => {
            if (req.body.password) {
                const doPasswordsMatch = value === req.body.password;
                if (!doPasswordsMatch) {
                    throw new Error("Passwords must match.");
                }
            } else if (value) {
                throw new Error(
                    "No new password provided, so confirm password should be empty."
                );
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
        .withMessage("Last name must only include letters."),
    body("author")
        .optional()
        .trim()
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

        const { email, firstName, lastName } = req.body;

        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const author = Boolean(req.body.author) || false;

            const newUser = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    author,
                },
            });

            // pass token (aka login the user) on successful sign up
            const token = jwt.sign(
                {
                    email: newUser.email,
                    id: newUser.id,
                    name: newUser.firstName,
                    author: newUser.author,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "30d",
                }
            );

            return res
                .status(200)
                .json({ message: "User was created!", token });
        } catch (error) {
            console.error("Error while creating user: ", error);
            next({
                status: 400,
                errors: [{ msg: error.message }],
            });
        }
    },
];

const userGet = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id,
            },
            omit: {
                password: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error retrieving profile: ", error);
        next({
            status: 400,
            errors: [{ msg: error.message }],
        });
    }
};

const userPut = [
    ...updateValidator,
    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Failed to update user.",
                errors: errors.array(),
                body: req.body,
            });
        }

        const { email, firstName, lastName } = req.body;

        const dataToUpdate = { email, firstName, lastName };

        if (req.body.author !== undefined) {
            dataToUpdate.author = Boolean(req.body.author);
        }

        try {
            if (req.body.password !== undefined) {
                dataToUpdate.password = await bcrypt.hash(
                    req.body.password,
                    10
                );
            }

            if (Object.keys(dataToUpdate).length === 0) {
                return res
                    .status(400)
                    .json({ message: "No fields provided to update." });
            }

            const updatedUser = await prisma.user.update({
                where: { id: req.user.id },
                data: dataToUpdate,
            });

            // pass token (aka login the user) on successful update
            const token = jwt.sign(
                {
                    email: updatedUser.email,
                    id: updatedUser.id,
                    name: updatedUser.firstName,
                    author: updatedUser.author,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "30d",
                }
            );

            return res
                .status(200)
                .json({ message: "User was updated!", token, updatedUser });
        } catch (error) {
            console.error("Error while updating user: ", error);
            next({
                status: 400,
                errors: [{ msg: error.message }],
            });
        }
    },
];

module.exports = {
    userPost,
    userGet,
    userPut,
};
