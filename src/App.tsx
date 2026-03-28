import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Components
import Loader from './components/Loader';
import { CalendarIcon, ClockIcon, MapPinIcon } from './components/Icons';
import CanvasBackground from './components/CanvasBackground';
import Hero from './components/Hero';
import DetailCard from './components/DetailCard';
import RSVP from './components/RSVP';
import MusicToggle from './components/MusicToggle';

gsap.registerPlugin(ScrollTrigger);

// Constants
const FRAME_COUNT = 222;
const FRAME_SPEED = 1.4;
const IMAGE_SCALE = 0.88;
const RSVP_TYPEFORM_URL = "https://form.typeform.com/to/EPDGaEO3";
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=The+Gilded+Garden+Hall";

export default function App() {
  // Refs
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

  // State
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  /* ─── Frame Drawing Logic ─── */
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = framesRef.current[index];
    if (!img || img.naturalWidth === 0) return;

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

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Clamp DPR to 2.0 to prevent memory crashes on high-res mobile screens
    const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  /* ─── Initialization & Loading ─── */
  useEffect(() => {
    const frames: HTMLImageElement[] = new Array(FRAME_COUNT);
    let loaded = 0;

    const onLoad = () => {
      loaded++;
      setLoadProgress(Math.round((loaded / FRAME_COUNT) * 100));
      if (loaded === FRAME_COUNT) {
        try {
          framesRef.current = frames;
          sampleBgColor(frames[0]);
          resizeCanvas();
          drawFrame(0);
          // Removed auto-setLoading(false) to wait for manual start
        } catch (e) {
          console.error("Initialization error:", e);
          // If total error, allow start anyway
          setLoadProgress(100);
        }
      }
    };

    // Safety timeout: Unlock the site after 12s even if progress is stuck
    const safetyTimer = setTimeout(() => {
      if (loading) {
        console.warn("Loading timeout reach. Starting anyway...");
        setLoading(false);
      }
    }, 12000);

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/frames/frame_${String(i + 1).padStart(4, '0')}.webp`;
      img.onload = onLoad;
      img.onerror = onLoad;
      frames[i] = img;
    }

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(safetyTimer);
    };
  }, [drawFrame, resizeCanvas, sampleBgColor, loading]);

  /* ─── GSAP & Lenis Setup ─── */
  useEffect(() => {
    if (loading) return;

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

    // Scroll-driven Video Background
    ScrollTrigger.create({
      trigger: scrollContainer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
        const index = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);
        if (index !== currentFrameRef.current) {
          currentFrameRef.current = index;
          requestAnimationFrame(() => {
            drawFrame(index);
            if (index % 20 === 0 && framesRef.current[index]) {
              sampleBgColor(framesRef.current[index]);
            }
          });
        }
      },
    });

    // Hero Elevation & Cross-fade
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

    // Dark Background Overlay for Contrast
    const darkOverlay = darkOverlayRef.current;
    if (darkOverlay) {
      ScrollTrigger.create({
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          let opacity = 0;
          if (p >= 0.11 && p <= 0.15) opacity = (p - 0.11) / 0.04;
          else if (p > 0.15 && p < 0.95) opacity = 0.92;
          else if (p >= 0.95 && p <= 0.99) opacity = 0.92 * (1 - (p - 0.95) / 0.04);
          darkOverlay.style.opacity = String(opacity);
        },
      });
    }

    // Section Staggered Animations
    const sections = scrollContainer.querySelectorAll('.scroll-section');
    sections.forEach((section) => {
      const el = section as HTMLElement;
      const enter = parseFloat(el.dataset.enter || '0') / 100;
      const leave = parseFloat(el.dataset.leave || '100') / 100;
      const persist = el.dataset.persist === 'true';
      const midpoint = ((enter + leave) / 2) * 100;
      el.style.top = `${midpoint}%`;
      el.style.transform = 'translateY(-50%)';

      const children = el.querySelectorAll('.section-label, .section-heading, .section-body, .detail-card, .rsvp-card, .invitation-footer');
      const tl = gsap.timeline({ paused: true });
      tl.from(children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out' });

      ScrollTrigger.create({
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const WINDOW = 0.08;
          if (p >= enter && p <= enter + WINDOW) {
            tl.progress((p - enter) / WINDOW);
            el.style.opacity = '1';
            el.classList.add('visible');
          } else if (p > enter + WINDOW && p < leave - WINDOW) {
            tl.progress(1);
            el.style.opacity = '1';
            el.classList.add('visible');
          } else if (p >= leave - WINDOW && p <= leave && !persist) {
            const lp = 1 - (p - (leave - WINDOW)) / WINDOW;
            tl.progress(lp);
            el.style.opacity = String(lp);
            if (lp < 0.1) el.classList.remove('visible');
          } else if (p > leave && !persist) {
            el.style.opacity = '0';
            el.classList.remove('visible');
          }
        },
      });
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [loading, drawFrame, sampleBgColor]);

  /* ─── Experience Start Logic ─── */
  const handleExperienceStart = useCallback(() => {
    setUserInteracted(true);
    setLoading(false);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.35;
      audio.play().then(() => setMusicPlaying(true)).catch(() => { });
    }
  }, []);

  /* ─── Music Logic ─── */
  const toggleMusic = useCallback(() => {
    if (!userInteracted) setUserInteracted(true);
    const audio = audioRef.current;
    if (!audio) return;
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      audio.volume = 0.35;
      audio.play().then(() => setMusicPlaying(true)).catch(() => { });
    }
  }, [musicPlaying, userInteracted]);

  return (
    <>
      <Loader 
        loading={loading} 
        loadProgress={loadProgress} 
        onStart={handleExperienceStart}
      />

      <audio ref={audioRef} loop preload="auto">
        <source src="/music.mp3" type="audio/mpeg" />
      </audio>

      <CanvasBackground ref={canvasRef} />

      <Hero
        ref={heroOverlayRef}
        photo1Ref={heroPhoto1Ref}
        photo2Ref={heroPhoto2Ref}
      />

      <div id="dark-overlay" ref={darkOverlayRef} />

      <div id="scroll-container" ref={scrollContainerRef}>
        {/* Section 1: Celebración */}
        <section className="scroll-section" data-enter="18" data-leave="35">
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

        {/* Section 2: Detalles del Evento */}
        <section className="scroll-section" data-enter="35" data-leave="55">
          <div className="section-inner">
            <span className="section-label">002 / Detalles</span>
            <h2 className="section-heading">Cuándo y Dónde</h2>

            <DetailCard
              icon={<CalendarIcon />}
              label="Fecha"
              value="Sábado, 7 de Junio, 2025"
            />

            <DetailCard
              icon={<ClockIcon />}
              label="Hora"
              value="1:00 PM — 4:00 PM"
            />

            <DetailCard
              icon={<MapPinIcon />}
              label="Lugar"
              value="The Gilded Garden Hall"
              link={MAPS_URL}
            />
          </div>
        </section>

        {/* Section 3: Mensaje Personal */}
        <section className="scroll-section" data-enter="55" data-leave="72">
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

        {/* Section 4: RSVP */}
        <section className="scroll-section" data-enter="72" data-leave="95" data-persist="true">
          <RSVP
            finalPhotoSrc="/principal-final.png"
            typeformUrl={RSVP_TYPEFORM_URL}
          />
        </section>
      </div>

      <MusicToggle playing={musicPlaying} onToggle={toggleMusic} />
    </>
  );
}
