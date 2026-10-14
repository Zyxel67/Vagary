import AdminTabs from '@/components/admin/admin-tabs';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Megaphone, Send, Users } from 'lucide-react';
import { FormEventHandler } from 'react';

type PromoStats = {
    /** Accounts that ticked the opt-in and can actually receive a promo. */
    audience: number;
    total: number;
};

type SentPromo = {
    id: number;
    subject: string;
    recipients: number;
    sent_by: string;
    sent_at: string | null;
};

const sentAt = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Promos',
        href: '/admin/promos',
    },
];

export default function AdminPromos({ stats, recent }: { stats: PromoStats; recent: SentPromo[] }) {
    const { flash } = usePage<SharedData>().props;

    const { data, setData, post, processing, reset, errors } = useForm({
        subject: '',
        message: '',
        url: '',
        cta_label: 'Shop now',
    });

    const fieldErrors = errors as Record<string, string>;
    const coverage = stats.total > 0 ? Math.round((stats.audience / stats.total) * 100) : 0;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('admin.promos.store'), { onSuccess: () => reset() });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Promos" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="space-y-5">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-400">Admin</p>
                        <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">Promos</h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Send a one-off email to every account that opted in to notifications.
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

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">Subscribers</p>
                            <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="mt-3 text-3xl font-black tracking-[-0.05em]">{stats.audience}</p>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Out of {stats.total} accounts</p>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">Coverage</p>
                            <Megaphone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="mt-3 text-3xl font-black tracking-[-0.05em]">{coverage}%</p>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Of accounts that can be emailed</p>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">Default CTA</p>
                            <Send className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="mt-3 truncate text-2xl font-black tracking-[-0.05em]">{data.cta_label || '—'}</p>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Button shown on the email</p>
                    </div>
                </div>

                {stats.audience === 0 && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-300">
                        Nobody has opted in yet. Accounts switch this on from Settings → Notifications, then this becomes their send list.
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <section className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur-xl sm:p-6 dark:border-white/10 dark:bg-neutral-900/80">
                        <header className="mb-5">
                            <h2 className="text-lg font-bold tracking-[-0.02em]">Compose</h2>
                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                Every subscriber gets the same email, sent immediately.
                            </p>
                        </header>

                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={data.subject}
                                    onChange={(event) => setData('subject', event.target.value)}
                                    required
                                    maxLength={120}
                                    placeholder="Weekend restock: your saved cases are back"
                                />
                                <InputError className="mt-1" message={fieldErrors.subject} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="message">Message</Label>
                                <textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(event) => setData('message', event.target.value)}
                                    required
                                    maxLength={2000}
                                    rows={6}
                                    placeholder="We have restocked the cases you were waiting on, plus a few new arrivals."
                                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:outline-none dark:border-white/15 dark:bg-neutral-950 dark:placeholder:text-neutral-500 dark:focus-visible:ring-white"
                                />
                                <InputError className="mt-1" message={fieldErrors.message} />
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="url">Button link (optional)</Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        value={data.url}
                                        onChange={(event) => setData('url', event.target.value)}
                                        className="font-mono text-xs"
                                        placeholder="https://shopee.co.id/..."
                                    />
                                    <InputError className="mt-1" message={fieldErrors.url} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="cta_label">Button label</Label>
                                    <Input
                                        id="cta_label"
                                        value={data.cta_label}
                                        onChange={(event) => setData('cta_label', event.target.value)}
                                        maxLength={60}
                                        placeholder="Shop now"
                                    />
                                    <InputError className="mt-1" message={fieldErrors.cta_label} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-wrap items-center justify-end gap-3 pb-4">
                        <Button type="submit" disabled={processing || stats.audience === 0}>
                            <Send className="h-4 w-4" />
                            {processing ? 'Sending…' : `Send to ${stats.audience} subscriber${stats.audience === 1 ? '' : 's'}`}
                        </Button>
                    </div>
                </form>

                <section className="rounded-2xl border border-black/10 bg-white/85 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80">
                    <header className="border-b border-black/10 px-5 py-4 dark:border-white/10">
                        <h2 className="text-sm font-bold tracking-[-0.02em]">Recently sent</h2>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            Every promo that has gone out, and the audience it reached.
                        </p>
                    </header>

                    {recent.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
                            Nothing sent yet. Your first promo will be listed here.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[560px] text-left text-sm">
                                <thead className="border-b border-black/10 text-[11px] tracking-[0.16em] text-neutral-500 uppercase dark:border-white/10 dark:text-neutral-400">
                                    <tr>
                                        <th scope="col" className="px-5 py-3 font-semibold">
                                            Subject
                                        </th>
                                        <th scope="col" className="px-5 py-3 font-semibold">
                                            Recipients
                                        </th>
                                        <th scope="col" className="px-5 py-3 font-semibold">
                                            Sent by
                                        </th>
                                        <th scope="col" className="px-5 py-3 font-semibold">
                                            Sent
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent.map((promo) => (
                                        <tr key={promo.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                                            <td className="max-w-[24rem] truncate px-5 py-3 font-semibold">{promo.subject}</td>
                                            <td className="px-5 py-3">{promo.recipients}</td>
                                            <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{promo.sent_by}</td>
                                            <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{sentAt(promo.sent_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
