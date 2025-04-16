// express & env setup
const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cors setup
const cors = require("cors");
const corsOptions = {
    origin: [process.env.FRONTEND_ORIGIN_1, process.env.FRONTEND_ORIGIN_2],
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// jwt and passport setup
const passport = require("passport");
const JwtStrategy = require("./passport/jwt");
passport.use(JwtStrategy);

// routes
const publicRoutes = require("./routes/publicRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

app.use("/", publicRoutes);
app.use("/", passport.authenticate("jwt", { session: false }), protectedRoutes);

// global error handling
// global error handling
app.use((err, req, res, next) => {
    console.error(err);

    const status = err.status || 500;
    const errors =
        err.errors && Array.isArray(err.errors)
            ? err.errors
            : [
                  {
                      msg:
                          process.env.NODE_ENV === "development"
                              ? err.message
                              : "Internal Server Error",
                  },
              ];

    res.status(status).json({ errors });
});

app.use((req, res) => {
    return res.status(404).json({ message: "This route does not exist." });
});

app.listen(process.env.PORT, () =>
    console.log(`Listening on PORT: ${process.env.PORT}`)
);
