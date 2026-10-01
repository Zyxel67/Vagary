import React, { useEffect, useRef, useState } from 'react';

export type LeatherTextureMode = 'grain' | 'patina' | 'suede';

export const TEXTURE_MODES: LeatherTextureMode[] = ['grain', 'patina', 'suede'];

interface LeatherPalette {
    /** rgb triple used for the supple leather fold contours */
    contour: string;
    /** rgb triple used for the saddle stitch thread */
    stitch: string;
    /** rgb triple used for the stitch perforation dots */
    perforation: string;
    /** rgb triple used for the artisan loupe spotlight */
    glow: string;
    /** floating leather fibre marks */
    marks: string[];
}

/**
 * Every texture mode keeps the same artisan drawing language but shifts the palette:
 * raw grain (amber brass), aged patina (verdigris) and soft suede (neutral stone).
 */
const LEATHER_PALETTES: Record<LeatherTextureMode, { light: LeatherPalette; dark: LeatherPalette }> = {
    grain: {
        light: {
            contour: '180, 83, 9',
            stitch: '180, 83, 9',
            perforation: '0, 0, 0',
            glow: '217, 119, 6',
            marks: ['#d97706', '#b45309', '#92400e', '#78350f', '#f59e0b', '#fbbf24', '#c2410c', '#d4d4d4'],
        },
        dark: {
            contour: '217, 119, 6',
            stitch: '245, 158, 11',
            perforation: '255, 255, 255',
            glow: '251, 191, 36',
            marks: ['#f59e0b', '#fbbf24', '#d97706', '#b45309', '#fcd34d', '#fb923c', '#fde68a', '#e2e8f0'],
        },
    },
    patina: {
        light: {
            contour: '15, 118, 110',
            stitch: '13, 148, 136',
            perforation: '0, 0, 0',
            glow: '13, 148, 136',
            marks: ['#0f766e', '#115e59', '#0d9488', '#14b8a6', '#0e7490', '#155e75', '#0891b2', '#cbd5e1'],
        },
        dark: {
            contour: '45, 212, 191',
            stitch: '94, 234, 212',
            perforation: '255, 255, 255',
            glow: '45, 212, 191',
            marks: ['#2dd4bf', '#5eead4', '#14b8a6', '#22d3ee', '#38bdf8', '#99f6e4', '#a5f3fc', '#e2e8f0'],
        },
    },
    suede: {
        light: {
            contour: '87, 83, 78',
            stitch: '120, 113, 108',
            perforation: '0, 0, 0',
            glow: '168, 162, 158',
            marks: ['#78716c', '#a8a29e', '#57534e', '#d6d3d1', '#a8a29e', '#e7e5e4', '#44403c', '#bfbfbf'],
        },
        dark: {
            contour: '168, 162, 158',
            stitch: '214, 211, 209',
            perforation: '0, 0, 0',
            glow: '231, 229, 228',
            marks: ['#d6d3d1', '#e7e5e4', '#a8a29e', '#f5f5f4', '#a1a1aa', '#c4c4c4', '#8f8f8f', '#fafaf9'],
        },
    },
};

interface InteractiveLeatherCanvasProps {
    className?: string;
    /** Render the leather studio HUD inside the canvas. */
    interactive?: boolean;
    /** Freeze the animated field while keeping the last painted frame on screen. */
    paused?: boolean;
    /** Controlled texture palette. Omit to let the canvas keep its own state. */
    textureMode?: LeatherTextureMode;
    onTextureModeChange?: (mode: LeatherTextureMode) => void;
    /** Controlled lustre highlight. Omit to let the canvas keep its own state. */
    lustre?: boolean;
    onLustreChange?: (active: boolean) => void;
    /** Where pointer movement is observed from; `window` suits full page backdrops. */
    pointerSource?: 'container' | 'window';
    /** `ambient` renders a softer, more spacious field suited to a global background. */
    variant?: 'studio' | 'ambient';
    /** Positioning classes for the HUD pill. */
    hudClassName?: string;
}

export function InteractiveLeatherCanvas({
    className = '',
    interactive = true,
    textureMode: textureModeProp,
    onTextureModeChange,
    lustre: lustreProp,
    onLustreChange,
    pointerSource = 'container',
    variant = 'studio',
    paused = false,
    hudClassName = 'top-4 right-4 sm:top-6 sm:right-6',
}: InteractiveLeatherCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const dprRef = useRef(1);

    const isAmbient = variant === 'ambient';

    // Leather Studio state, used directly while the props stay uncontrolled.
    const [internalTextureMode, setInternalTextureMode] = useState<LeatherTextureMode>('grain');
    const [internalLustre, setInternalLustre] = useState(false);

    const textureMode = textureModeProp ?? internalTextureMode;
    const isLustreActive = lustreProp ?? internalLustre;

    const handleTextureModeChange = (mode: LeatherTextureMode) => {
        if (textureModeProp === undefined) {
            setInternalTextureMode(mode);
        }
        onTextureModeChange?.(mode);
    };

    const handleLustreToggle = () => {
        const next = !isLustreActive;
        if (lustreProp === undefined) {
            setInternalLustre(next);
        }
        onLustreChange?.(next);
    };

    // Mouse / Pointer state
    const mouseRef = useRef({
        x: -1000,
        y: -1000,
        targetX: -1000,
        targetY: -1000,
        radius: 200,
        isHovered: false,
        down: false,
    });

    // Mirror the interactive state into refs so switching texture or lustre repaints the
    // existing field instantly instead of rebuilding every stitch and fibre mark.
    const textureModeRef = useRef(textureMode);
    const lustreRef = useRef(isLustreActive);
    const pausedRef = useRef(paused);
    const reducedMotionRef = useRef(false);

    useEffect(() => {
        textureModeRef.current = textureMode;
        lustreRef.current = isLustreActive;
    }, [textureMode, isLustreActive]);

    useEffect(() => {
        pausedRef.current = paused;
    }, [paused]);

    // Honour the visitor's motion preference: autonomous drift and breathing settle down
    // while the pointer spotlight keeps answering the cursor, so the surface never dies.
    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const syncPreference = () => {
            reducedMotionRef.current = query.matches;
        };

        syncPreference();
        query.addEventListener('change', syncPreference);

        return () => query.removeEventListener('change', syncPreference);
    }, []);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Cap the pixel ratio so a full page backdrop stays smooth on high density screens.
        const dpr = Math.min(window.devicePixelRatio || 1, isAmbient ? 1.5 : 2);
        dprRef.current = dpr;

        let width = 1200;
        let height = 700;

        const syncSize = () => {
            width = canvas.width = Math.max(1, Math.round((canvas.offsetWidth || 1200) * dpr));
            height = canvas.height = Math.max(1, Math.round((canvas.offsetHeight || 700) * dpr));
        };

        syncSize();

        mouseRef.current.radius = isAmbient ? 280 : 200;

        // Field density: the ambient variant spreads a calmer, more spacious field over the
        // whole viewport so the background reads as artisan leather rather than a busy screen.
        const cols = isAmbient ? 20 : 26;
        const rows = isAmbient ? 14 : 14;
        const markCount = isAmbient ? 26 : 48;
        const contourCount = isAmbient ? 4 : 3;

        // Leather Stitch Nodes (Diamond lattice matrix of artisan saddle stitches)
        type StitchPoint = {
            baseX: number;
            baseY: number;
            x: number;
            y: number;
            vx: number;
            vy: number;
            angle: number;
            tension: number;
        };

        type LeatherMark = {
            x: number;
            y: number;
            vx: number;
            vy: number;
            length: number;
            angle: number;
            rotSpeed: number;
            colorIndex: number;
            alpha: number;
            width: number;
        };

        let stitches: StitchPoint[] = [];
        let leatherMarks: LeatherMark[] = [];

        const buildField = () => {
            stitches = [];

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    // Staggered diamond stitch layout
                    const offsetX = (r % 2) * (width / (cols - 1) / 2);
                    const bx = (c / (cols - 1)) * width + offsetX;
                    const by = (r / (rows - 1)) * height;
                    stitches.push({
                        baseX: bx,
                        baseY: by,
                        x: bx,
                        y: by,
                        vx: 0,
                        vy: 0,
                        angle: (c + r) % 2 === 0 ? 0.35 : -0.35,
                        tension: 0.8 + Math.random() * 0.4,
                    });
                }
            }

            // Floating leather artisan marks / hand-crafted edge dashes (artisan thread marks)
            leatherMarks = Array.from({ length: markCount }, (_, i) => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                length: 14 + Math.random() * 22,
                angle: (Math.random() * 60 - 30) * (Math.PI / 180),
                rotSpeed: (Math.random() - 0.5) * 0.015,
                colorIndex: i % 8,
                alpha: (isAmbient ? 0.16 : 0.28) + Math.random() * (isAmbient ? 0.26 : 0.45),
                width: 2.2 + (i % 2) * 1.2,
            }));
        };

        buildField();

        const handleResize = () => {
            syncSize();
            buildField();
        };

        window.addEventListener('resize', handleResize);

        let time = 0;
        let hasPainted = false;
        let paintedSignature = '';

        // A paused field still needs one still frame on screen, and it should refresh when the
        // palette, theme or canvas size changes — but nothing else should wake the renderer.
        const fieldSignature = () =>
            `${textureModeRef.current}|${lustreRef.current}|${width}x${height}|${document.documentElement.classList.contains('dark')}`;

        const render = () => {
            const signature = fieldSignature();
            const needsRepaint = !hasPainted || signature !== paintedSignature;

            if (pausedRef.current && !needsRepaint) {
                animationFrameRef.current = requestAnimationFrame(render);
                return;
            }

            const motion = pausedRef.current || reducedMotionRef.current ? 0 : 1;
            time += 0.015 * motion;

            // Ease mouse position
            const m = mouseRef.current;
            m.x += (m.targetX - m.x) * 0.08;
            m.y += (m.targetY - m.y) * 0.08;

            ctx.clearRect(0, 0, width, height);

            const isDark = document.documentElement.classList.contains('dark');
            const palette = LEATHER_PALETTES[textureModeRef.current][isDark ? 'dark' : 'light'];
            const lustreActive = lustreRef.current;
            const fieldAlpha = isAmbient ? 0.55 : 1;

            // 1. Organic Hand-crafted Contour Curves (Simulating supple leather folds & patina contours)
            for (let c = 0; c < contourCount; c++) {
                ctx.beginPath();
                const centerY = isAmbient
                    ? height * (0.14 + (c / Math.max(1, contourCount - 1)) * 0.72) + Math.sin(time * 0.6 + c * 1.7) * 30
                    : height * 0.5 + Math.sin(time * 0.8 + c * 2) * 25;
                const freq = 0.0018 + c * 0.0006;
                const amp = 30 + c * 16;

                for (let x = 0; x <= width; x += 14) {
                    let dy = Math.sin(x * freq + time * 1.2 + c * 1.8) * amp;
                    const dMouse = Math.hypot(x - m.x, centerY - m.y);
                    if (dMouse < m.radius * 2) {
                        const factor = Math.cos((dMouse / (m.radius * 2)) * (Math.PI / 2));
                        dy += Math.sin(time * 6 + x * 0.04) * 28 * factor;
                    }
                    if (x === 0) {
                        ctx.moveTo(x, centerY + dy);
                    } else {
                        ctx.lineTo(x, centerY + dy);
                    }
                }

                ctx.strokeStyle = `rgba(${palette.contour}, ${(0.08 + c * 0.035) * fieldAlpha})`;
                ctx.lineWidth = 1.6 + c * 0.5;
                ctx.stroke();
            }

            // 2. Interactive Saddle Stitch Grid
            for (let i = 0; i < stitches.length; i++) {
                const s = stitches[i];

                // Gentle natural breathing
                const breath = Math.sin(time * 1.4 + (s.baseX + s.baseY) * 0.005) * 4;
                const targetX = s.baseX;
                const targetY = s.baseY + breath;

                // Mouse deflection
                const dx = m.x - s.x;
                const dy = m.y - s.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = m.radius * (m.down ? 1.5 : 1.1);

                if (dist < maxDist && dist > 0) {
                    const force = (1 - dist / maxDist) * (m.down ? -35 : 22);
                    const angle = Math.atan2(dy, dx);
                    s.vx -= Math.cos(angle) * force * 0.12;
                    s.vy -= Math.sin(angle) * force * 0.12;
                }

                // Elastic rebound
                s.vx += (targetX - s.x) * 0.06;
                s.vy += (targetY - s.y) * 0.06;
                s.vx *= 0.85;
                s.vy *= 0.85;

                s.x += s.vx;
                s.y += s.vy;

                // Draw stitch mark
                const stitchLength = 10;
                const distToMouse = Math.hypot(s.x - m.x, s.y - m.y);
                const isClose = distToMouse < m.radius;
                const glow = isClose ? 1 - distToMouse / m.radius : 0;

                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(s.angle + (isClose ? (m.x - s.x) * 0.001 : 0));

                ctx.lineWidth = 1.8;
                ctx.lineCap = 'round';
                ctx.strokeStyle = `rgba(${palette.stitch}, ${(0.12 + glow * 0.55) * fieldAlpha})`;

                ctx.beginPath();
                ctx.moveTo(-stitchLength / 2, 0);
                ctx.lineTo(stitchLength / 2, 0);
                ctx.stroke();

                // Stitch perforation hole dots on both sides
                ctx.fillStyle = `rgba(${palette.perforation}, ${(0.08 + glow * 0.3) * fieldAlpha})`;
                ctx.beginPath();
                ctx.arc(-stitchLength / 2, 0, 1.2, 0, Math.PI * 2);
                ctx.arc(stitchLength / 2, 0, 1.2, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }

            // 3. Tactile Artisan Leather Fibers & Marks
            for (let i = 0; i < leatherMarks.length; i++) {
                const b = leatherMarks[i];

                b.x += b.vx * (lustreActive ? 1.6 : 1) * motion;
                b.y += b.vy * (lustreActive ? 1.6 : 1) * motion;
                b.angle += b.rotSpeed * motion;

                const dx = m.x - b.x;
                const dy = m.y - b.y;
                const dist = Math.hypot(dx, dy);

                if (dist < m.radius) {
                    const pushFactor = (1 - dist / m.radius) * 2.8;
                    const angle = Math.atan2(dy, dx);
                    b.x -= Math.cos(angle) * pushFactor;
                    b.y -= Math.sin(angle) * pushFactor;
                    b.angle += 0.03;
                }

                // Wrap boundaries
                if (b.x < -30) b.x = width + 30;
                if (b.x > width + 30) b.x = -30;
                if (b.y < -30) b.y = height + 30;
                if (b.y > height + 30) b.y = -30;

                ctx.save();
                ctx.translate(b.x, b.y);
                ctx.rotate(b.angle);

                const currentLength = b.length * (lustreActive ? 1.25 : 1);
                const currentAlpha = Math.min(0.9, b.alpha * (dist < m.radius ? 1.8 : 1) * fieldAlpha);

                ctx.strokeStyle = palette.marks[b.colorIndex];
                ctx.globalAlpha = currentAlpha;
                ctx.lineWidth = b.width;
                ctx.lineCap = 'round';

                ctx.beginPath();
                ctx.moveTo(-currentLength / 2, 0);
                ctx.lineTo(currentLength / 2, 0);
                ctx.stroke();

                // Highlight brass rivet or center accent
                if (lustreActive || dist < m.radius * 0.7) {
                    ctx.fillStyle = lustreActive ? '#fbbf24' : palette.marks[b.colorIndex];
                    ctx.beginPath();
                    ctx.arc(0, 0, 1.6, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }

            // 4. Artisan Loupe Spotlight / Leather Lustre
            if (m.isHovered && m.x > 0 && m.y > 0) {
                const gradient = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius * 1.35);
                if (isDark) {
                    gradient.addColorStop(0, `rgba(${palette.glow}, ${0.08 * fieldAlpha})`);
                    gradient.addColorStop(0.5, `rgba(${palette.contour}, ${0.03 * fieldAlpha})`);
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                } else {
                    gradient.addColorStop(0, `rgba(${palette.glow}, ${0.06 * fieldAlpha})`);
                    gradient.addColorStop(0.5, `rgba(${palette.contour}, ${0.02 * fieldAlpha})`);
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                }
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.radius * 1.35, 0, Math.PI * 2);
                ctx.fill();
            }

            hasPainted = true;
            paintedSignature = signature;

            animationFrameRef.current = requestAnimationFrame(render);
        };

        animationFrameRef.current = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isAmbient]);

    const updatePointerFromEvent = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const dpr = dprRef.current || 1;
        mouseRef.current.targetX = (clientX - rect.left) * dpr;
        mouseRef.current.targetY = (clientY - rect.top) * dpr;
        mouseRef.current.isHovered = true;
    };

    const clearPointer = () => {
        mouseRef.current.isHovered = false;
        mouseRef.current.targetX = -1000;
        mouseRef.current.targetY = -1000;
    };

    // Full page backdrops sit behind the content, so they observe the window instead of their own box.
    useEffect(() => {
        if (pointerSource !== 'window') return;

        const handleMove = (event: PointerEvent) => updatePointerFromEvent(event.clientX, event.clientY);
        const handleDown = () => {
            mouseRef.current.down = true;
        };
        const handleUp = () => {
            mouseRef.current.down = false;
        };

        window.addEventListener('pointermove', handleMove, { passive: true });
        window.addEventListener('pointerdown', handleDown, { passive: true });
        window.addEventListener('pointerup', handleUp, { passive: true });
        window.addEventListener('pointercancel', handleUp, { passive: true });
        window.addEventListener('blur', clearPointer);
        document.addEventListener('mouseleave', clearPointer);

        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerdown', handleDown);
            window.removeEventListener('pointerup', handleUp);
            window.removeEventListener('pointercancel', handleUp);
            window.removeEventListener('blur', clearPointer);
            document.removeEventListener('mouseleave', clearPointer);
        };
    }, [pointerSource]);

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (pointerSource !== 'container') return;
        updatePointerFromEvent(event.clientX, event.clientY);
    };

    const handlePointerLeave = () => {
        if (pointerSource !== 'container') return;
        clearPointer();
    };

    const handlePointerDown = () => {
        if (pointerSource !== 'container') return;
        mouseRef.current.down = true;
    };

    const handlePointerUp = () => {
        if (pointerSource !== 'container') return;
        mouseRef.current.down = false;
    };

    return (
        <div
            ref={containerRef}
            className={`relative h-full w-full overflow-hidden select-none ${isAmbient ? 'pointer-events-none' : 'pointer-events-auto'} ${className}`}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
        >
            <canvas
                ref={canvasRef}
                className={`absolute inset-0 block h-full w-full touch-none ${isAmbient ? 'cursor-default' : 'cursor-crosshair'}`}
            />

            {/* Leather Craft HUD Controls */}
            {interactive && (
                <div
                    className={`absolute z-20 flex items-center gap-2 rounded-full border border-black/10 bg-white/85 p-1.5 shadow-sm backdrop-blur-md transition-all hover:border-black/20 dark:border-white/15 dark:bg-neutral-900/85 dark:hover:border-white/30 ${hudClassName}`}
                >
                    <button
                        type="button"
                        onClick={handleLustreToggle}
                        title="Toggle artisanal leather lustre"
                        className={`group flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition ${
                            isLustreActive
                                ? 'bg-amber-600 text-white shadow dark:bg-amber-500 dark:text-neutral-950'
                                : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <span className="relative flex h-2 w-2">
                            {isLustreActive && (
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                            )}
                            <span
                                className={`relative inline-flex h-2 w-2 rounded-full ${
                                    isLustreActive ? 'bg-amber-400' : 'bg-neutral-400 dark:bg-neutral-600'
                                }`}
                            />
                        </span>
                        <span>{isLustreActive ? 'Lustre On' : 'Lustre'}</span>
                    </button>

                    <div className="hidden items-center gap-1 border-l border-black/10 pl-2 md:flex dark:border-white/15">
                        {TEXTURE_MODES.map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => handleTextureModeChange(mode)}
                                className={`rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase transition ${
                                    textureMode === mode
                                        ? 'bg-amber-500/15 font-bold text-amber-700 dark:bg-amber-400/20 dark:text-amber-300'
                                        : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
