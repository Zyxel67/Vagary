import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { BellRing, CheckCircle2 } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notification settings',
        href: '/settings/notifications',
    },
];

const emailTypes = [
    {
        title: 'Restock alerts',
        detail: 'When something you saved to your wishlist is available again.',
    },
    {
        title: 'Price drops',
        detail: 'When the price of something you saved comes down.',
    },
    {
        title: 'Promos and offers',
        detail: 'Occasional store news, discounts and new arrivals.',
    },
];

export default function Notifications() {
    const { auth, flash } = usePage<SharedData>().props;

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        email_opt_in: Boolean(auth.user.email_opt_in),
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        patch(route('notifications.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notification settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Email notifications" description="Choose whether we email you about the things you save" />

                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <section className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80">
                            <label htmlFor="email_opt_in" className="flex cursor-pointer items-start gap-3">
                                <Checkbox
                                    id="email_opt_in"
                                    checked={data.email_opt_in}
                                    onCheckedChange={(checked) => setData('email_opt_in', checked === true)}
                                    className="mt-0.5"
                                />
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold">Send me email notifications</span>
                                    <span className="mt-1 block text-sm text-neutral-600 dark:text-neutral-400">
                                        Off by default. Nothing is sent to you until you turn this on.
                                    </span>
                                </span>
                            </label>

                            <InputError className="mt-2" message={errors.email_opt_in} />
                        </section>

                        <section className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80">
                            <header className="mb-4 flex items-center gap-2">
                                <BellRing className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <h2 className="text-sm font-bold tracking-[-0.02em]">What you would receive</h2>
                            </header>

                            <ul className="space-y-3">
                                {emailTypes.map((type) => (
                                    <li key={type.title} className="border-b border-black/5 pb-3 last:border-0 last:pb-0 dark:border-white/5">
                                        <p className="text-sm font-semibold">{type.title}</p>
                                        <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">{type.detail}</p>
                                    </li>
                                ))}
                            </ul>

                            <p className="mt-4 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                                Restock and price alerts only cover items you saved to your wishlist, so turning this on is what makes those alerts
                                possible at all.
                            </p>
                        </section>

                        <div className="flex flex-wrap items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                Save preferences
                            </Button>

                            {recentlySuccessful && (
                                <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Saved
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
