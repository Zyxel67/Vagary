import ProductForm from '@/components/admin/product-form';
import AppLayout from '@/layouts/app-layout';
import { formatPrice, type Product } from '@/lib/products';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

export default function EditProduct({ product }: { product: Product }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Products',
            href: '/admin/products',
        },
        {
            title: product.name,
            href: `/admin/products/${product.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${product.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 ${product.color}`}>
                        <img src={product.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-400">Admin</p>
                        <h1 className="mt-1 text-3xl font-black tracking-[-0.05em]">{product.name}</h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Listed at {formatPrice(product.price)} · {product.tag} · {product.category}
                        </p>
                    </div>
                </div>

                <ProductForm product={product} />
            </div>
        </AppLayout>
    );
}
