<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $query = clone $request->user()->favorites()->with('book');

        // Apply filters through relationship
        if ($request->filled('search') || $request->filled('genre') || $request->filled('year_min') || $request->filled('year_max') || $request->filled('rating_min')) {
            $query->whereHas('book', function ($q) use ($request) {
                if ($request->filled('search')) {
                    $q->where('title', 'ilike', '%' . $request->search . '%');
                }
                if ($request->filled('genre')) {
                    $q->where('genre_id', $request->genre);
                }
                if ($request->filled('year_min')) {
                    $q->where('year', '>=', $request->year_min);
                }
                if ($request->filled('year_max')) {
                    $q->where('year', '<=', $request->year_max);
                }
                if ($request->filled('rating_min')) {
                    $q->where('rating', '>=', $request->rating_min);
                }
            });
        }

        $sort = $request->sort ?? 'newest';

        if ($sort !== 'newest') {
            $favorites = $query->get()->map(function ($fav) {
                $book = clone $fav->book;
                $book->is_favorited = true;
                return $book;
            });

            if ($sort === 'title_asc') {
                $favorites = $favorites->sortBy('title', SORT_NATURAL | SORT_FLAG_CASE)->values();
            } elseif ($sort === 'title_desc') {
                $favorites = $favorites->sortByDesc('title', SORT_NATURAL | SORT_FLAG_CASE)->values();
            } elseif ($sort === 'year_asc') {
                $favorites = $favorites->sortBy('year')->values();
            } elseif ($sort === 'year_desc') {
                $favorites = $favorites->sortByDesc('year')->values();
            } elseif ($sort === 'rating_asc') {
                $favorites = $favorites->sortBy('rating')->values();
            } elseif ($sort === 'rating_desc') {
                $favorites = $favorites->sortByDesc('rating')->values();
            }
        } else {
            $favorites = $query->latest()->get()->map(function ($fav) {
                $book = clone $fav->book;
                $book->is_favorited = true;
                return $book;
            });
        }

        return response()->json($favorites);
    }

    public function toggle(Request $request, Book $book)
    {
        $existing = Favorite::where('user_id', $request->user()->id)
            ->where('book_id', $book->id)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['is_favorited' => false]);
        }

        Favorite::create([
            'user_id' => $request->user()->id,
            'book_id' => $book->id,
        ]);

        return response()->json(['is_favorited' => true]);
    }
}