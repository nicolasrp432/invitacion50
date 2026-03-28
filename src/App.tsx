import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 222;
const FRAME_SPEED = 1.4;
const IMAGE_SCALE = 0.88;

/* ═══════════════════════════════════════════════
   SVG ICONS (inline to avoid bundle overhead)
   ═══════════════════════════════════════════════ */

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const VolumeOnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

const VolumeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
  </svg>
);

/* ═══════════════════════════════════════════════
   MAIN APP COMPONENT
   ═══════════════════════════════════════════════ */

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const darkOverlayRef = useRef<HTMLDivElement>(null);
  const heroPhoto1Ref = useRef<HTMLImageElement>(null);
  const heroPhoto2Ref = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const bgColorRef = useRef('#0a162e');

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  /* ─── Frame Drawing ─── */
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = framesRef.current[index];
    if (!img) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.fillStyle = bgColorRef.current;
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  /* ─── Sample BG Color from frame edges ─── */
  const sampleBgColor = useCallback((img: HTMLImageElement) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.naturalWidth;
    tempCanvas.height = img.naturalHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.drawImage(img, 0, 0);

    const pixel = tempCtx.getImageData(2, 2, 1, 1).data;
    bgColorRef.current = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  }, []);

  /* ─── Canvas Resize ─── */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    // Redraw after resize
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  /* ─── Load Frames ─── */
  useEffect(() => {
    const frames: HTMLImageElement[] = new Array(FRAME_COUNT);
    let loaded = 0;

    const onLoad = () => {
      loaded++;
      setLoadProgress(Math.round((loaded / FRAME_COUNT) * 100));

      if (loaded === FRAME_COUNT) {
        framesRef.current = frames;
        sampleBgColor(frames[0]);
        resizeCanvas();
        drawFrame(0);

        // Hide loader after a brief settling delay
        setTimeout(() => setLoading(false), 400);
      }
    };

    // Load first 10 frames immediately for fast first paint
    for (let i = 0; i < Math.min(10, FRAME_COUNT); i++) {
      const img = new Image();
      img.src = `/frames/frame_${String(i + 1).padStart(4, '0')}.webp`;
      img.onload = onLoad;
      img.onerror = onLoad;
      frames[i] = img;
    }

    // Load remaining frames
    for (let i = 10; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/frames/frame_${String(i + 1).padStart(4, '0')}.webp`;
      img.onload = onLoad;
      img.onerror = onLoad;
      frames[i] = img;
    }

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawFrame, resizeCanvas, sampleBgColor]);

  /* ─── Initialize Lenis + GSAP ScrollTrigger ─── */
  useEffect(() => {
    if (loading) return;

    // Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Frame-to-scroll binding
    ScrollTrigger.create({
      trigger: scrollContainer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
        const index = Math.min(
          Math.floor(accelerated * FRAME_COUNT),
          FRAME_COUNT - 1
        );
        if (index !== currentFrameRef.current) {
          currentFrameRef.current = index;
          requestAnimationFrame(() => {
            drawFrame(index);
            // Sample bg color every ~20 frames
            if (index % 20 === 0 && framesRef.current[index]) {
              sampleBgColor(framesRef.current[index]);
            }
          });
        }
      },
    });

    // Hero fade on scroll
    const heroOverlay = heroOverlayRef.current;
    if (heroOverlay) {
      ScrollTrigger.create({
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const FADE_END = 0.12;
          const opacity = Math.max(0, 1 - p / FADE_END);
          heroOverlay.style.opacity = String(opacity);
          heroOverlay.style.pointerEvents = opacity > 0 ? '' : 'none';

          // Photo cross-fade: primary fades out, secondary fades in
          const photo1 = heroPhoto1Ref.current;
          const photo2 = heroPhoto2Ref.current;
          if (photo1 && photo2) {
            const photoProgress = Math.min(1, Math.max(0, (p - 0.03) / 0.08));
            photo1.style.opacity = String(1 - photoProgress);
            photo2.style.opacity = String(photoProgress);
          }
        },
      });
    }

    // Dark overlay for content sections
    const darkOverlay = darkOverlayRef.current;
    if (darkOverlay) {
      const enterDark = 0.15;
      const leaveDark = 0.95;
      const fadeRange = 0.04;

      ScrollTrigger.create({
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          let opacity = 0;
          if (p >= enterDark - fadeRange && p <= enterDark) {
            opacity = (p - (enterDark - fadeRange)) / fadeRange;
          } else if (p > enterDark && p < leaveDark) {
            opacity = 0.9;
          } else if (p >= leaveDark && p <= leaveDark + fadeRange) {
            opacity = 0.9 * (1 - (p - leaveDark) / fadeRange);
          }
          darkOverlay.style.opacity = String(opacity);
        },
      });
    }

    // Section animations
    const sections = scrollContainer.querySelectorAll('.scroll-section');
    sections.forEach((section) => {
      const el = section as HTMLElement;
      const enter = parseFloat(el.dataset.enter || '0') / 100;
      const leave = parseFloat(el.dataset.leave || '100') / 100;
      const animationType = el.dataset.animation || 'fade-up';
      const persist = el.dataset.persist === 'true';

      // Position section at midpoint
      const midpoint = ((enter + leave) / 2) * 100;
      el.style.top = `${midpoint}%`;
      el.style.transform = 'translateY(-50%)';

      const children = el.querySelectorAll(
        '.section-label, .section-heading, .section-body, .section-note, .detail-card, .rsvp-card, .invitation-footer'
      );

      const tl = gsap.timeline({ paused: true });

      switch (animationType) {
        case 'fade-up':
          tl.from(children, {
            y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out',
          });
          break;
        case 'scale-up':
          tl.from(children, {
            y: 40, scale: 0.85, opacity: 0, stagger: 0.12, duration: 1.0, ease: 'power2.out',
          });
          break;
        case 'clip-reveal':
          tl.from(children, {
            clipPath: 'inset(100% 0 0 0)', opacity: 0, stagger: 0.15, duration: 1.2, ease: 'power4.inOut',
          });
          break;
        case 'blur-up':
          tl.from(children, {
            y: 50, opacity: 0, filter: 'blur(8px)', stagger: 0.12, duration: 1.0, ease: 'power3.out',
          });
          break;
        case 'stagger-up':
          tl.from(children, {
            y: 60, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out',
          });
          break;
        default:
          tl.from(children, {
            y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out',
          });
      }

      const WINDOW = 0.08;

      ScrollTrigger.create({
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;

          if (p >= enter && p <= enter + WINDOW) {
            const localProgress = (p - enter) / WINDOW;
            tl.progress(localProgress);
            el.style.opacity = '1';
            el.classList.add('visible');
          } else if (p > enter + WINDOW && p < leave - WINDOW) {
            tl.progress(1);
            el.style.opacity = '1';
            el.classList.add('visible');
          } else if (p >= leave - WINDOW && p <= leave && !persist) {
            const localProgress = 1 - (p - (leave - WINDOW)) / WINDOW;
            tl.progress(localProgress);
            el.style.opacity = String(localProgress);
            if (localProgress < 0.1) el.classList.remove('visible');
          } else if (p > leave && !persist) {
            tl.progress(0);
            el.style.opacity = '0';
            el.classList.remove('visible');
          } else if (p < enter) {
            tl.progress(0);
            el.style.opacity = '0';
            el.classList.remove('visible');
          } else if (persist && p >= leave) {
            tl.progress(1);
            el.style.opacity = '1';
            el.classList.add('visible');
          }
        },
      });
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [loading, drawFrame, sampleBgColor]);

  /* ─── Music Control ─── */
  const toggleMusic = useCallback(() => {
    if (!userInteracted) setUserInteracted(true);

    const audio = audioRef.current;
    if (!audio) return;

    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      audio.volume = 0.35;
      audio.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  }, [musicPlaying, userInteracted]);

  // Auto-play music once user interacts (scrolls)
  useEffect(() => {
    if (loading) return;

    const handleFirstInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        const audio = audioRef.current;
        if (audio && !musicPlaying) {
          audio.volume = 0.35;
          audio.play().then(() => setMusicPlaying(true)).catch(() => {});
        }
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [loading, userInteracted, musicPlaying]);

  return (
    <>
      {/* ═══ LOADER ═══ */}
      <div id="loader" className={loading ? '' : 'loaded'}>
        <div className="loader-brand">Alexander Rodriguez</div>
        <div className="loader-bar-track">
          <div className="loader-bar-fill" style={{ width: `${loadProgress}%` }} />
        </div>
        <div className="loader-percent">{loadProgress}%</div>
      </div>

      {/* ═══ AUDIO ═══ */}
      <audio ref={audioRef} loop preload="auto">
        <source src="/music.mp3" type="audio/mpeg" />
      </audio>

      {/* ═══ CANVAS — SCROLL-DRIVEN VIDEO BG ═══ */}
      <div className="canvas-wrap">
        <canvas ref={canvasRef} />
      </div>

      {/* ═══ HERO OVERLAY (FIXED) ═══ */}
      <div id="hero-overlay" ref={heroOverlayRef}>
        <div className="hero-photo-container">
          <img
            ref={heroPhoto1Ref}
            src="/fotoprincipal.png"
            alt="Alexander Rodriguez - 50 Años"
            className="hero-photo primary"
            loading="eager"
          />
          <img
            ref={heroPhoto2Ref}
            src="/principal-final.png"
            alt="Alexander Rodriguez Celebrando"
            className="hero-photo secondary"
            loading="eager"
          />
        </div>

        <div className="hero-content">
          <div className="hero-kicker">Invitación Especial</div>
          <h1 className="hero-name">ALEXANDER</h1>
          <h2 className="hero-surname">Rodriguez</h2>
          <div className="hero-fifty">50</div>
          <p className="hero-tagline">Celebrando medio siglo de vida</p>
        </div>

        <div className="hero-scroll-indicator">
          <span>Descubre los detalles</span>
          <div className="scroll-line" />
        </div>
      </div>

      {/* ═══ DARK OVERLAY ═══ */}
      <div id="dark-overlay" ref={darkOverlayRef} />

      {/* ═══ SCROLL CONTAINER ═══ */}
      <div id="scroll-container" ref={scrollContainerRef}>

        {/* ─── Section 1: Celebración ─── */}
        <section
          className="scroll-section"
          data-enter="18"
          data-leave="35"
          data-animation="fade-up"
        >
          <div className="section-inner">
            <span className="section-label">001 / Celebración</span>
            <h2 className="section-heading">Medio Siglo de Momentos Inolvidables</h2>
            <p className="section-body">
              Te invitamos a ser parte de una celebración única. 
              Cinco décadas de vida, sueños y logros merecen 
              ser celebrados con quienes más importan.
            </p>
          </div>
        </section>

        {/* ─── Section 2: Detalles del Evento ─── */}
        <section
          className="scroll-section"
          data-enter="35"
          data-leave="55"
          data-animation="stagger-up"
        >
          <div className="section-inner">
            <span className="section-label">002 / Detalles</span>
            <h2 className="section-heading">Cuándo y Dónde</h2>

            <div className="detail-card">
              <div className="detail-icon"><CalendarIcon /></div>
              <div>
                <div className="detail-label">Fecha</div>
                <div className="detail-value">Sábado, 7 de Junio, 2025</div>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon"><ClockIcon /></div>
              <div>
                <div className="detail-label">Hora</div>
                <div className="detail-value">1:00 PM — 4:00 PM</div>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon"><MapPinIcon /></div>
              <div>
                <div className="detail-label">Lugar</div>
                <div className="detail-value">The Gilded Garden Hall</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 3: Mensaje Personal ─── */}
        <section
          className="scroll-section"
          data-enter="55"
          data-leave="72"
          data-animation="blur-up"
        >
          <div className="section-inner">
            <span className="section-label">003 / Un Mensaje</span>
            <h2 className="section-heading">Tu Presencia es el Mejor Regalo</h2>
            <p className="section-body">
              No hay regalo más valioso que tu compañía. 
              Ven a compartir una tarde llena de alegría, 
              buena música, y momentos que perdurarán 
              en nuestra memoria para siempre.
            </p>
          </div>
        </section>

        {/* ─── Section 4: RSVP (Persists) ─── */}
        <section
          className="scroll-section"
          data-enter="72"
          data-leave="95"
          data-animation="scale-up"
          data-persist="true"
        >
          <div className="section-inner">
            <div className="rsvp-card">
              <h3 className="rsvp-title">Confirmar Asistencia</h3>
              <div className="rsvp-divider" />
              <p className="rsvp-text">
                Tu compañía es lo más importante para nosotros. 
                Por favor, confirma tu asistencia a través del 
                siguiente enlace.
              </p>
              <a
                href="https://form.typeform.com/to/placeholder"
                target="_blank"
                rel="noopener noreferrer"
                className="rsvp-button"
              >
                <span>Confirmar en Typeform</span>
                <ArrowRightIcon />
              </a>
              <p className="rsvp-note">Lluvia de sobres</p>
            </div>

            <div className="invitation-footer">
              <div className="footer-line" />
              <p className="footer-text">Alexander Rodriguez • 50 Aniversario</p>
            </div>
          </div>
        </section>
      </div>

      {/* ═══ MUSIC TOGGLE ═══ */}
      <button
        className="music-toggle"
        onClick={toggleMusic}
        aria-label={musicPlaying ? 'Pausar música' : 'Reproducir música'}
      >
        {musicPlaying ? (
          <div className="music-bars">
            <div className="music-bar" />
            <div className="music-bar" />
            <div className="music-bar" />
            <div className="music-bar" />
          </div>
        ) : (
          <VolumeOffIcon />
        )}
      </button>
    </>
  );
}
