import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { formatPrice, type Product } from '@/lib/products';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Package, Pencil, Plus, Search, Star, Tags, Trash2, Wallet } from 'lucide-react';
import { useState } from 'react';

type ProductStats = {
    total: number;
    featured: number;
    categories: number;
    averagePrice: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/admin/products',
    },
];

export default function AdminProducts({ products, stats }: { products: Product[]; stats: ProductStats }) {
    const { flash } = usePage<SharedData>().props;
    const [query, setQuery] = useState('');
    const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    const filtered = products.filter((product) =>
        [product.name, product.tag, product.category].some((value) => value.toLowerCase().includes(query.trim().toLowerCase())),
    );

    const confirmDelete = () => {
        if (!pendingDelete) {
            return;
        }

        setDeleting(true);
        router.delete(route('admin.products.destroy', pendingDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setPendingDelete(null);
            },
        });
    };

    const statCards = [
        { label: 'Products', value: String(stats.total), icon: Package },
        { label: 'Featured', value: String(stats.featured), icon: Star },
        { label: 'Categories', value: String(stats.categories), icon: Tags },
        { label: 'Average price', value: formatPrice(stats.averagePrice), icon: Wallet },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-400">Admin</p>
                        <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">Catalogue</h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Add, adjust and remove the products shown across the storefront.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href={route('admin.products.create')} prefetch>
                            <Plus className="h-4 w-4" />
                            New product
                        </Link>
                    </Button>
                </div>

                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
                                    {card.label}
                                </p>
                                <card.icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <p className="mt-3 text-3xl font-black tracking-[-0.05em]">{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="relative w-full max-w-sm">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                        className="pl-9"
                        placeholder="Search by name, collection or category…"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        aria-label="Search products"
                    />
                </div>

                <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/85 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="border-b border-black/10 text-[11px] tracking-[0.16em] text-neutral-500 uppercase dark:border-white/10 dark:text-neutral-400">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-semibold">
                                        Product
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-semibold">
                                        Price
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-semibold">
                                        Collection
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-semibold">
                                        Category
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-semibold">
                                        Dashboard
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-right font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((product) => (
                                    <tr key={product.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-black/10 dark:border-white/10 ${product.color}`}
                                                >
                                                    <img src={product.image} alt="" className="h-full w-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold">{product.name}</p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                        {product.gallery.length} gallery image{product.gallery.length === 1 ? '' : 's'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold">{formatPrice(product.price)}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="secondary">{product.tag}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{product.category}</td>
                                        <td className="px-4 py-3">
                                            {product.is_featured ? (
                                                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">Featured</Badge>
                                            ) : (
                                                <span className="text-neutral-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link href={route('admin.products.edit', product.id)} prefetch>
                                                        <Pencil className="h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                                                    onClick={() => setPendingDelete(product)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-14 text-center">
                                            <p className="text-base font-semibold">
                                                {products.length === 0 ? 'No products yet' : 'No matching products'}
                                            </p>
                                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                                {products.length === 0
                                                    ? 'Add your first leather case to populate the storefront.'
                                                    : 'Try a different search term.'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete product</DialogTitle>
                        <DialogDescription>
                            {pendingDelete ? `Remove "${pendingDelete.name}" from the catalogue? This cannot be undone.` : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button type="button" variant="outline" onClick={() => setPendingDelete(null)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleting}>
                            {deleting ? 'Deleting…' : 'Delete product'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
