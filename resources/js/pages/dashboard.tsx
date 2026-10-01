import { ThemeToggle } from '@/components/theme-toggle';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import WelcomeModal from '@/components/welcome-modal';
import { formatPrice, type Product } from '@/lib/products';
import type { User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowUpRight, LogIn, LogOut, Menu, Search, ShieldCheck, Sparkles, Volume2, Zap } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';

const categories = ['Leather Case', 'New arrival', 'Featured', 'Popular', 'Top rated'];

const perks = [
    { label: 'Full grain leather', detail: 'Hand-selected vegetable tanned hides', icon: Volume2 },
    { label: 'Compare easily', detail: 'Side by side patina & leather fit specs', icon: Zap },
    { label: 'Artisan crafted', detail: 'Lifetime stitching guarantee', icon: ShieldCheck },
];

/*
  Static craft marks for the hero swatch. The reactive stitching canvas moved out of this
  section and now runs behind the whole site (see VagaryLeatherBackdrop), so the hero uses
  a quiet hand-cut leather card instead: grain, saddle stitching, brass rivets and drifting
  signal marks.
*/
const heroSignals = [
    { left: 6, top: 18, rotation: -22, color: '#d97706', delay: 0 },
    { left: 14, top: 68, rotation: 12, color: '#b45309', delay: 0.8 },
    { left: 22, top: 38, rotation: -8, color: '#a8a29e', delay: 1.6 },
    { left: 30, top: 82, rotation: 26, color: '#f59e0b', delay: 2.4 },
    { left: 41, top: 14, rotation: -32, color: '#78716c', delay: 0.4 },
    { left: 52, top: 74, rotation: 8, color: '#c2410c', delay: 1.2 },
    { left: 61, top: 30, rotation: -14, color: '#d97706', delay: 2.0 },
    { left: 70, top: 88, rotation: 20, color: '#e5e5e5', delay: 2.8 },
    { left: 78, top: 46, rotation: -26, color: '#fbbf24', delay: 1.4 },
    { left: 86, top: 22, rotation: 16, color: '#92400e', delay: 0.6 },
    { left: 92, top: 70, rotation: -10, color: '#d6d3d1', delay: 2.2 },
    { left: 12, top: 46, rotation: 34, color: '#b45309', delay: 3.0 },
    { left: 66, top: 60, rotation: -20, color: '#78716c', delay: 1.8 },
    { left: 46, top: 52, rotation: 6, color: '#f59e0b', delay: 2.6 },
];

const heroRivets = ['top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'right-6 bottom-6'];

export default function Dashboard({ products }: { products: Product[] }) {
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
    const [showWelcome, setShowWelcome] = useState(false);
    const { auth } = usePage().props as unknown as { auth: { user: User | null } };

    // Show welcome modal for unauthenticated users on first visit
    useEffect(() => {
        const dismissed = localStorage.getItem('welcome-dismissed');
        if (!auth.user && !dismissed) {
            setShowWelcome(true);
        }
    }, [auth.user]);

    const handleWelcomeClose = () => {
        setShowWelcome(false);
    };

    return (
        <>
            <WelcomeModal isOpen={showWelcome} onClose={handleWelcomeClose} />
            <div className="min-h-screen text-neutral-900 transition-colors duration-300 dark:text-white">
                <Head title="Dashboard" />

                <header className="public-navbar sticky top-0 z-50 border-b border-black/5 backdrop-blur-xl dark:border-white/10">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
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
                                <nav className="mt-8 flex flex-col gap-2">
                                    <SheetClose asChild>
                                        <Link
                                            href={route('dashboard')}
                                            className="rounded-xl px-4 py-3 font-semibold text-neutral-950 transition hover:bg-black/5"
                                        >
                                            Home
                                        </Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Link
                                            href={route('marketplace')}
                                            className="rounded-xl px-4 py-3 font-semibold text-neutral-950 transition hover:bg-black/5"
                                        >
                                            All products
                                        </Link>
                                    </SheetClose>
                                    {categories.map((item) => (
                                        <SheetClose key={item} asChild>
                                            <Link
                                                href={`${route('marketplace')}?category=${encodeURIComponent(item)}`}
                                                className="rounded-xl px-4 py-3 text-neutral-600 transition hover:bg-black/5 hover:text-neutral-950"
                                            >
                                                {item}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </nav>
                                <div className="mt-8 border-t border-black/10 pt-6">
                                    <SheetClose asChild>
                                        <Link
                                            href={route('marketplace')}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 py-3 text-sm font-semibold text-white"
                                        >
                                            <Search className="h-4 w-4" />
                                            Search products
                                        </Link>
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
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/case/products/VagaryLogo.jpg"
                                alt="Vagary Leather"
                                className="h-12 w-12 rounded-full object-cover object-center"
                            />
                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.32em] text-neutral-500 uppercase dark:text-neutral-400">Vagary</p>
                                <p className="text-sm font-semibold text-neutral-950 dark:text-white">Leather Atelier</p>
                            </div>
                        </div>

                        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-700 md:flex dark:text-neutral-300">
                            <Link
                                href={route('marketplace')}
                                className="font-semibold text-neutral-950 transition hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300"
                            >
                                Products
                            </Link>
                            {categories.map((item) => (
                                <Link
                                    key={item}
                                    href={`${route('marketplace')}?category=${encodeURIComponent(item)}`}
                                    className="transition hover:text-neutral-950 dark:hover:text-white"
                                >
                                    {item}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <Link
                                href={route('marketplace')}
                                className="hidden rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium transition hover:border-neutral-950 sm:inline-flex dark:border-white/15 dark:bg-neutral-900 dark:text-white"
                            >
                                Search
                            </Link>
                            <Link
                                href={route('marketplace')}
                                className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                            >
                                Browse products
                            </Link>
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

                <main className="space-y-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                    <section
                        className="relative isolate mx-auto flex min-h-[500px] max-w-6xl items-center justify-center overflow-hidden rounded-[32px] border border-black/10 bg-white/60 px-5 py-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 sm:min-h-[560px] lg:py-16 dark:border-white/10 dark:bg-[#121212]/85 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                        onPointerMove={(e) => {
                            const bounds = e.currentTarget.getBoundingClientRect();
                            const x = (e.clientX - bounds.left) / bounds.width - 0.5;
                            const y = (e.clientY - bounds.top) / bounds.height - 0.5;
                            setTilt({ rotateX: -y * 8, rotateY: x * 8 });
                        }}
                        onPointerLeave={() => setTilt({ rotateX: 0, rotateY: 0 })}
                    >
                        {/* Hand-cut leather swatch: grain, saddle stitching, rivets and drifting craft marks */}
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-transparent to-amber-200/20 dark:from-amber-500/[0.07] dark:via-transparent dark:to-orange-500/[0.05]" />
                            <div className="leather-grain absolute inset-0 opacity-30 mix-blend-multiply dark:opacity-10 dark:mix-blend-screen" />
                            <div className="leather-stitch absolute inset-3 rounded-[26px] sm:inset-5 sm:rounded-[30px]" />

                            {heroRivets.map((rivet) => (
                                <span
                                    key={rivet}
                                    className={`absolute h-2.5 w-2.5 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 shadow-[0_1px_2px_rgba(0,0,0,0.35)] ${rivet}`}
                                />
                            ))}

                            {heroSignals.map((signal) => (
                                <span
                                    key={`${signal.left}-${signal.top}`}
                                    className="vagary-signal"
                                    style={
                                        {
                                            left: `${signal.left}%`,
                                            top: `${signal.top}%`,
                                            '--signal-color': signal.color,
                                            '--signal-rotation': `${signal.rotation}deg`,
                                            '--signal-delay': `${signal.delay}s`,
                                        } as CSSProperties
                                    }
                                />
                            ))}

                            <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-400/[0.05]" />
                            <div className="absolute -right-16 -bottom-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-500/[0.04]" />

                            {/* Soft vignette so the headline keeps its depth over the grain */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(230,223,208,0.65)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]" />
                        </div>

                        {/* Interactive 3D subtle tilt text container */}
                        <div
                            className="pointer-events-none relative z-10 flex max-w-3xl flex-col items-center transition-transform duration-200 ease-out"
                            style={{
                                transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                            }}
                        >
                            <div className="pointer-events-auto inline-flex items-center gap-2.5 rounded-full border border-black/10 bg-white/90 px-4 py-1.5 text-[11px] font-semibold tracking-[0.28em] text-neutral-800 uppercase shadow-sm backdrop-blur-md transition-transform hover:scale-105 dark:border-white/15 dark:bg-neutral-900/90 dark:text-neutral-200">
                                <span className="flex h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                                <span>Vagary Leather Atelier</span>
                                <span className="text-neutral-400">/</span>
                                <span className="text-neutral-500 dark:text-neutral-400">2026</span>
                            </div>

                            <h1 className="mt-6 max-w-2xl text-4xl leading-[0.92] font-extrabold tracking-[-0.05em] text-neutral-950 uppercase select-none sm:text-5xl md:text-6xl dark:text-white">
                                Find your leather.
                                <span className="block bg-gradient-to-r from-neutral-600 via-neutral-700 to-neutral-900 bg-clip-text text-transparent dark:from-neutral-300 dark:via-neutral-200 dark:to-neutral-400">
                                    Choose what matches your wave.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-lg text-sm leading-6 text-neutral-700 sm:text-base dark:text-neutral-200">
                                An artisanal leather studio crafted for premium device cases and bespoke everyday carry. Touch, inspect patina, and
                                compare hand-stitched leather.
                            </p>

                            <div className="pointer-events-auto mt-9 flex flex-wrap justify-center gap-3.5">
                                <Link
                                    href={route('marketplace')}
                                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-xl dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                                >
                                    <span>Browse products</span>
                                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </Link>
                                <Link
                                    href={`${route('marketplace')}?category=Featured`}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white/90 px-8 py-3.5 text-sm font-semibold text-neutral-950 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:bg-white dark:border-white/15 dark:bg-neutral-900/90 dark:text-white dark:hover:border-white/40 dark:hover:bg-neutral-900"
                                >
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    <span>Explore featured</span>
                                </Link>
                            </div>

                            {/* Interactive Feature Perks with Micro-interactions */}
                            <div className="pointer-events-auto mt-14 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3">
                                {perks.map((perk) => {
                                    const IconComponent = perk.icon;
                                    return (
                                        <div
                                            key={perk.label}
                                            className="group rounded-2xl border border-black/10 bg-white/80 p-4.5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-black/20 hover:shadow-lg dark:border-white/10 dark:bg-neutral-900/80 dark:hover:border-white/25"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/5 text-neutral-900 transition-colors group-hover:bg-neutral-950 group-hover:text-white dark:bg-white/10 dark:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-950">
                                                    <IconComponent className="h-4 w-4" />
                                                </div>
                                                <p className="text-sm font-semibold text-neutral-950 dark:text-white">{perk.label}</p>
                                            </div>
                                            <p className="mt-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">{perk.detail}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-3">
                        {[
                            { value: '12k+', label: 'Satisfied customers' },
                            { value: '4.8/5', label: 'Customer satisfaction' },
                            { value: 'Best prices', label: 'Available with discounts' },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-[24px] border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#181818]"
                            >
                                <p className="text-3xl font-black tracking-[-0.06em]">{stat.value}</p>
                                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
                            </div>
                        ))}
                    </section>

                    <section className="space-y-5">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase">Featured</p>
                                <h2 className="mt-2 text-3xl font-black tracking-[-0.06em]">Best of the season</h2>
                            </div>
                            <Link
                                href={route('marketplace')}
                                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium transition hover:bg-neutral-100"
                            >
                                View all
                            </Link>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            {products.map((product) => (
                                <article
                                    key={product.name}
                                    onClick={() => router.visit(`${route('marketplace')}?product=${encodeURIComponent(product.name)}`)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            router.visit(`${route('marketplace')}?product=${encodeURIComponent(product.name)}`);
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    className="group cursor-pointer overflow-hidden rounded-[26px] border border-black/5 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
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
                                        <Link
                                            href={`${route('marketplace')}?product=${encodeURIComponent(product.name)}`}
                                            onClick={(event) => event.stopPropagation()}
                                            className="inline-flex w-full items-center justify-center rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                                        >
                                            View details
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[30px] border border-black/5 bg-[#e8e0d5] p-6 text-neutral-900 shadow-sm sm:p-8 lg:p-10 dark:bg-[#24211e] dark:text-white">
                        <div className="grid items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                            <div className="space-y-4">
                                <p className="text-xs font-semibold tracking-[0.28em] text-neutral-600 uppercase dark:text-neutral-300">
                                    Leathercraft Atelier
                                </p>
                                <h3 className="text-3xl font-black tracking-[-0.06em] sm:text-4xl">
                                    A bespoke leather case built for your daily device.
                                </h3>
                                <p className="max-w-md text-neutral-700 dark:text-neutral-300">
                                    Explore genuine leather cases, compare grain and craftsmanship details that matter, then continue to the
                                    marketplace when you are ready.
                                </p>
                                <Link
                                    href={route('marketplace')}
                                    className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                                >
                                    Explore the collection
                                </Link>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {[
                                    'Genuine leather crafted',
                                    'Side-by-side case comparison',
                                    'Hand-burnished smooth edges',
                                    'Direct marketplace ordering',
                                ].map((bonus) => (
                                    <div key={bonus} className="rounded-[22px] bg-white/70 p-5 backdrop-blur-sm dark:bg-neutral-900/70">
                                        <p className="text-sm font-semibold text-neutral-800 dark:text-white">{bonus}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
