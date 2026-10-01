<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            // Whole US dollars so the storefront can format and sort reliably.
            $table->unsignedInteger('price');
            $table->string('tag');
            $table->string('category')->default('Case');
            // Tailwind background class used behind the product photo.
            $table->string('color')->default('bg-stone-200');
            $table->string('image');
            $table->json('gallery');
            $table->json('specs');
            $table->string('marketplace_url', 2048)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
