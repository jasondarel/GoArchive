<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::query()->with(['user:id,name', 'genre:id,name']);

        if ($request->filled('search')) {
            $query->where('title', 'ilike', '%' . $request->search . '%');
        }

        if ($request->filled('genre')) {
            $query->where('genre_id', $request->genre);
        }

        if ($request->filled('year_min')) {
            $query->where('year', '>=', $request->year_min);
        }

        if ($request->filled('year_max')) {
            $query->where('year', '<=', $request->year_max);
        }

        if ($request->filled('rating_min')) {
            $query->where('rating', '>=', $request->rating_min);
        }

        $sort = $request->sort ?? 'newest';
        if ($sort === 'title_asc') {
            $query->orderBy('title', 'asc');
        } elseif ($sort === 'title_desc') {
            $query->orderBy('title', 'desc');
        } elseif ($sort === 'year_asc') {
            $query->orderBy('year', 'asc');
        } elseif ($sort === 'year_desc') {
            $query->orderBy('year', 'desc');
        } elseif ($sort === 'rating_desc') {
            $query->orderBy('rating', 'desc');
        } elseif ($sort === 'rating_asc') {
            $query->orderBy('rating', 'asc');
        } else {
            $query->latest();
        }

        $books = $query->paginate(12);

        // Append is_favorited flag for authenticated users
        if ($request->user()) {
            $favoritedIds = $request->user()
                ->favorites()
                ->pluck('book_id')
                ->toArray();

            $books->getCollection()->transform(function ($book) use ($favoritedIds) {
                $book->is_favorited = in_array($book->id, $favoritedIds);
                return $book;
            });
        }

        return response()->json($books);
    }

    public function show(Request $request, Book $book)
    {
        $book->load(['user:id,name', 'genre:id,name']);

        if ($request->user()) {
            $book->is_favorited = $request->user()
                ->favorites()
                ->where('book_id', $book->id)
                ->exists();
        }

        return response()->json($book);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'genre_id'    => 'nullable|exists:genres,id',
            'year'        => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
            'rating'      => 'nullable|numeric|min:0|max:5',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('books', 'public');
        }

        $book = Book::create([
            'user_id'     => $request->user()->id,
            'title'       => $validated['title'],
            'description' => $validated['description'],
            'image_path'  => $imagePath,
            'genre_id'    => $validated['genre_id'] ?? null,
            'year'        => $validated['year'] ?? null,
            'rating'      => $validated['rating'] ?? null,
        ]);

        $book->load('genre:id,name');

        return response()->json($book, 201);
    }

    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'genre_id'    => 'nullable|exists:genres,id',
            'year'        => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
            'rating'      => 'nullable|numeric|min:0|max:5',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($book->image_path) {
                \Storage::disk('public')->delete($book->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('books', 'public');
        }

        unset($validated['image']);
        $book->update($validated);

        $book->load('genre:id,name');

        return response()->json($book);
    }

    public function destroy(Book $book)
    {
        if ($book->image_path) {
            \Storage::disk('public')->delete($book->image_path);
        }

        $book->delete();

        return response()->json(['message' => 'Book deleted successfully.']);
    }
}