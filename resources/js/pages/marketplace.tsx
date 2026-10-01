import { ThemeToggle } from '@/components/theme-toggle';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { formatPrice, type Product } from '@/lib/products';
import type { User } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, GitCompareArrows, Heart, LogIn, LogOut, Menu, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function Marketplace({ products: allProducts }: { products: Product[] }) {
    const { auth } = usePage().props as unknown as { auth: { user: User | null } };
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('featured');
    const [savedItems, setSavedItems] = useState<string[]>([]);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showSavedItems, setShowSavedItems] = useState(false);
    const [compareItems, setCompareItems] = useState<string[]>([]);
    const [showComparison, setShowComparison] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [storageReady, setStorageReady] = useState(false);

    // Filter chips are derived from the catalogue so new admin tags appear automatically.
    const categories = useMemo(
        () => ['All', ...Array.from(new Set(allProducts.flatMap((product) => [product.category, product.tag])))],
        [allProducts],
    );

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const productName = params.get('product');
        const category = params.get('category');
        const productFromUrl = allProducts.find((product) => product.name === productName);

        if (category && categories.includes(category)) {
            setSelectedCategory(category);
        }

        if (productFromUrl) {
            setSelectedProduct(productFromUrl);
            setSelectedImage(productFromUrl.gallery[0]);
        }

        try {
            const saved = JSON.parse(localStorage.getItem('vagary:saved-items') ?? '[]');
            const compared = JSON.parse(localStorage.getItem('vagary:compare-items') ?? '[]');
            setSavedItems(Array.isArray(saved) ? saved : []);
            setCompareItems(Array.isArray(compared) ? compared.slice(0, 3) : []);
        } catch {
            setSavedItems([]);
            setCompareItems([]);
        }
        setStorageReady(true);
        // Runs once on mount to read the deep link and the saved shortlist from storage.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!storageReady) return;

        localStorage.setItem('vagary:saved-items', JSON.stringify(savedItems));
        localStorage.setItem('vagary:compare-items', JSON.stringify(compareItems));
    }, [compareItems, savedItems, storageReady]);

    const filteredProducts = allProducts.filter((product) => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory || product.tag === selectedCategory;
        const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const sortedProducts = [...filteredProducts].sort((firstProduct, secondProduct) => {
        if (sortOption === 'price-low') {
            return firstProduct.price - secondProduct.price;
        }

        if (sortOption === 'price-high') {
            return secondProduct.price - firstProduct.price;
        }

        return allProducts.indexOf(firstProduct) - allProducts.indexOf(secondProduct);
    });

    const toggleSavedItem = (productName: string) => {
        const isSaved = savedItems.includes(productName);
        setSavedItems(isSaved ? savedItems.filter((item) => item !== productName) : [...savedItems, productName]);
        setNotificationMessage(isSaved ? `${productName} removed from your shortlist.` : `${productName} saved to your shortlist.`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
    };

    const openProduct = (product: Product) => {
        setSelectedProduct(product);
        setSelectedImage(product.gallery[0]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleCompareItem = (productName: string) => {
        if (compareItems.includes(productName)) {
            setCompareItems(compareItems.filter((item) => item !== productName));
            return;
        }

        if (compareItems.length >= 3) {
            setNotificationMessage('Compare up to three products at a time.');
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 2000);
            return;
        }

        setCompareItems([...compareItems, productName]);
    };

    const comparisonProducts = compareItems
        .map((productName) => allProducts.find((product) => product.name === productName))
        .filter((product): product is Product => Boolean(product));
    const comparisonColumns: (Product | null)[] = [...comparisonProducts, null, null].slice(0, 3);
    // Marketplace link per product. If a product defines `marketplaceUrl`, it is
    // used as-is. Otherwise it falls back to a generic shop search for the name.
    const marketplaceUrlFor = (product: Product) =>
        product.marketplace_url ?? `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(`Vagary ${product.name}`)}`;

    return (
        <div className="min-h-screen text-neutral-900 transition-colors duration-300 dark:text-white">
            <Head title="Marketplace" />

            <header className="public-navbar sticky top-0 z-50 border-b border-black/5 backdrop-blur-xl dark:border-white/10">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:px-8">
                    <Sheet>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                aria-label="Open navigation menu"
                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-neutral-950 transition hover:border-neutral-950 md:hidden dark:border-white/15 dark:bg-neutral-900 dark:text-white dark:hover:border-white/40"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[min(86vw,360px)] bg-[#fdfbf7] p-6 dark:bg-[#181818]">
                            <SheetHeader className="text-left">
                                <SheetTitle className="text-2xl font-black tracking-[-0.05em] text-neutral-950">Explore Vagary</SheetTitle>
                            </SheetHeader>
                            <div className="mt-8 flex max-h-[45vh] flex-col gap-2 overflow-y-auto">
                                <SheetClose asChild>
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-xl px-4 py-3 font-semibold text-neutral-950 transition hover:bg-black/5"
                                    >
                                        Home
                                    </Link>
                                </SheetClose>
                                {categories.map((item) => (
                                    <SheetClose key={item} asChild>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedCategory(item);
                                                setSearchQuery('');
                                            }}
                                            className="rounded-xl px-4 py-3 text-left text-neutral-600 transition hover:bg-black/5 hover:text-neutral-950"
                                        >
                                            {item}
                                        </button>
                                    </SheetClose>
                                ))}
                            </div>
                            <div className="mt-8 border-t border-black/10 pt-6">
                                <SheetClose asChild>
                                    <button
                                        type="button"
                                        onClick={() => setShowSavedItems(true)}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 py-3 text-sm font-semibold text-white"
                                    >
                                        <Heart className="h-4 w-4" />
                                        Saved items {savedItems.length > 0 && `(${savedItems.length})`}
                                    </button>
                                </SheetClose>
                                <div className="mt-3">
                                    {auth.user ? (
                                        <SheetClose asChild>
                                            <Link
                                                method="post"
                                                href={route('logout')}
                                                as="button"
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Log out
                                            </Link>
                                        </SheetClose>
                                    ) : (
                                        <SheetClose asChild>
                                            <Link
                                                href={route('login')}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
                                            >
                                                <LogIn className="h-4 w-4" />
                                                Log in
                                            </Link>
                                        </SheetClose>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <Link href={route('dashboard')} className="flex min-w-0 items-center gap-2 transition hover:opacity-80 sm:gap-3">
                        <img
                            src="/images/case/products/VagaryLogo.jpg"
                            alt="Vagary Leather"
                            className="h-10 w-10 shrink-0 rounded-full object-cover object-center sm:h-12 sm:w-12"
                        />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold tracking-[0.32em] text-neutral-500 uppercase dark:text-neutral-400">Vagary</p>
                            <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">Leather Atelier</p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-700 md:flex dark:text-neutral-300">
                        {categories.map((item) => (
                            <button
                                key={item}
                                onClick={() => {
                                    setSelectedCategory(item);
                                    setSearchQuery('');
                                }}
                                className={`transition ${
                                    selectedCategory === item
                                        ? 'font-semibold text-neutral-950 dark:text-white'
                                        : 'hover:text-neutral-950 dark:hover:text-white'
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <label className="flex min-w-0 items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 sm:px-4 dark:border-white/15 dark:bg-neutral-900">
                            <Search className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
                            <input
                                type="search"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSelectedCategory('All');
                                }}
                                className="w-24 min-w-0 bg-transparent text-xs font-medium placeholder-neutral-500 outline-none sm:w-40 sm:text-sm dark:text-white"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowSavedItems(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                        >
                            <Heart className="h-4 w-4" />
                            {savedItems.length > 0 && (
                                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold">{savedItems.length}</span>
                            )}
                            Saved
                        </button>
                        {auth.user ? (
                            <Link
                                method="post"
                                href={route('logout')}
                                as="button"
                                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium transition hover:border-neutral-950 dark:border-white/15 dark:bg-neutral-900 dark:text-white dark:hover:border-white/40"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Log out</span>
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium transition hover:border-neutral-950 dark:border-white/15 dark:bg-neutral-900 dark:text-white dark:hover:border-white/40"
                            >
                                <LogIn className="h-4 w-4" />
                                <span className="hidden sm:inline">Log in</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {showSavedItems && (
                <div className="fixed inset-0 z-[60] bg-black/30" onClick={() => setShowSavedItems(false)}>
                    <aside
                        className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-[#fdfbf7] p-6 shadow-2xl sm:p-8 dark:bg-[#181818]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-black/10 pb-5">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase">Your selection</p>
                                <h2 className="mt-1 text-2xl font-black tracking-[-0.05em]">Saved items ({savedItems.length})</h2>
                            </div>
                            <button
                                type="button"
                                aria-label="Close saved items"
                                onClick={() => setShowSavedItems(false)}
                                className="rounded-full p-2 transition hover:bg-black/5"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {savedItems.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center text-center">
                                <Heart className="h-10 w-10 text-neutral-400" />
                                <p className="mt-4 text-lg font-semibold">Your shortlist is empty</p>
                                <p className="mt-2 text-sm text-neutral-500">Save products here while you browse.</p>
                                <button
                                    type="button"
                                    onClick={() => setShowSavedItems(false)}
                                    className="mt-6 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                                >
                                    Browse products
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 space-y-4 overflow-y-auto py-6">
                                    {savedItems.map((productName) => {
                                        const product = allProducts.find((item) => item.name === productName);
                                        if (!product) return null;

                                        return (
                                            <div key={productName} className="flex gap-4 border-b border-black/10 pb-4">
                                                <img src={product.image} alt={product.name} className="h-20 w-20 rounded-xl object-cover" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <p className="font-semibold">{product.name}</p>
                                                        <p className="font-semibold">{formatPrice(product.price)}</p>
                                                    </div>
                                                    <p className="mt-1 text-sm text-neutral-500">{product.category} device</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSavedItem(productName)}
                                                        className="mt-3 text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase underline underline-offset-4 hover:text-neutral-950"
                                                    >
                                                        Remove from shortlist
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="border-t border-black/10 pt-5 text-sm leading-6 text-neutral-500">
                                    Ready to buy? Open a product and continue to the marketplace when you are ready.
                                </p>
                            </>
                        )}
                    </aside>
                </div>
            )}

            {showComparison && (
                <div
                    className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-6"
                    onClick={() => setShowComparison(false)}
                >
                    <section
                        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-t-[28px] bg-[#fdfbf7] p-5 shadow-2xl sm:rounded-[28px] sm:p-8 dark:bg-[#181818]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-5">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase">Side by side</p>
                                <h2 className="mt-1 text-2xl font-black tracking-[-0.05em]">Compare products</h2>
                            </div>
                            <button
                                type="button"
                                aria-label="Close comparison"
                                onClick={() => setShowComparison(false)}
                                className="rounded-full p-2 transition hover:bg-black/5"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-6 overflow-x-auto">
                            <div className="grid min-w-[620px] grid-cols-[120px_repeat(3,minmax(150px,1fr))] gap-x-4">
                                <div />
                                {comparisonColumns.map((product, index) =>
                                    product ? (
                                        <div key={product.name} className="min-w-0">
                                            <div className={`overflow-hidden rounded-2xl p-2 ${product.color}`}>
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-32 w-full rounded-xl bg-white object-contain"
                                                />
                                            </div>
                                            <p className="mt-3 truncate text-lg font-semibold">{product.name}</p>
                                        </div>
                                    ) : (
                                        <div
                                            key={`empty-${index}`}
                                            className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-black/15 text-center text-sm text-neutral-500"
                                        >
                                            Add another product
                                        </div>
                                    ),
                                )}

                                {[
                                    ['Price', (product: Product) => formatPrice(product.price)],
                                    ['Category', (product: Product) => product.category],
                                    ['Collection mark', (product: Product) => product.tag],
                                    ...(comparisonProducts[0]?.specs.map(
                                        (spec) =>
                                            [
                                                spec.label,
                                                (product: Product) => product.specs.find((item) => item.label === spec.label)?.value ?? '—',
                                            ] as const,
                                    ) ?? []),
                                ].map(([label, value]) => (
                                    <div key={label as string} className="contents">
                                        <p className="border-t border-black/10 py-4 text-sm font-semibold text-neutral-500">{label as string}</p>
                                        {comparisonColumns.map((product, index) => (
                                            <p
                                                key={`${product?.name ?? 'empty'}-${label as string}-${index}`}
                                                className="border-t border-black/10 py-4 text-sm font-medium"
                                            >
                                                {product ? (value as (product: Product) => string)(product) : '—'}
                                            </p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {compareItems.length > 0 && !showComparison && (
                <div className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between gap-4 rounded-2xl bg-neutral-950 px-4 py-3 text-white shadow-2xl sm:bottom-6 sm:w-auto sm:min-w-[430px]">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold">{compareItems.length} selected to compare</p>
                        <p className="truncate text-xs text-neutral-400">{comparisonProducts.map((product) => product.name).join(' · ')}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowComparison(true)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
                    >
                        <GitCompareArrows className="h-4 w-4" />
                        Compare
                    </button>
                </div>
            )}

            {selectedProduct ? (
                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                    <button
                        type="button"
                        onClick={() => setSelectedProduct(null)}
                        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 transition hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to products
                    </button>

                    <section className="grid items-start gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
                        <div className="space-y-4">
                            <div
                                className={`relative min-h-[460px] overflow-hidden rounded-[30px] p-4 sm:min-h-[620px] sm:p-8 ${selectedProduct.color}`}
                            >
                                <div className="absolute top-8 left-8 z-10 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-neutral-800 uppercase">
                                    {selectedProduct.tag}
                                </div>
                                <img
                                    src={selectedImage || selectedProduct.image}
                                    alt={selectedProduct.name}
                                    className="h-full min-h-[420px] w-full rounded-[22px] bg-white object-contain sm:min-h-[550px]"
                                />
                            </div>

                            <div className="flex gap-3 overflow-x-auto pb-1">
                                {selectedProduct.gallery.map((image) => (
                                    <button
                                        key={image}
                                        type="button"
                                        onClick={() => setSelectedImage(image)}
                                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition ${selectedImage === image ? 'border-neutral-950' : 'border-black/10 hover:border-black/40'}`}
                                    >
                                        <img src={image} alt={`${selectedProduct.name} view`} className="h-full w-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col justify-center py-2">
                            <p className="text-xs font-semibold tracking-[0.3em] text-neutral-500 uppercase dark:text-neutral-400">
                                {selectedProduct.category} collection
                            </p>
                            <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] sm:text-5xl">{selectedProduct.name}</h1>
                            <p className="mt-4 text-2xl font-semibold">{formatPrice(selectedProduct.price)}</p>
                            <p className="mt-6 max-w-lg text-base leading-7 text-neutral-600 dark:text-neutral-300">
                                A considered leather essential, crafted for its character, durability, and place in your everyday carry.
                            </p>

                            <div className="mt-10 border-t border-black/10 pt-6 dark:border-white/10">
                                <p className="text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                                    Review the product details, compare it with other devices, then choose a marketplace seller.
                                </p>
                            </div>

                            <a
                                href={marketplaceUrlFor(selectedProduct)}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-6 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Find on marketplace
                            </a>

                            <button
                                type="button"
                                onClick={() => toggleSavedItem(selectedProduct.name)}
                                className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-6 text-sm font-semibold text-neutral-900 transition hover:border-neutral-950 dark:border-white/15 dark:bg-neutral-900 dark:text-white dark:hover:border-white/40"
                            >
                                <Heart className={`h-4 w-4 ${savedItems.includes(selectedProduct.name) ? 'fill-current' : ''}`} />
                                {savedItems.includes(selectedProduct.name) ? 'Saved to shortlist' : 'Save to shortlist'}
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleCompareItem(selectedProduct.name)}
                                className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-black/15 px-6 text-sm font-semibold transition hover:border-neutral-950 dark:border-white/15 dark:text-white dark:hover:border-white/40"
                            >
                                <GitCompareArrows className="h-4 w-4" />
                                {compareItems.includes(selectedProduct.name) ? 'Remove from compare' : 'Add to compare'}
                            </button>
                        </div>
                    </section>
                </main>
            ) : (
                <main className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                    {showNotification && (
                        <div className="animate-in fade-in fixed top-4 right-4 z-50 rounded-full bg-green-500 px-6 py-3 text-sm font-medium text-white shadow-lg">
                            {notificationMessage}
                        </div>
                    )}

                    <section className="space-y-5">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase">Shop</p>
                                <h1 className="mt-2 text-4xl font-black tracking-[-0.06em]">
                                    {selectedCategory === 'All' ? 'All Collections' : selectedCategory}
                                </h1>
                            </div>
                            <Link
                                href={route('dashboard')}
                                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-white/15 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                            >
                                Back to home
                            </Link>
                        </div>

                        <div className="space-y-3">
                            <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
                                {categories.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setSelectedCategory(item)}
                                        className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                                            selectedCategory === item
                                                ? 'border-neutral-950 bg-neutral-950 text-white'
                                                : 'border-black/10 bg-white hover:border-neutral-950'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 border-y border-black/10 py-3">
                                <p className="text-sm text-neutral-500">
                                    <span className="font-semibold text-neutral-900">{sortedProducts.length}</span>{' '}
                                    {sortedProducts.length === 1 ? 'product' : 'products'}
                                    {searchQuery && <span> matching "{searchQuery}"</span>}
                                </p>
                                <div className="flex items-center gap-2">
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="rounded-full px-3 py-2 text-sm font-medium text-neutral-500 transition hover:bg-white hover:text-neutral-950"
                                        >
                                            Clear search
                                        </button>
                                    )}
                                    <label className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium dark:border-white/15 dark:bg-neutral-900">
                                        <span className="text-neutral-500 dark:text-neutral-400">Sort</span>
                                        <select
                                            value={sortOption}
                                            onChange={(event) => setSortOption(event.target.value)}
                                            className="bg-transparent font-semibold outline-none dark:text-white"
                                        >
                                            <option value="featured">Featured</option>
                                            <option value="price-low">Price: low to high</option>
                                            <option value="price-high">Price: high to low</option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            {sortedProducts.length > 0 ? (
                                sortedProducts.map((product) => (
                                    <article
                                        key={product.name}
                                        onClick={() => openProduct(product)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') openProduct(product);
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        className="group cursor-pointer overflow-hidden rounded-[26px] border border-black/5 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#181818]"
                                    >
                                        <div className={`relative overflow-hidden rounded-[22px] ${product.color}`}>
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                            <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] text-neutral-800 uppercase">
                                                {product.tag}
                                            </span>
                                        </div>
                                        <div className="space-y-4 p-2 pt-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-lg font-semibold">{product.name}</p>
                                                    <p className="text-sm text-neutral-500">{product.category}</p>
                                                </div>
                                                <p className="text-lg font-bold">{formatPrice(product.price)}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleSavedItem(product.name);
                                                    }}
                                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                                                >
                                                    <Heart className={`h-4 w-4 ${savedItems.includes(product.name) ? 'fill-current' : ''}`} />
                                                    {savedItems.includes(product.name) ? 'Saved' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleCompareItem(product.name);
                                                    }}
                                                    className={`inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2.5 text-sm font-medium transition ${
                                                        compareItems.includes(product.name)
                                                            ? 'border-neutral-950 bg-neutral-100'
                                                            : 'border-black/15 hover:border-neutral-950'
                                                    }`}
                                                >
                                                    <GitCompareArrows className="h-4 w-4" />
                                                    {compareItems.includes(product.name) ? 'Added' : 'Compare'}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="col-span-full rounded-[26px] border border-black/5 bg-white p-12 text-center">
                                    <p className="text-lg font-semibold text-neutral-600">No products found</p>
                                    <p className="mt-2 text-sm text-neutral-500">Try adjusting your search or filters</p>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            )}
        </div>
    );
}
