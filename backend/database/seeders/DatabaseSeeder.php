<?php

namespace Database\Seeders;

use App\Models\Author;
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

        // Seed Authors
        $authorsData = [
            ['name' => 'Andrea Hirata', 'bio' => 'Indonesian author known for Laskar Pelangi.'],
            ['name' => 'Pramoedya Ananta Toer', 'bio' => 'Indonesian author and activist.'],
            ['name' => 'James Clear', 'bio' => 'Author, entrepreneur, and photographer.'],
            ['name' => 'Robert C. Martin', 'bio' => 'Software engineer and co-author of Agile Manifesto.'],
            ['name' => 'Andrew Hunt and David Thomas', 'bio' => 'Authors of The Pragmatic Programmer.'],
            ['name' => 'Yuval Noah Harari', 'bio' => 'Historian and professor.'],
            ['name' => 'J.K. Rowling', 'bio' => 'British author and philanthropist.'],
            ['name' => 'Daniel Kahneman', 'bio' => 'Psychologist and economist.'],
            ['name' => 'Gang of Four (GoF)', 'bio' => 'Authors of Design Patterns.'],
            ['name' => 'Mark Manson', 'bio' => 'Self-help author and blogger.']
        ];

        $authors = [];
        foreach ($authorsData as $data) {
            $authors[] = Author::create($data);
        }

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
                'author_id'   => $authors[0]->id,
                'year'        => 2005,
                'rating'      => 4.8,
            ],
            [
                'title'       => 'Bumi Manusia',
                'description' => 'Karya monumental Pramoedya Ananta Toer yang menggambarkan pergolakan sosial di era kolonial Belanda melalui kisah Minke.',
                'image_path'  => null,
                'genre_id'    => $fiction,
                'author_id'   => $authors[1]->id,
                'year'        => 1980,
                'rating'      => 4.9,
            ],
            [
                'title'       => 'Atomic Habits',
                'description' => 'Buku karya James Clear yang membahas cara membangun kebiasaan kecil yang memberikan perubahan luar biasa dalam hidup.',
                'image_path'  => null,
                'genre_id'    => $selfHelp,
                'author_id'   => $authors[2]->id,
                'year'        => 2018,
                'rating'      => 4.7,
            ],
            [
                'title'       => 'Clean Code',
                'description' => 'Panduan dari Robert C. Martin tentang cara menulis kode yang bersih, mudah dibaca, dan mudah dipelihara.',
                'image_path'  => null,
                'genre_id'    => $tech,
                'author_id'   => $authors[3]->id,
                'year'        => 2008,
                'rating'      => 4.5,
            ],
            [
                'title'       => 'The Pragmatic Programmer',
                'description' => 'Buku klasik oleh Andrew Hunt dan David Thomas berisi tips pragmatis untuk menjadi programmer yang lebih baik.',
                'image_path'  => null,
                'genre_id'    => $tech,
                'author_id'   => $authors[4]->id,
                'year'        => 1999,
                'rating'      => 4.6,
            ],
            [
                'title'       => 'Sapiens: A Brief History of Humankind',
                'description' => 'Karya Yuval Noah Harari yang mengeksplorasi sejarah umat manusia dari zaman prasejarah hingga era modern.',
                'image_path'  => null,
                'genre_id'    => $nonFiction,
                'author_id'   => $authors[5]->id,
                'year'        => 2011,
                'rating'      => 4.8,
            ],
            [
                'title'       => 'Harry Potter and the Sorcerer\'s Stone',
                'description' => 'Kisah awal perjalanan Harry Potter di dunia sihir Hogwarts karya J.K. Rowling.',
                'image_path'  => null,
                'genre_id'    => $fiction,
                'author_id'   => $authors[6]->id,
                'year'        => 1997,
                'rating'      => 4.9,
            ],
            [
                'title'       => 'Thinking, Fast and Slow',
                'description' => 'Daniel Kahneman mengungkap dua sistem yang membimbing cara kita berpikir, cepat dan intuitif vs lambat dan rasional.',
                'image_path'  => null,
                'genre_id'    => $nonFiction,
                'author_id'   => $authors[7]->id,
                'year'        => 2011,
                'rating'      => 4.7,
            ],
            [
                'title'       => 'Design Patterns: Elements of Reusable Object-Oriented Software',
                'description' => 'Buku legendaris oleh Gang of Four (GoF) tentang pola desain perangkat lunak.',
                'image_path'  => null,
                'genre_id'    => $tech,
                'author_id'   => $authors[8]->id,
                'year'        => 1994,
                'rating'      => 4.5,
            ],
            [
                'title'       => 'The Subtle Art of Not Giving a Fish',
                'description' => 'Pendekatan jujur dari Mark Manson tentang cara mencapai kehidupan yang lebih baik tanpa memedulikan hal-hal yang tidak penting.',
                'image_path'  => null,
                'genre_id'    => $selfHelp,
                'author_id'   => $authors[9]->id,
                'year'        => 2016,
                'rating'      => 4.6,
            ],
        ];

        foreach ($books as $book) {
            Book::create(array_merge($book, ['user_id' => $admin->id]));
        }
    }
}