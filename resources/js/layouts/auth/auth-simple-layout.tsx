import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="min-h-svh px-4 py-6 text-neutral-900 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_30px_80px_rgba(15,15,15,0.12)] lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="relative hidden overflow-hidden bg-neutral-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_rgba(0,0,0,0)_35%)]" />
                        <div className="absolute top-20 -left-16 h-56 w-56 rounded-full bg-orange-500/25 blur-3xl" />
                        <div className="absolute right-10 bottom-10 h-64 w-64 rounded-full bg-red-500/20 blur-3xl" />

                        <div className="relative z-10 flex items-center justify-between">
                            <Link href={route('home')} className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-neutral-950">
                                    V
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold tracking-[0.32em] text-neutral-300 uppercase">Vagary</p>
                                    <p className="text-sm font-semibold">Leather Atelier</p>
                                </div>
                            </Link>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold tracking-[0.24em] text-neutral-200 uppercase">
                                New drop
                            </span>
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="space-y-3">
                                <p className="text-xs font-semibold tracking-[0.28em] text-neutral-300 uppercase">Artisanal Leather</p>
                                <h2 className="max-w-sm text-4xl font-black tracking-[-0.08em] uppercase">
                                    Find your leather.
                                    <span className="block text-neutral-300">Choose what fits.</span>
                                </h2>
                            </div>

                            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                                <img
                                    src="/images/case/Argus%20G3/IMG-20250708-WA0001.jpg"
                                    alt="Vagary Leather Case"
                                    className="h-64 w-full rounded-[18px] object-cover"
                                />
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                            <div>
                                <p className="text-xs tracking-[0.26em] text-neutral-300 uppercase">Sign up today</p>
                                <p className="mt-2 text-xl font-semibold">Explore new releases</p>
                            </div>
                            <div className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-neutral-950">LEATHER</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 sm:p-8 lg:p-10">
                        <div className="mb-8 flex items-center justify-between">
                            <Link href={route('home')} className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-950 text-white">
                                    <AppLogoIcon className="h-4 w-4 fill-current text-white" />
                                </div>
                                Vagary
                            </Link>
                            <Link href={route('home')} className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900">
                                Back home
                            </Link>
                        </div>

                        <div className="space-y-2 text-left">
                            <h1 className="text-3xl font-black tracking-[-0.06em] text-neutral-950">{title}</h1>
                            <p className="text-sm text-neutral-600">{description}</p>
                        </div>

                        <div className="mt-8">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
