import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Calendar, MapPin, Clock, ArrowRight, ChevronDown, Sparkles } from 'lucide-react';

const ElegantBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-navy-deep">
    <div 
      className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full opacity-10 blur-[120px]"
      style={{ background: 'radial-gradient(circle, #e5c158 0%, transparent 70%)' }}
    />
    <div 
      className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full opacity-10 blur-[120px]"
      style={{ background: 'radial-gradient(circle, #e5c158 0%, transparent 70%)' }}
    />
    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>
  </div>
);

const HeroSection = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <motion.div 
        style={{ y, opacity }}
        className="flex flex-col items-center text-center space-y-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex items-center space-x-3 text-gold-elegant"
        >
          <div className="h-[1px] w-12 bg-gold-elegant opacity-50"></div>
          <span className="uppercase text-xs font-bold tracking-[0.5em]">Invitación Especial</span>
          <div className="h-[1px] w-12 bg-gold-elegant opacity-50"></div>
        </motion.div>
        
        <div className="relative py-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-serif text-8xl md:text-9xl font-bold text-gold-elegant opacity-20"
          >
            50
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <h2 className="font-display text-5xl md:text-7xl font-bold text-white tracking-widest uppercase">
              ALEXANDER
            </h2>
            <h3 className="font-serif italic text-4xl md:text-5xl text-gold-elegant mt-2">
              Rodriguez
            </h3>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="flex flex-col items-center space-y-2"
        >
          <Sparkles className="text-gold-elegant h-6 w-6 opacity-50" />
          <p className="font-sans text-gray-400 tracking-[0.2em] uppercase text-sm">
            Celebrando medio siglo de vida
          </p>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 flex flex-col items-center text-gold-elegant/60"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] mb-3">Descubre los detalles</span>
        <ChevronDown className="animate-bounce h-5 w-5" />
      </motion.div>
    </section>
  );
};

const ImageScrollSection = () => {
  const { scrollYProgress } = useScroll();
  
  // Cross-fade effect based on scroll
  const opacity1 = useTransform(scrollYProgress, [0.2, 0.35, 0.5, 0.65], [0, 1, 1, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.5, 0.65, 0.8, 0.95], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.9, 1, 0.9]);

  return (
    <div className="relative h-[150vh] flex flex-col items-center justify-start py-20">
      <div className="sticky top-[15%] w-full flex justify-center px-6">
        <motion.div 
          style={{ scale }}
          className="w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gold-elegant/20 bg-navy-deep"
        >
          {/* Image 1: Alexander with balloons (Using a placeholder that fits the description) */}
          <motion.img 
            style={{ opacity: opacity1 }}
            src="https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=1000&auto=format&fit=crop" 
            alt="Alexander Celebration" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Image 2: Elegant Alexander Portrait */}
          <motion.img 
            style={{ opacity: opacity2 }}
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop" 
            alt="Alexander Portrait" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-transparent to-transparent opacity-60"></div>
        </motion.div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
    className="flex items-center space-x-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold-elegant/30 transition-colors"
  >
    <div className="p-4 rounded-xl bg-gold-elegant/10 text-gold-elegant">
      <Icon size={28} strokeWidth={1.5} />
    </div>
    <div className="text-left">
      <p className="text-gold-elegant/60 text-[10px] uppercase tracking-[0.3em] font-bold mb-1">{label}</p>
      <p className="text-white text-xl font-display font-medium tracking-wide">{value}</p>
    </div>
  </motion.div>
);

const DetailsSection = () => {
  return (
    <section className="relative py-32 px-6 max-w-2xl mx-auto space-y-20">
      <div className="space-y-6">
        <InfoCard icon={Calendar} label="Fecha" value="Sábado, 7 de Junio, 2025" delay={0.1} />
        <InfoCard icon={Clock} label="Hora" value="1:00 PM — 4:00 PM" delay={0.2} />
        <InfoCard icon={MapPin} label="Lugar" value="The Gilded Garden Hall" delay={0.3} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="glass-dark p-10 rounded-[2.5rem] text-center space-y-8"
      >
        <div className="space-y-4">
          <h3 className="text-gold-elegant text-3xl font-display font-bold uppercase tracking-tighter">Confirmar Asistencia</h3>
          <div className="h-[1px] w-20 bg-gold-elegant mx-auto opacity-30"></div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
            Tu compañía es lo más importante para nosotros. Por favor, confirma tu asistencia a través del siguiente enlace.
          </p>
        </div>

        <motion.a 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="https://form.typeform.com/to/placeholder" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center justify-center space-x-3 w-full py-5 rounded-2xl bg-gold-elegant text-navy-deep font-black uppercase tracking-widest text-sm hover:bg-gold-light transition-all duration-300 shadow-[0_10px_30px_rgba(229,193,88,0.3)]"
        >
          <span>Confirmar en Typeform</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </motion.a>
        
        <div className="pt-4">
          <p className="text-gold-elegant/50 text-xs italic font-serif">Lluvia de sobres</p>
        </div>
      </motion.div>

      <footer className="text-center space-y-4 opacity-40">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gold-elegant to-transparent"></div>
        <p className="text-gold-elegant text-[10px] uppercase tracking-[0.5em]">Alexander Rodriguez • 50 Aniversario</p>
      </footer>
    </section>
  );
};

export default function App() {
  return (
    <main className="bg-navy-deep min-h-screen selection:bg-gold-elegant selection:text-navy-deep">
      <ElegantBackground />
      <HeroSection />
      <ImageScrollSection />
      <DetailsSection />
    </main>
  );
}
