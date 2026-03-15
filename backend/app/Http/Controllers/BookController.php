<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::query()->with('user:id,name');

        if ($request->filled('search')) {
            $query->where('title', 'ilike', '%' . $request->search . '%');
        }

        $books = $query->latest()->paginate(12);

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
        $book->load('user:id,name');

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
        ]);

        return response()->json($book, 201);
    }

    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
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