# Blog Platform (API + Public Reader + Author Admin)

A full‑stack blog project with a dedicated backend API, a public reader site, and an author/admin site.

## Table of Contents

1. [Features](#features)
2. [Live Demo](#live-demo)
3. [Technologies Used](#technologies-used)
4. [Future Improvements](#future-improvements)
5. [Contributing](#contributing)
6. [License](#license)

---

## Features

### Backend (apps/api)

-   **RESTful CRUD** for posts & comments
-   **JWT Authentication** (Passport.js & jsonwebtoken)
-   **Express Validation** & centralized error handling
-   **Prisma ORM** with PostgreSQL & migrations
-   **CORS** configured for both frontends

### Public Reader (apps/web)

-   Browse **published posts**
-   Read full post with comments
-   **User login** via JWT (stored in localStorage)
-   Leave, edit & delete **own comments**
-   Data loading with **React Router Framework v7** loaders & actions

### Author Admin (apps/admin)

-   List **all posts** (draft & published)
-   Create & edit posts with **TinyMCE** rich‑text editor
-   **Publish/unpublish** via PATCH endpoint
-   **Moderate comments** (delete any)
-   Client‑side data fetching with React hooks & React Router

---

## Live Demo

-   **Public Reader:** https://blog-api-five-olive.vercel.app/
-   **Author Admin:** https://blog-api-14ej.vercel.app/
-   **API (On Railway)**

![Public Reader Screenshot](./apps/web/public/web-view-screenshot.png)  
![Author Admin Screenshot](./apps/admin/public/admin-screenshot.png)

---

## Technologies Used

### Back End (apps/api)

-   Node.js & Express.js
-   PostgreSQL & Prisma ORM
-   Passport.js & jsonwebtoken (JWT)
-   express-validator
-   CORS

### Public Frontend (apps/web)

-   Vite & React
-   React Router Framework v7
-   Tailwind CSS
-   React hooks

### Admin Frontend (apps/admin)

-   Vite & React
-   React Router Framework v7
-   TinyMCE rich‑text editor
-   Tailwind CSS

### Deployment & Dev Tools

-   Railway (API hosting)
-   Vercel (frontends)
-   dotenv for env‑vars
-   Git & GitHub

---

## Future Improvements

-   **Search & Filtering** on reader side
-   **Markdown Support** option
-   **Granular Roles** (admin, moderator, reader)
-   **Email Notifications** on new comments

---

## Contributing

Contributions are welcome!

1. Fork the repository.
2. Create your feature branch: git checkout -b feature/your-feature
3. Commit your changes: git commit -m 'Add a cool feature'
4. Push to the branch: git push origin feature/your-feature
5. Open a Pull Request.

## License

This project is licensed under the [MIT License](/LICENSE).
