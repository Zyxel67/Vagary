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
        Schema::create('promos', function (Blueprint $table) {
            $table->id();
            // The admin who pressed send. Kept nullable because an account that
            // is later deleted should not erase the record of what went out.
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('subject', 120);
            $table->text('message');
            $table->string('url', 2048)->nullable();
            $table->string('cta_label', 60)->default('Shop now');
            $table->unsignedInteger('recipients')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promos');
    }
};