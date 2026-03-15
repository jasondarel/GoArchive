<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\FavoriteController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Catalog - public but with optional auth context (for is_favorited)
Route::middleware('auth:sanctum')->get('/books/{book}', [BookController::class, 'show']);
Route::get('/books', [BookController::class, 'index'])->middleware('optional.auth');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{book}', [FavoriteController::class, 'toggle']);

    // Books CRUD - admin only
    Route::middleware('admin')->group(function () {
        Route::post('/books', [BookController::class, 'store']);
        Route::post('/books/{book}', [BookController::class, 'update']); // POST with _method=PUT for FormData
        Route::delete('/books/{book}', [BookController::class, 'destroy']);
    });
});