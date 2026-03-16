<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        $genres = [
            'Biography',
            'Fantasy',
            'Fiction',
            'History',
            'Mystery',
            'Non-Fiction',
            'Romance',
            'Science',
            'Self-Help',
            'Technology',
        ];

        foreach ($genres as $name) {
            Genre::firstOrCreate(['name' => $name]);
        }
    }
}
