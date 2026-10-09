import AdminTabs from '@/components/admin/admin-tabs';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { formatPrice } from '@/lib/products';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { CheckCircle2, Heart, Package, TrendingUp, Users } from 'lucide-react';

type WishlistProduct = {
    id: number;
    name: string;
    price: number;
    image: string;
};

type WishlistAccount = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    saved_count: number;
    products: WishlistProduct[];
};

type WishlistStats = {
    saved: number;
    accounts: number;
    topProduct: string | null;
    topProductCount: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Wishlists',
        href: '/admin/wishlists',
    },
];

export default function AdminWishlists({ accounts, stats }: { accounts: WishlistAccount[]; stats: WishlistStats }) {
    const { flash } = usePage<SharedData>().props;

    const statCards = [
        { label: 'Saved items', value: String(stats.saved), icon: Heart },
        { label: 'Active accounts', value: String(stats.accounts), icon: Users },
        {
            label: 'Products saved',
            value: String(accounts.reduce((total, account) => total + account.products.length, 0)),
            icon: Package,
        },
        {
            label: 'Most saved',
            value: stats.topProduct ? `${stats.topProduct} (${stats.topProductCount})` : '—',
            icon: TrendingUp,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wishlists" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="space-y-5">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-400">Admin</p>
                        <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">Wishlists</h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Every signed-in account's shortlist, grouped by buyer.</p>
                    </div>

                    <AdminTabs />
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
                            <p className="mt-3 truncate text-2xl font-black tracking-[-0.05em]">{card.value}</p>
                        </div>
                    ))}
                </div>

                {accounts.length === 0 ? (
                    <div className="rounded-2xl border border-black/10 bg-white/85 p-14 text-center shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80">
                        <Heart className="mx-auto h-8 w-8 text-neutral-400" />
                        <p className="mt-4 text-base font-semibold">No saved items yet</p>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            When a signed-in buyer saves a product it will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {accounts.map((account) => (
                            <section
                                key={account.id}
                                className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80"
                            >
                                <header className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-black/10 bg-neutral-100 dark:border-white/10 dark:bg-neutral-800">
                                            {account.avatar ? (
                                                <img src={account.avatar} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-neutral-500 dark:text-neutral-400">
                                                    {account.name.slice(0, 1).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold">{account.name}</p>
                                            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{account.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">{account.saved_count} saved</Badge>
                                </header>

                                <ul className="mt-4 space-y-3">
                                    {account.products.map((product) => (
                                        <li key={product.id} className="flex items-center gap-3">
                                            <img
                                                src={product.image}
                                                alt=""
                                                className="h-10 w-10 shrink-0 rounded-lg border border-black/10 object-cover dark:border-white/10"
                                            />
                                            <span className="min-w-0 flex-1 truncate text-sm font-medium">{product.name}</span>
                                            <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                                                {formatPrice(product.price)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
