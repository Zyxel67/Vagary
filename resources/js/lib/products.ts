export type ProductSpec = {
    label: string;
    value: string;
};

export type Product = {
    id: number;
    name: string;
    /** Whole rupiah amounts. Use `formatPrice` for display. */
    price: number;
    tag: string;
    category: string;
    /** Tailwind background class used behind the product photo. */
    color: string;
    image: string;
    gallery: string[];
    specs: ProductSpec[];
    marketplace_url: string | null;
    is_featured: boolean;
    /** Whether it can be bought right now. Flipping this back to true sends restock emails. */
    in_stock: boolean;
    /** Discounted whole-rupiah price, or null when the product is not on sale. */
    sale_price: number | null;
};

/**
 * Suggestion lists for the admin product form. They feed datalist hints, so a
 * brand new tag, category or backdrop colour can still be typed freely.
 */
export const tagOptions = ['New arrival', 'Featured', 'Popular', 'Top rated'];
export const categoryOptions = ['Case'];
export const colorOptions = ['bg-stone-200', 'bg-orange-100', 'bg-slate-200', 'bg-neutral-200', 'bg-amber-100', 'bg-rose-100'];

/** Format a whole-rupiah price for display, e.g. 109000 -> "Rp 109.000". */
export const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(price);

/** The price a buyer actually pays: the sale price when one is set. */
export const effectivePrice = (product: Pick<Product, 'price' | 'sale_price'>) => product.sale_price ?? product.price;

/** Whether a product is genuinely discounted below its list price. */
export const isDiscounted = (product: Pick<Product, 'price' | 'sale_price'>) => product.sale_price !== null && product.sale_price < product.price;
