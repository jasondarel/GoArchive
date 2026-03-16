# GoArchive

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

### Troubleshooting

**Images not loading after switching from Docker to manual setup (Windows)**

Docker creates a Linux-style symlink for `public/storage` that Windows can't read. Fix it by deleting `backend/public/storage` and running `php artisan storage:link` again.