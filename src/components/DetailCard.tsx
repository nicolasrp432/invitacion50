import React, { ReactNode } from 'react';

interface DetailCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  link?: string;
}

const DetailCard: React.FC<DetailCardProps> = ({ icon, label, value, link }) => {
  const content = (
    <>
      <div className="detail-icon">{icon}</div>
      <div>
        <div className="detail-label">{label}</div>
        <div className="detail-value">{value}</div>
        {link && (
          <div className="detail-link" style={{ fontSize: '0.9rem', marginTop: '4px', color: '#e5c158', textDecoration: 'underline' }}>
            Ver ubicación en Google Maps
          </div>
        )}
      </div>
    </>
  );

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="detail-card"
        style={{ textDecoration: 'none', cursor: 'pointer' }}
      >
        {content}
      </a>
    );
  }

  return (
    <div className="detail-card">
      {content}
    </div>
  );
};

export default DetailCard;
