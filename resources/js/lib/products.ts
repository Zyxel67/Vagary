export type ProductSpec = {
    label: string;
    value: string;
};

export type Product = {
    id: number;
    name: string;
    /** Whole US dollars. Use `formatPrice` for display. */
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
};

/**
 * Suggestion lists for the admin product form. They feed datalist hints, so a
 * brand new tag, category or backdrop colour can still be typed freely.
 */
export const tagOptions = ['New arrival', 'Featured', 'Popular', 'Top rated'];
export const categoryOptions = ['Case'];
export const colorOptions = ['bg-stone-200', 'bg-orange-100', 'bg-slate-200', 'bg-neutral-200', 'bg-amber-100', 'bg-rose-100'];

/** Format a whole-dollar price for display, e.g. 109 -> "$109". */
export const formatPrice = (price: number) => `$${Number(price).toLocaleString('en-US')}`;
