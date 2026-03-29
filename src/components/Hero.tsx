import React, { forwardRef } from 'react';

interface HeroProps {
  photo1Ref: React.RefObject<HTMLImageElement | null>;
  photo2Ref: React.RefObject<HTMLImageElement | null>;
}

const Hero = forwardRef<HTMLDivElement, HeroProps>(({ photo1Ref, photo2Ref }, ref) => {
  return (
    <div id="hero-overlay" ref={ref}>
      <div className="hero-photo-container">
        <img
          ref={photo1Ref}
          src="/fotoprincipal.png"
          alt="Alexander Rodriguez - 50 Años"
          className="hero-photo primary"
          loading="eager"
        />
        <img
          ref={photo2Ref}
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
        <span>Desliza hasta el final</span>
        <div className="scroll-line" />
      </div>
    </div>
  );
});

Hero.displayName = 'Hero';
export default Hero;
