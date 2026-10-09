import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categoryOptions, colorOptions, formatPrice, tagOptions, type Product } from '@/lib/products';
import { Link, useForm } from '@inertiajs/react';
import { ImagePlus, Plus, Save, Trash2 } from 'lucide-react';
import { FormEventHandler } from 'react';

/**
 * Shared create/edit form for a catalogue product.
 *
 * Prices are collected as plain numbers and normalised to whole dollars on the
 * server, so the storefront can sort and format them reliably.
 */
type ProductFormProps = {
    product?: Product;
};

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur-xl sm:p-6 dark:border-white/10 dark:bg-neutral-900/80">
            <header className="mb-5">
                <h2 className="text-lg font-bold tracking-[-0.02em]">{title}</h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
            </header>
            <div className="grid gap-5 sm:grid-cols-2">{children}</div>
        </section>
    );
}

export default function ProductForm({ product }: ProductFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: product?.name ?? '',
        price: product ? String(product.price) : '',
        tag: product?.tag ?? tagOptions[0],
        category: product?.category ?? categoryOptions[0],
        color: product?.color ?? colorOptions[0],
        image: product?.image ?? '',
        gallery: product?.gallery ?? [],
        specs: product?.specs ?? [{ label: 'Format', value: 'Protective case' }],
        marketplace_url: product?.marketplace_url ?? '',
        is_featured: product?.is_featured ?? true,
        in_stock: product?.in_stock ?? true,
        sale_price: product?.sale_price != null ? String(product.sale_price) : '',
    });

    const fieldErrors = errors as Record<string, string>;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (product) {
            put(route('admin.products.update', product.id));
            return;
        }

        post(route('admin.products.store'));
    };

    const updateGalleryImage = (index: number, value: string) =>
        setData(
            'gallery',
            data.gallery.map((image, position) => (position === index ? value : image)),
        );

    const removeGalleryImage = (index: number) =>
        setData(
            'gallery',
            data.gallery.filter((_, position) => position !== index),
        );

    const updateSpec = (index: number, key: 'label' | 'value', value: string) =>
        setData(
            'specs',
            data.specs.map((spec, position) =>
                position === index ? { label: key === 'label' ? value : spec.label, value: key === 'value' ? value : spec.value } : spec,
            ),
        );

    const removeSpec = (index: number) =>
        setData(
            'specs',
            data.specs.filter((_, position) => position !== index),
        );

    const pricePreview = Number(data.price) > 0 ? formatPrice(Number(data.price)) : '—';

    // A sale price only counts as a discount when it genuinely undercuts the
    // list price, mirroring Product::isDiscounted() on the server.
    const discountPercent =
        Number(data.sale_price) > 0 && Number(data.price) > 0 && Number(data.sale_price) < Number(data.price)
            ? Math.round((1 - Number(data.sale_price) / Number(data.price)) * 100)
            : null;

    return (
        <form onSubmit={submit} className="space-y-6">
            <Panel title="Identity" description="How the product is named, priced and filtered across the storefront.">
                <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="name">Product name</Label>
                    <Input
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        placeholder="Argus G3"
                        required
                    />
                    <InputError className="mt-1" message={fieldErrors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="price">Price (IDR)</Label>
                    <Input
                        id="price"
                        type="number"
                        min={0}
                        step={1}
                        className="mt-1 block w-full"
                        value={data.price}
                        onChange={(event) => setData('price', event.target.value)}
                        placeholder="109000"
                        required
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Displayed as {pricePreview}</p>
                    <InputError className="mt-1" message={fieldErrors.price} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="sale_price">Sale price (IDR)</Label>
                    <Input
                        id="sale_price"
                        type="number"
                        min={0}
                        step={1}
                        className="mt-1 block w-full"
                        value={data.sale_price}
                        onChange={(event) => setData('sale_price', event.target.value)}
                        placeholder="Leave empty for no discount"
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Optional. Wishlisters get an email when it drops.</p>
                    <div className="flex items-center justify-between gap-3 text-xs">
                        <InputError className="mt-1" message={fieldErrors.sale_price} />
                        <span className="font-semibold text-amber-700 dark:text-amber-400">
                            {discountPercent ? `-${discountPercent}%` : 'No discount'}
                        </span>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="in_stock">Availability</Label>
                    <label
                        htmlFor="in_stock"
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 bg-white/60 p-3 dark:border-white/10 dark:bg-neutral-900/60"
                    >
                        <Checkbox
                            id="in_stock"
                            checked={data.in_stock}
                            onCheckedChange={(checked) => setData('in_stock', checked === true)}
                            className="mt-0.5"
                        />
                        <span className="min-w-0">
                            <span className="block text-sm font-semibold">In stock</span>
                            <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                                Untick to mark it sold out. Ticking it back on emails everyone who saved it.
                            </span>
                        </span>
                    </label>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="tag">Collection mark</Label>
                    <Input
                        id="tag"
                        list="admin-tag-options"
                        className="mt-1 block w-full"
                        value={data.tag}
                        onChange={(event) => setData('tag', event.target.value)}
                        placeholder="New arrival"
                        required
                    />
                    <datalist id="admin-tag-options">
                        {tagOptions.map((option) => (
                            <option key={option} value={option} />
                        ))}
                    </datalist>
                    <InputError className="mt-1" message={fieldErrors.tag} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                        id="category"
                        list="admin-category-options"
                        className="mt-1 block w-full"
                        value={data.category}
                        onChange={(event) => setData('category', event.target.value)}
                        placeholder="Case"
                        required
                    />
                    <datalist id="admin-category-options">
                        {categoryOptions.map((option) => (
                            <option key={option} value={option} />
                        ))}
                    </datalist>
                    <InputError className="mt-1" message={fieldErrors.category} />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-medium dark:border-white/10 dark:bg-neutral-900/60">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-black/20 accent-amber-600 dark:accent-amber-500"
                            checked={data.is_featured}
                            onChange={(event) => setData('is_featured', event.target.checked)}
                        />
                        Feature this product on the dashboard
                    </label>
                </div>
            </Panel>

            <Panel title="Photography" description="The hero shot, its backdrop tint and the gallery shown on the product page.">
                <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="image">Main image</Label>
                    <Input
                        id="image"
                        className="mt-1 block w-full font-mono text-xs"
                        value={data.image}
                        onChange={(event) => setData('image', event.target.value)}
                        placeholder="/images/case/Argus%20G3/IMG-20250708-WA0001.jpg"
                        required
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        A path inside <code>/public</code> or a full image URL.
                    </p>
                    <InputError className="mt-1" message={fieldErrors.image} />
                    {data.image && (
                        <div className={`mt-2 overflow-hidden rounded-2xl border border-black/10 p-3 ${data.color}`}>
                            <img src={data.image} alt="Main preview" className="h-44 w-full rounded-xl bg-white object-contain" />
                        </div>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="color">Backdrop tint</Label>
                    <Input
                        id="color"
                        list="admin-color-options"
                        className="mt-1 block w-full font-mono text-xs"
                        value={data.color}
                        onChange={(event) => setData('color', event.target.value)}
                        placeholder="bg-stone-200"
                    />
                    <datalist id="admin-color-options">
                        {colorOptions.map((option) => (
                            <option key={option} value={option} />
                        ))}
                    </datalist>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                        Preview
                        <span className={`inline-block h-6 w-10 rounded-md border border-black/10 dark:border-white/15 ${data.color}`} />
                    </div>
                    <InputError className="mt-1" message={fieldErrors.color} />
                </div>

                <div className="grid gap-3 sm:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                        <Label>Gallery images</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setData('gallery', [...data.gallery, ''])}>
                            <ImagePlus className="h-4 w-4" />
                            Add image
                        </Button>
                    </div>

                    {data.gallery.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-black/15 px-4 py-3 text-sm text-neutral-500 dark:border-white/15 dark:text-neutral-400">
                            No gallery images yet. The storefront falls back to the main image.
                        </p>
                    ) : (
                        data.gallery.map((image, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    className="font-mono text-xs"
                                    value={image}
                                    onChange={(event) => updateGalleryImage(index, event.target.value)}
                                    placeholder="/images/case/product/photo.jpg"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeGalleryImage(index)}
                                    aria-label={`Remove gallery image ${index + 1}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}

                    <InputError className="mt-1" message={fieldErrors.gallery} />
                </div>
            </Panel>

            <Panel title="Specifications" description="Label and value rows, mirrored in the storefront comparison table.">
                <div className="grid gap-3 sm:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                        <Label>Rows</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setData('specs', [...data.specs, { label: '', value: '' }])}>
                            <Plus className="h-4 w-4" />
                            Add row
                        </Button>
                    </div>

                    {data.specs.map((spec, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                className="sm:max-w-[38%]"
                                value={spec.label}
                                onChange={(event) => updateSpec(index, 'label', event.target.value)}
                                placeholder="Format"
                            />
                            <Input
                                value={spec.value}
                                onChange={(event) => updateSpec(index, 'value', event.target.value)}
                                placeholder="Protective case"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSpec(index)}
                                aria-label={`Remove specification ${index + 1}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}

                    <InputError className="mt-1" message={fieldErrors.specs} />
                </div>
            </Panel>

            <Panel title="Marketplace" description="Where the &ldquo;Find on marketplace&rdquo; button sends buyers.">
                <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="marketplace_url">Marketplace link</Label>
                    <Input
                        id="marketplace_url"
                        type="url"
                        className="mt-1 block w-full font-mono text-xs"
                        value={data.marketplace_url}
                        onChange={(event) => setData('marketplace_url', event.target.value)}
                        placeholder="https://shopee.co.id/..."
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Optional. When left empty the storefront falls back to a Google Shopping search.
                    </p>
                    <InputError className="mt-1" message={fieldErrors.marketplace_url} />
                </div>
            </Panel>

            <div className="flex flex-wrap items-center justify-end gap-3 pb-4">
                <Button type="button" variant="ghost" asChild>
                    <Link href={route('admin.products.index')} prefetch>
                        Cancel
                    </Link>
                </Button>
                <Button type="submit" disabled={processing}>
                    <Save className="h-4 w-4" />
                    {product ? 'Save changes' : 'Create product'}
                </Button>
            </div>
        </form>
    );
}
