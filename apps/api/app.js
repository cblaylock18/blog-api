const express = require("express");
require("dotenv").config();
const routes = require("./routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", routes.user);

app.use((err, req, res, next) => {
    console.error(err);

    const status = err.status || 500;
    const message =
        process.env.NODE_ENV === "development"
            ? err.message
            : "Internal Server Error";

    res.status(status).json({ error: message });
});

app.listen(process.env.PORT, () =>
    console.log(`Listening on PORT: ${process.env.PORT}`)
);
