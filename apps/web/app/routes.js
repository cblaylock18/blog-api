import { index, route } from "@react-router/dev/routes";

export default [
    index("./routes/Home.jsx"),
    route("/post/:postId", "./routes/Post.jsx"),
    route("/login", "./routes/Login.jsx"),
];
