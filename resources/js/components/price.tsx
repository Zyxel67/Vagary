import { formatPrice, isDiscounted, type Product } from '@/lib/products';

/**
 * Renders a product price, showing the sale price with the original struck
 * through when the product is genuinely discounted.
 *
 * Keeping this in one place means the storefront, dashboard and admin all
 * agree on how a markdown is shown.
 */
export function Price({ product, className = '' }: { product: Product; className?: string }) {
    if (!isDiscounted(product)) {
        return <span className={className}>{formatPrice(product.price)}</span>;
    }

    return (
        <span className={`inline-flex flex-wrap items-baseline justify-end gap-x-2 ${className}`}>
            <span className="font-bold text-red-600 dark:text-red-400">{formatPrice(product.sale_price ?? product.price)}</span>
            <s className="text-sm font-normal text-neutral-400">{formatPrice(product.price)}</s>
        </span>
    );
}

/**
 * Small "sold out" chip, or nothing when the product can be bought.
 */
export function StockBadge({ product }: { product: Product }) {
    if (product.in_stock) {
        return null;
    }

    return (
        <span className="inline-flex items-center rounded-full bg-neutral-900 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-white uppercase dark:bg-white dark:text-neutral-900">
            Sold out
        </span>
    );
}
