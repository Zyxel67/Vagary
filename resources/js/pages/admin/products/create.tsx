import ProductForm from '@/components/admin/product-form';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/admin/products',
    },
    {
        title: 'New product',
        href: '/admin/products/create',
    },
];

export default function CreateProduct() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New product" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-400">Admin</p>
                    <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">Add a product</h1>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Publish a new leather case to the storefront catalogue.</p>
                </div>

                <ProductForm />
            </div>
        </AppLayout>
    );
}
