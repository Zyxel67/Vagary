import React, { useEffect, useRef, useState } from 'react';

interface InteractiveAudioVisualizerProps {
    className?: string;
    interactive?: boolean;
}

export function InteractiveAudioVisualizer({ className = '', interactive = true }: InteractiveAudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Audio synthesis / reactive simulation state
    const [isPlaying, setIsPlaying] = useState(false);
    const [frequencyBand, setFrequencyBand] = useState<'deep' | 'balanced' | 'crisp'>('balanced');
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    // Mouse / Pointer state
    const mouseRef = useRef({
        x: -1000,
        y: -1000,
        targetX: -1000,
        targetY: -1000,
        radius: 180,
        isHovered: false,
        down: false,
    });

    // Sound toggle helper
    const toggleAcousticPulse = () => {
        try {
            if (!audioContextRef.current) {
                const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                audioContextRef.current = new AudioCtx();
            }

            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            if (isPlaying) {
                if (gainNodeRef.current && audioContextRef.current) {
                    gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.08);
                    setTimeout(() => {
                        oscillatorRef.current?.stop();
                        oscillatorRef.current?.disconnect();
                        oscillatorRef.current = null;
                        setIsPlaying(false);
                    }, 120);
                } else {
                    setIsPlaying(false);
                }
            } else {
                const ctx = audioContextRef.current;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                const freq = frequencyBand === 'deep' ? 74 : frequencyBand === 'crisp' ? 220 : 130.81;
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                // Subtle warm harmonic shimmer
                gain.gain.setValueAtTime(0.001, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.4);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();

                oscillatorRef.current = osc;
                gainNodeRef.current = gain;
                setIsPlaying(true);
            }
        } catch (e) {
            console.warn('AudioContext not permitted or supported yet:', e);
            setIsPlaying((prev) => !prev);
        }
    };

    // Cleanup audio context on unmount
    useEffect(() => {
        return () => {
            if (oscillatorRef.current) {
                try {
                    oscillatorRef.current.stop();
                    oscillatorRef.current.disconnect();
                } catch {
                    // ignore
                }
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                try {
                    audioContextRef.current.close();
                } catch {
                    // ignore
                }
            }
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio || 1200);
        let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio || 700);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = canvas.offsetWidth * window.devicePixelRatio || 1200;
            height = canvas.height = canvas.offsetHeight * window.devicePixelRatio || 700;
        };

        window.addEventListener('resize', handleResize);

        // Particle nodes for acoustic grid mesh
        const cols = 28;
        const rows = 16;
        type MeshPoint = {
            baseX: number;
            baseY: number;
            x: number;
            y: number;
            vx: number;
            vy: number;
            hue: number;
            phase: number;
            speed: number;
            amp: number;
        };

        const points: MeshPoint[] = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const bx = (c / (cols - 1)) * width;
                const by = (r / (rows - 1)) * height;
                points.push({
                    baseX: bx,
                    baseY: by,
                    x: bx,
                    y: by,
                    vx: 0,
                    vy: 0,
                    hue: (c * 7 + r * 15 + 190) % 360,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.8 + Math.random() * 1.4,
                    amp: 6 + Math.random() * 14,
                });
            }
        }

        // Floating audio sound particles (reminiscent of the signal marks but silky reactive)
        const floatingBeams = Array.from({ length: 42 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.9,
            vy: (Math.random() - 0.5) * 0.9,
            length: 12 + Math.random() * 26,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02,
            color: ['#ff4d4d', '#ff9f43', '#feca57', '#1dd1a1', '#48dbfb', '#54a0ff', '#5f27cd', '#ff6b6b'][Math.floor(Math.random() * 8)],
            alpha: 0.25 + Math.random() * 0.55,
            frequencyResponse: 0.5 + Math.random() * 1.5,
        }));

        let time = 0;

        const render = () => {
            time += 0.018;

            // Ease mouse position
            const m = mouseRef.current;
            m.x += (m.targetX - m.x) * 0.09;
            m.y += (m.targetY - m.y) * 0.09;

            ctx.clearRect(0, 0, width, height);

            const isDark = document.documentElement.classList.contains('dark');
            const intensityMultiplier = isPlaying ? 1.9 : 1.0;

            // 1. Draw glowing soundwave ripples behind
            const waveCount = 4;
            for (let w = 0; w < waveCount; w++) {
                ctx.beginPath();
                const waveY = height * 0.52 + Math.sin(time * 1.2 + w * 1.4) * 35 * intensityMultiplier;
                const waveFreq = 0.0022 + w * 0.0008;
                const waveAmp = (28 + w * 18) * intensityMultiplier;

                for (let x = 0; x <= width; x += 12) {
                    // Audio disturbance near pointer
                    let dy = Math.sin(x * waveFreq + time * (1.8 + w * 0.4) + w * 1.5) * waveAmp;
                    const dMouse = Math.hypot(x - m.x, waveY - m.y);
                    if (dMouse < m.radius * 2.2) {
                        const factor = Math.cos((dMouse / (m.radius * 2.2)) * (Math.PI / 2));
                        dy += Math.sin(time * 8 + x * 0.05) * 35 * factor;
                    }
                    if (x === 0) {
                        ctx.moveTo(x, waveY + dy);
                    } else {
                        ctx.lineTo(x, waveY + dy);
                    }
                }

                ctx.strokeStyle = isDark
                    ? `hsla(${(w * 45 + time * 12) % 360}, 85%, 65%, ${0.08 + w * 0.04})`
                    : `hsla(${(w * 45 + time * 12) % 360}, 75%, 45%, ${0.05 + w * 0.03})`;
                ctx.lineWidth = 1.8 + w * 0.6;
                ctx.stroke();
            }

            // 2. Audio Mesh Points (Spring Physics & Reactive Field)
            for (let i = 0; i < points.length; i++) {
                const p = points[i];

                // Natural harmonic oscillation
                const waveOffset = Math.sin(time * p.speed + p.phase) * p.amp * intensityMultiplier;
                const targetX = p.baseX;
                const targetY = p.baseY + waveOffset;

                // Mouse interaction repulsion/attraction
                const dx = m.x - p.x;
                const dy = m.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = m.radius * (m.down ? 1.6 : 1.2);

                if (dist < maxDist && dist > 0) {
                    const force = (1 - dist / maxDist) * (m.down ? -40 : 25);
                    const angle = Math.atan2(dy, dx);
                    p.vx -= Math.cos(angle) * force * 0.14;
                    p.vy -= Math.sin(angle) * force * 0.14;
                }

                // Spring back
                p.vx += (targetX - p.x) * 0.06;
                p.vy += (targetY - p.y) * 0.06;

                // Damping
                p.vx *= 0.84;
                p.vy *= 0.84;

                p.x += p.vx;
                p.y += p.vy;
            }

            // Draw Mesh connection lines
            ctx.lineWidth = 1;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const idx = r * cols + c;
                    const p1 = points[idx];

                    // Horizontal line
                    if (c < cols - 1) {
                        const p2 = points[idx + 1];
                        const distToMouse = Math.hypot((p1.x + p2.x) / 2 - m.x, (p1.y + p2.y) / 2 - m.y);
                        const isClose = distToMouse < m.radius * 1.5;

                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = isClose
                            ? isDark
                                ? 'rgba(255, 255, 255, 0.18)'
                                : 'rgba(0, 0, 0, 0.16)'
                            : isDark
                              ? 'rgba(255, 255, 255, 0.035)'
                              : 'rgba(0, 0, 0, 0.035)';
                        ctx.stroke();
                    }

                    // Vertical line
                    if (r < rows - 1) {
                        const p2 = points[idx + cols];
                        const distToMouse = Math.hypot((p1.x + p2.x) / 2 - m.x, (p1.y + p2.y) / 2 - m.y);
                        const isClose = distToMouse < m.radius * 1.5;

                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = isClose
                            ? isDark
                                ? 'rgba(255, 255, 255, 0.18)'
                                : 'rgba(0, 0, 0, 0.16)'
                            : isDark
                              ? 'rgba(255, 255, 255, 0.035)'
                              : 'rgba(0, 0, 0, 0.035)';
                        ctx.stroke();
                    }

                    // Draw subtle nodes
                    if ((r + c) % 2 === 0) {
                        const d = Math.hypot(p1.x - m.x, p1.y - m.y);
                        const glow = d < m.radius ? (1 - d / m.radius) * 2.5 : 0;
                        ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${0.12 + glow * 0.3})` : `rgba(0, 0, 0, ${0.1 + glow * 0.3})`;
                        ctx.beginPath();
                        ctx.arc(p1.x, p1.y, 1.2 + glow, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            // 3. Draw tactile floating sound signals (Acoustic Dash Pins)
            for (let i = 0; i < floatingBeams.length; i++) {
                const b = floatingBeams[i];

                b.x += b.vx * (isPlaying ? 1.8 : 1);
                b.y += b.vy * (isPlaying ? 1.8 : 1);
                b.angle += b.rotSpeed;

                // Mouse interaction with dashes
                const dx = m.x - b.x;
                const dy = m.y - b.y;
                const dist = Math.hypot(dx, dy);

                if (dist < m.radius) {
                    const pushFactor = (1 - dist / m.radius) * 3;
                    const angle = Math.atan2(dy, dx);
                    b.x -= Math.cos(angle) * pushFactor;
                    b.y -= Math.sin(angle) * pushFactor;
                    b.angle += 0.05;
                }

                // Wrap around edges gracefully
                if (b.x < -30) b.x = width + 30;
                if (b.x > width + 30) b.x = -30;
                if (b.y < -30) b.y = height + 30;
                if (b.y > height + 30) b.y = -30;

                ctx.save();
                ctx.translate(b.x, b.y);
                ctx.rotate(b.angle);

                const currentLength = b.length * (isPlaying ? 1.3 : 1);
                const currentAlpha = Math.min(1, b.alpha * (dist < m.radius ? 1.6 : 1));

                ctx.strokeStyle = b.color;
                ctx.globalAlpha = currentAlpha;
                ctx.lineWidth = 2.4;
                ctx.lineCap = 'round';

                ctx.beginPath();
                ctx.moveTo(-currentLength / 2, 0);
                ctx.lineTo(currentLength / 2, 0);
                ctx.stroke();

                // Center glowing dot on hover or sound beat
                if (isPlaying || dist < m.radius * 0.8) {
                    ctx.fillStyle = b.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }

            // 4. Reactive Spotlight Glow at mouse cursor
            if (m.isHovered && m.x > 0 && m.y > 0) {
                const gradient = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius * 1.4);
                if (isDark) {
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.07)');
                    gradient.addColorStop(0.5, 'rgba(120, 140, 255, 0.03)');
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                } else {
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.045)');
                    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.015)');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                }
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.radius * 1.4, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameRef.current = requestAnimationFrame(render);
        };

        animationFrameRef.current = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, frequencyBand]);

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!containerRef.current || !canvasRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        mouseRef.current.targetX = (e.clientX - rect.left) * dpr;
        mouseRef.current.targetY = (e.clientY - rect.top) * dpr;
        mouseRef.current.isHovered = true;
    };

    const handlePointerLeave = () => {
        mouseRef.current.isHovered = false;
        mouseRef.current.targetX = -1000;
        mouseRef.current.targetY = -1000;
    };

    const handlePointerDown = () => {
        mouseRef.current.down = true;
    };

    const handlePointerUp = () => {
        mouseRef.current.down = false;
    };

    return (
        <div
            ref={containerRef}
            className={`pointer-events-auto relative h-full w-full overflow-hidden select-none ${className}`}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
        >
            <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full cursor-crosshair touch-none" />

            {/* Interactive Audio Synthesizer HUD Controls */}
            {interactive && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full border border-black/10 bg-white/80 p-1.5 shadow-sm backdrop-blur-md transition-all hover:border-black/20 sm:top-6 sm:right-6 dark:border-white/15 dark:bg-neutral-900/80 dark:hover:border-white/30">
                    <button
                        type="button"
                        onClick={toggleAcousticPulse}
                        title={isPlaying ? 'Pause acoustic reactive pulse' : 'Play acoustic reactive pulse'}
                        className={`group flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition ${
                            isPlaying
                                ? 'bg-neutral-950 text-white shadow dark:bg-white dark:text-neutral-950'
                                : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <span className="relative flex h-2 w-2">
                            {isPlaying && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                            <span
                                className={`relative inline-flex h-2 w-2 rounded-full ${
                                    isPlaying ? 'bg-emerald-500' : 'bg-neutral-400 dark:bg-neutral-600'
                                }`}
                            />
                        </span>
                        <span>{isPlaying ? 'Wave live' : 'Play wave'}</span>
                    </button>

                    <div className="hidden items-center gap-1 border-l border-black/10 pl-2 md:flex dark:border-white/15">
                        {(['deep', 'balanced', 'crisp'] as const).map((band) => (
                            <button
                                key={band}
                                type="button"
                                onClick={() => {
                                    setFrequencyBand(band);
                                    if (oscillatorRef.current && audioContextRef.current) {
                                        const freq = band === 'deep' ? 74 : band === 'crisp' ? 220 : 130.81;
                                        oscillatorRef.current.frequency.setTargetAtTime(freq, audioContextRef.current.currentTime, 0.05);
                                    }
                                }}
                                className={`rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase transition ${
                                    frequencyBand === band
                                        ? 'bg-black/10 font-bold text-neutral-950 dark:bg-white/15 dark:text-white'
                                        : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                                }`}
                            >
                                {band}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
