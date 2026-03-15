<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
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

        // Sample books
        $books = [
            [
                'title'       => 'Laskar Pelangi',
                'description' => 'Novel karya Andrea Hirata yang mengisahkan perjuangan anak-anak Belitung dalam menggapai mimpi mereka di tengah keterbatasan.',
                'image_path'  => null,
            ],
            [
                'title'       => 'Bumi Manusia',
                'description' => 'Karya monumental Pramoedya Ananta Toer yang menggambarkan pergolakan sosial di era kolonial Belanda melalui kisah Minke.',
                'image_path'  => null,
            ],
            [
                'title'       => 'Atomic Habits',
                'description' => 'Buku karya James Clear yang membahas cara membangun kebiasaan kecil yang memberikan perubahan luar biasa dalam hidup.',
                'image_path'  => null,
            ],
            [
                'title'       => 'Clean Code',
                'description' => 'Panduan dari Robert C. Martin tentang cara menulis kode yang bersih, mudah dibaca, dan mudah dipelihara.',
                'image_path'  => null,
            ],
            [
                'title'       => 'The Pragmatic Programmer',
                'description' => 'Buku klasik oleh Andrew Hunt dan David Thomas berisi tips pragmatis untuk menjadi programmer yang lebih baik.',
                'image_path'  => null,
            ],
        ];

        foreach ($books as $book) {
            Book::create(array_merge($book, ['user_id' => $admin->id]));
        }
    }
}