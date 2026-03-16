# GoArchive: Digital Library

GoArchive is a modern, responsive full-stack e-library application. It allows users to browse a catalog of books, filter by genre, year, and rating, and seamlessly save their favorites.

## ✨ Features
- **Authentication**: JWT-based authentication using Laravel Sanctum.
- **User Roles**: Distinct permissions for regular users and administrators.
- **Catalog Browsing**: Intelligent search, filtering, and sorting of books.
- **Favorites System**: Users can save, manage, and view their favorite books.
- **Admin Management**: Admins can securely add, edit, and delete books via an intuitive modal UI.
- **Responsive UI**: Carefully crafted and responsive frontend built with Tailwind CSS.

## 🛠 Tech Stack
- **Frontend**: Next.js 15, React, Tailwind CSS, TypeScript
- **Backend**: Laravel 11, PHP 8.2+
- **Database**: PostgreSQL

## 📋 Prerequisites
Ensure you have the following installed if running manually (Option B):
-  **PHP 8.2+** & **Composer**
-  **Node.js 18+** & **npm**
-  **PostgreSQL**

---

**Test accounts:**

- User: user@goarchive.com / User1234
- Admin: admin@goarchive.com / Admin123

### Option A: Docker

Copy `.env.example` to `.env`
docker compose up --build

### Option B: Manual

**BACKEND**
cd backend
Copy `.env.example` to `.env` - change: DB_HOST=127.0.0.1 and fill DB credentials
composer install
php artisan key:generate
php artisan storage:link
php artisan migrate --seed
php artisan serve

**FRONTEND**
cd frontend
Copy `.env.local.example` to `.env.local`
npm install
npm run dev

Access the app at http://localhost:3000

---

### Troubleshooting

**Images not loading after switching from Docker to manual setup (Windows)**

Docker creates a Linux-style symlink for `public/storage` that Windows can't read. Fix it by deleting `backend/public/storage` and running `php artisan storage:link` again.

---

## API Documentation

**Base URL**: `http://localhost:8000/api`

### Authentication
- `POST /auth/register` - Register a new user (`name`, `email`, `password`, `password_confirmation`)
- `POST /auth/login` - Authenticate and receive Sanctum API token (`email`, `password`)
- `POST /auth/logout` - Invalidate current session/token *(Requires Auth)*
- `GET /auth/me` - Get current authenticated user details *(Requires Auth)*

### Books
- `GET /books` - List the catalog and get a paginated list of books. 
  - **Query Params:** `search`, `genre`, `year_min`, `year_max`, `rating_min`, `sort` (`title_asc`, `title_desc`, `year_asc`, `year_desc`, `rating_asc`, `rating_desc`, `newest`)
  - *Optional Auth*: If a valid token is provided, includes an `is_favorited` flag.
- `GET /books/{id}` - Get specific book details. *(Requires Auth)*
- `POST /books` - Create a new book. Fields: `title`, `description`, `image`, `genre_id`, `year`, `rating` *(Requires Admin Auth)*
- `POST /books/{id}` (also `PUT`) - Update an existing book with form-data *(Requires Admin Auth)*
- `DELETE /books/{id}` - Delete a book *(Requires Admin Auth)*

### Favorites
- `GET /favorites` - Get the authenticated user's favorited books. Accepts same query params as `/books`. *(Requires Auth)*
- `POST /favorites/{id}` - Toggle a book's favorite status. Returns `is_favorited` boolean status. *(Requires Auth)*

### Genres
- `GET /genres` - List all available book genres.