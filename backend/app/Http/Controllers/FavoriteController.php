<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = $request->user()
            ->favorites()
            ->with('book')
            ->latest()
            ->get()
            ->map(function ($fav) {
                $book = $fav->book;
                $book->is_favorited = true;
                return $book;
            });

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