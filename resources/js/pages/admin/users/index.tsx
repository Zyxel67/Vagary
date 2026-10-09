import AdminTabs from '@/components/admin/admin-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Heart, ShieldCheck, ShieldMinus, Trash2, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    is_admin: boolean;
    has_google: boolean;
    saved_count: number;
    created_at: string | null;
};

type UserStats = {
    total: number;
    admins: number;
    google: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
    },
];

export default function AdminUsers({ users, stats }: { users: AdminUser[]; stats: UserStats }) {
    const { flash, auth } = usePage<SharedData>().props;
    const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
    const [deleting, setDeleting] = useState(false);

    const toggleAdmin = (user: AdminUser) => {
        router.put(route('admin.users.update', user.id), { is_admin: !user.is_admin }, { preserveScroll: true });
    };

    const confirmDelete = () => {
        if (!pendingDelete) {
            return;
        }

        setDeleting(true);
        router.delete(route('admin.users.destroy', pendingDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setPendingDelete(null);
            },
        });
    };

    const statCards = [
        { label: 'Accounts', value: String(stats.total), icon: Users },
        { label: 'Admins', value: String(stats.admins), icon: ShieldCheck },
        { label: 'Google sign-in', value: String(stats.google), icon: UserCheck },
        {
            label: 'Shortlisted',
            value: String(users.filter((user) => user.saved_count > 0).length),
            icon: Heart,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="space-y-5">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-400">Admin</p>
                        <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">Accounts</h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Everyone who can sign in, their role, and how many products they have saved.
                        </p>
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
                            <p className="mt-3 text-3xl font-black tracking-[-0.05em]">{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/85 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-left text-sm">
                            <thead className="border-b border-black/10 text-[11px] tracking-[0.16em] text-neutral-500 uppercase dark:border-white/10 dark:text-neutral-400">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-semibold">
                                        Account
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-semibold">
                                        Role
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-semibold">
                                        Sign-in
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-semibold">
                                        Saved
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-right font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => {
                                    const isSelf = user.id === auth.user?.id;

                                    return (
                                        <tr key={user.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-black/10 bg-neutral-100 dark:border-white/10 dark:bg-neutral-800">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-500 dark:text-neutral-400">
                                                                {user.name.slice(0, 1).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold">
                                                            {user.name}
                                                            {isSelf && <span className="ml-2 text-xs font-medium text-neutral-400">you</span>}
                                                        </p>
                                                        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.is_admin ? (
                                                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">Admin</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Customer</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                                                {user.has_google ? 'Google' : 'Email'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.saved_count > 0 ? (
                                                    <Link
                                                        href={route('admin.wishlists.index')}
                                                        prefetch
                                                        className="font-semibold underline underline-offset-4"
                                                    >
                                                        {user.saved_count}
                                                    </Link>
                                                ) : (
                                                    <span className="text-neutral-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isSelf}
                                                        onClick={() => toggleAdmin(user)}
                                                    >
                                                        {user.is_admin ? <ShieldMinus className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                                        {user.is_admin ? 'Revoke' : 'Promote'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                                                        disabled={isSelf}
                                                        onClick={() => setPendingDelete(user)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-14 text-center">
                                            <p className="text-base font-semibold">No accounts yet</p>
                                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">New sign-ups will show up here.</p>
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
                        <DialogTitle>Delete account</DialogTitle>
                        <DialogDescription>
                            {pendingDelete ? `Remove "${pendingDelete.name}" and their shortlist? This cannot be undone.` : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button type="button" variant="outline" onClick={() => setPendingDelete(null)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleting}>
                            {deleting ? 'Deleting…' : 'Delete account'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
