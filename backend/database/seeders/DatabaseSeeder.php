<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed genres first
        $this->call(GenreSeeder::class);

        // Admin account
        $admin = User::create([
            'name'     => 'Admin GoArchive',
            'email'    => 'admin@goarchive.com',
            'password' => bcrypt('Admin123'),
            'role'     => 'admin',
        ]);

        // Regular user
        User::create([
            'name'     => 'User',
            'email'    => 'user@goarchive.com',
            'password' => bcrypt('User1234'),
            'role'     => 'user',
        ]);

        // Genre shortcuts
        $fiction    = Genre::where('name', 'Fiction')->first()->id;
        $nonFiction = Genre::where('name', 'Non-Fiction')->first()->id;
        $tech       = Genre::where('name', 'Technology')->first()->id;
        $selfHelp   = Genre::where('name', 'Self-Help')->first()->id;

        // Sample books
        $books = [
            [
                'title'       => 'Laskar Pelangi',
                'description' => 'Novel karya Andrea Hirata yang mengisahkan perjuangan anak-anak Belitung dalam menggapai mimpi mereka di tengah keterbatasan.',
                'image_path'  => null,
                'genre_id'    => $fiction,
                'year'        => 2005,
                'rating'      => 4.8,
            ],
            [
                'title'       => 'Bumi Manusia',
                'description' => 'Karya monumental Pramoedya Ananta Toer yang menggambarkan pergolakan sosial di era kolonial Belanda melalui kisah Minke.',
                'image_path'  => null,
                'genre_id'    => $fiction,
                'year'        => 1980,
                'rating'      => 4.9,
            ],
            [
                'title'       => 'Atomic Habits',
                'description' => 'Buku karya James Clear yang membahas cara membangun kebiasaan kecil yang memberikan perubahan luar biasa dalam hidup.',
                'image_path'  => null,
                'genre_id'    => $selfHelp,
                'year'        => 2018,
                'rating'      => 4.7,
            ],
            [
                'title'       => 'Clean Code',
                'description' => 'Panduan dari Robert C. Martin tentang cara menulis kode yang bersih, mudah dibaca, dan mudah dipelihara.',
                'image_path'  => null,
                'genre_id'    => $tech,
                'year'        => 2008,
                'rating'      => 4.5,
            ],
            [
                'title'       => 'The Pragmatic Programmer',
                'description' => 'Buku klasik oleh Andrew Hunt dan David Thomas berisi tips pragmatis untuk menjadi programmer yang lebih baik.',
                'image_path'  => null,
                'genre_id'    => $tech,
                'year'        => 1999,
                'rating'      => 4.6,
            ],
        ];

        foreach ($books as $book) {
            Book::create(array_merge($book, ['user_id' => $admin->id]));
        }
    }
}