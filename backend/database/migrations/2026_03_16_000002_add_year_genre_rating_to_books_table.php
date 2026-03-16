<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->foreignId('genre_id')->nullable()->constrained()->nullOnDelete()->after('image_path');
            $table->unsignedSmallInteger('year')->nullable()->after('genre_id');
            $table->decimal('rating', 3, 1)->nullable()->after('year');
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropConstrainedForeignId('genre_id');
            $table->dropColumn(['year', 'rating']);
        });
    }
};
