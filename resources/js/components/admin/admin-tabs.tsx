import { Link, usePage } from '@inertiajs/react';
import { Heart, Megaphone, Package, Users, type LucideIcon } from 'lucide-react';

type AdminTab = {
    title: string;
    href: string;
    icon: LucideIcon;
};

/**
 * Shared tab bar for the admin panel. Each tab is a real route so it stays
 * deep-linkable, which also lets the sidebar highlight the right item.
 */
export const adminTabs: AdminTab[] = [
    { title: 'Products', href: '/admin/products', icon: Package },
    { title: 'Wishlists', href: '/admin/wishlists', icon: Heart },
    { title: 'Promos', href: '/admin/promos', icon: Megaphone },
    { title: 'Users', href: '/admin/users', icon: Users },
];

export default function AdminTabs() {
    const { url } = usePage();

    return (
        <nav aria-label="Admin sections" className="flex flex-wrap gap-2">
            {adminTabs.map((tab) => {
                const isActive = url === tab.href || url.startsWith(`${tab.href}/`);

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        prefetch
                        aria-current={isActive ? 'page' : undefined}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                            isActive
                                ? 'border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950'
                                : 'border-black/10 bg-white/70 text-neutral-600 hover:border-neutral-950 hover:text-neutral-950 dark:border-white/15 dark:bg-neutral-900/70 dark:text-neutral-300 dark:hover:border-white/40 dark:hover:text-white'
                        }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.title}
                    </Link>
                );
            })}
        </nav>
    );
}
