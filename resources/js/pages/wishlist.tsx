import { Price } from '@/components/price';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type Product } from '@/lib/products';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpRight, Heart, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Wishlist',
        href: '/wishlist',
    },
];

export default function Wishlist({ products }: { products: Product[] }) {
    const remove = (product: Product) => {
        router.delete(route('wishlist.destroy', product.id), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wishlist" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-400">Your selection</p>
                    <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">Wishlist</h1>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        {products.length === 0
                            ? 'Save products while you browse the marketplace.'
                            : `${products.length} product${products.length === 1 ? '' : 's'} saved to your account.`}
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="rounded-2xl border border-black/10 bg-white/85 p-14 text-center shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80">
                        <Heart className="mx-auto h-8 w-8 text-neutral-400" />
                        <p className="mt-4 text-base font-semibold">Nothing saved yet</p>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Tap the heart on any product to keep it here.</p>
                        <Button asChild className="mt-6">
                            <Link href={route('marketplace')} prefetch>
                                Browse the marketplace
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {products.map((product) => (
                            <article
                                key={product.id}
                                className="overflow-hidden rounded-2xl border border-black/10 bg-white/85 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80"
                            >
                                <div className={`relative h-40 w-full overflow-hidden ${product.color}`}>
                                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] text-neutral-800 uppercase">
                                        {product.tag}
                                    </span>
                                </div>

                                <div className="space-y-4 p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="truncate text-lg font-semibold">{product.name}</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{product.category}</p>
                                        </div>
                                        <Price product={product} className="text-lg font-bold" />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button asChild size="sm" className="flex-1">
                                            <Link href={`${route('marketplace')}?product=${encodeURIComponent(product.name)}`} prefetch>
                                                <ArrowUpRight className="h-4 w-4" />
                                                View
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                                            onClick={() => remove(product)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
