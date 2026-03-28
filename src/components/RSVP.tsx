import React from 'react';
import { ArrowRightIcon } from './Icons';

interface RSVPProps {
  finalPhotoSrc: string;
  typeformUrl: string;
}

const RSVP: React.FC<RSVPProps> = ({ finalPhotoSrc, typeformUrl }) => {
  return (
    <div className="section-inner">
      <div className="final-photo-section">
        <div className="final-photo-container">
          <img
            src={finalPhotoSrc}
            alt="Alexander Rodriguez"
            className="final-photo"
          />
        </div>
      </div>

      <div className="rsvp-card">
        <h3 className="rsvp-title">Regalo: Lluvia de Sobres</h3>
        <div className="rsvp-divider" />
        <p className="rsvp-text" style={{ fontSize: '1.1rem', fontWeight: 500, color: '#e5c158' }}>
          Tu presencia es mi mayor regalo.
        </p>
        <p className="rsvp-text">
          Si deseas tener un detalle conmigo, se realizará lluvia de sobres el día del evento.
          ¡Gracias por ser parte de este día!
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <a
            href={typeformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rsvp-button"
          >
            <span>Confirmar Asistencia</span>
            <ArrowRightIcon />
          </a>
        </div>
      </div>

      <div className="invitation-footer">
        <div className="footer-line" />
        <p className="footer-text">Alexander Rodriguez • 50 Aniversario</p>
      </div>
    </div>
  );
};

export default RSVP;
