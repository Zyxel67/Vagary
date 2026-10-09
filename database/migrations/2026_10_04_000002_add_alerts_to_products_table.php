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
        Schema::table('products', function (Blueprint $table) {
            // Drives the restock alert: flipping this back to true emails every
            // opted-in account that saved the product.
            $table->boolean('in_stock')->default(true)->after('is_featured');

            // Nullable, whole dollars like `price`. When present and lower than
            // `price` it is the discounted price shown on the storefront.
            $table->unsignedInteger('sale_price')->nullable()->after('in_stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['in_stock', 'sale_price']);
        });
    }
};