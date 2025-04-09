const prisma = require("./prisma/models/models");
const express = require("express");

const app = express();

const main = async function (email, password, firstName, lastName) {
    await prisma.user.create({
        data: {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
        },
    });
};

app.post("/create-user", (req, res) => {
    console.log(
        req.query.email,
        req.query.password,
        req.query.firstName,
        req.query.lastName
    );
    main(
        req.query.email,
        req.query.password,
        req.query.firstName,
        req.query.lastName
    );
    res.send({ message: "user was created!" });
});

const viewUsers = async function () {
    const users = await prisma.user.findMany();
    console.log(users);
};

viewUsers();

app.listen(3000, () => console.log("listening on port 3000"));
