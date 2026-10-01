import { InteractiveLeatherCanvas, TEXTURE_MODES, type LeatherTextureMode } from '@/components/interactive-leather-canvas';
import { ChevronDown, Layers, Pause, Play, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

/** localStorage keys that remember how a visitor last left the leather studio. */
const STORAGE_KEYS = {
    texture: 'vagary:backdrop:texture',
    lustre: 'vagary:backdrop:lustre',
    motion: 'vagary:backdrop:motion',
    dock: 'vagary:backdrop:dock',
} as const;

const TEXTURE_LABELS: Record<LeatherTextureMode, string> = {
    grain: 'Raw vegetable-tanned grain',
    patina: 'Aged verdigris patina',
    suede: 'Soft brushed suede',
};

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

const isTextureMode = (value: unknown): value is LeatherTextureMode => typeof value === 'string' && (TEXTURE_MODES as string[]).includes(value);

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Read a persisted studio preference, falling back safely when storage is unavailable. */
function readStored<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
    if (typeof window === 'undefined') return fallback;

    try {
        const raw = window.localStorage.getItem(key);
        if (raw === null) return fallback;

        const parsed: unknown = JSON.parse(raw);
        return isValid(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}

/** Write a studio preference without letting a locked-down storage API break the app. */
function writeStored(key: string, value: unknown) {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* private mode can reject writes; the studio keeps working in-memory */
    }
}

/**
 * Living leather background rendered once for the whole app.
 *
 * The reactive canvas used to live inside a single dashboard hero. It now sits behind
 * every page as a fixed layer, tracking the pointer across the window so the artisan
 * stitching, folds and fibre marks answer the cursor wherever the visitor is.
 *
 * The floating "Leather Studio" dock lets a visitor tune that surface (texture, lustre and
 * motion). Every preference persists in localStorage, so the studio behaves like a real
 * setting instead of a one-off demo control.
 */
export function VagaryLeatherBackdrop() {
    const [textureMode, setTextureMode] = useState<LeatherTextureMode>(() => readStored(STORAGE_KEYS.texture, 'grain', isTextureMode));
    const [lustre, setLustre] = useState(() => readStored(STORAGE_KEYS.lustre, false, isBoolean));
    // Visitors who ask their browser for less motion land on a still surface by default.
    const [motion, setMotion] = useState(() => readStored(STORAGE_KEYS.motion, !prefersReducedMotion(), isBoolean));
    const [dockOpen, setDockOpen] = useState(() => readStored(STORAGE_KEYS.dock, true, isBoolean));

    useEffect(() => writeStored(STORAGE_KEYS.texture, textureMode), [textureMode]);
    useEffect(() => writeStored(STORAGE_KEYS.lustre, lustre), [lustre]);
    useEffect(() => writeStored(STORAGE_KEYS.motion, motion), [motion]);
    useEffect(() => writeStored(STORAGE_KEYS.dock, dockOpen), [dockOpen]);

    return (
        <>
            {/* Fixed reactive background layer (page content scrolls above it) */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#e6dfd0] transition-colors duration-500 dark:bg-[#0b0a09]"
            >
                <InteractiveLeatherCanvas
                    variant="ambient"
                    pointerSource="window"
                    interactive={false}
                    paused={!motion}
                    textureMode={textureMode}
                    lustre={lustre}
                    className="h-full w-full"
                />

                {/* Warm studio light spilling from the top edge of the viewport */}
                <div className="absolute inset-x-0 top-0 h-[48vh] bg-gradient-to-b from-white/30 via-white/5 to-transparent dark:from-white/[0.035] dark:via-transparent" />

                {/* Fine leather grain so the surface never reads as flat digital glass */}
                <div className="leather-grain absolute inset-0 opacity-[0.24] mix-blend-multiply dark:opacity-[0.07] dark:mix-blend-screen" />

                {/* Depth vignette that keeps attention on the content column */}
                <div className="absolute inset-0 bg-[radial-gradient(125%_95%_at_50%_0%,transparent_28%,rgba(45,33,22,0.30)_100%)] dark:bg-[radial-gradient(125%_95%_at_50%_0%,transparent_24%,rgba(0,0,0,0.88)_100%)]" />
            </div>

            {/* Leather studio dock: surface controls that follow the visitor everywhere */}
            <div className="pointer-events-none fixed right-4 bottom-4 z-30 flex flex-col items-end gap-2 sm:right-6 sm:bottom-6">
                {dockOpen ? (
                    <div
                        role="group"
                        aria-label="Leather studio"
                        className="pointer-events-auto flex items-center gap-1 rounded-full border border-black/10 bg-white/85 p-1.5 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.5)] backdrop-blur-xl dark:border-white/15 dark:bg-neutral-900/80 dark:shadow-[0_18px_45px_-16px_rgba(0,0,0,0.85)]"
                    >
                        <span className="hidden items-center gap-2 pr-1 pl-2 text-[10px] font-semibold tracking-[0.26em] text-neutral-500 uppercase select-none sm:flex dark:text-neutral-400">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500/70" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                            </span>
                            Studio
                        </span>

                        <button
                            type="button"
                            onClick={() => setMotion((prev) => !prev)}
                            aria-pressed={motion}
                            title={motion ? 'Freeze the animated leather surface' : 'Resume the animated leather surface'}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold tracking-wider uppercase transition ${
                                motion
                                    ? 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white'
                                    : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                            }`}
                        >
                            {motion ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                            <span className="hidden sm:inline">{motion ? 'Motion' : 'Paused'}</span>
                        </button>

                        <span className="h-6 w-px bg-black/10 dark:bg-white/15" aria-hidden="true" />

                        <button
                            type="button"
                            onClick={() => setLustre((prev) => !prev)}
                            aria-pressed={lustre}
                            title="Toggle the artisanal leather lustre sweep"
                            className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold tracking-wider uppercase transition ${
                                lustre
                                    ? 'bg-amber-600 text-white shadow-sm dark:bg-amber-500 dark:text-neutral-950'
                                    : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white'
                            }`}
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Lustre</span>
                        </button>

                        <span className="hidden h-6 w-px bg-black/10 sm:block dark:bg-white/15" aria-hidden="true" />

                        <div role="group" aria-label="Leather texture" className="hidden items-center gap-0.5 sm:flex">
                            {TEXTURE_MODES.map((mode) => {
                                const active = textureMode === mode;

                                return (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setTextureMode(mode)}
                                        aria-pressed={active}
                                        title={TEXTURE_LABELS[mode]}
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[0.14em] uppercase transition ${
                                            active
                                                ? 'bg-amber-500/15 font-bold text-amber-700 dark:bg-amber-400/20 dark:text-amber-300'
                                                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                                        }`}
                                    >
                                        {mode}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => setDockOpen(false)}
                            title="Hide the leather studio"
                            aria-label="Hide the leather studio"
                            className="ml-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setDockOpen(true)}
                        title="Open the leather studio"
                        aria-label="Open the leather studio"
                        className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/85 text-neutral-700 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.5)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:text-neutral-950 dark:border-white/15 dark:bg-neutral-900/80 dark:text-neutral-300 dark:hover:text-white"
                    >
                        <Layers className="h-5 w-5" />
                    </button>
                )}
            </div>
        </>
    );
}
