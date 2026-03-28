import React from 'react';

interface LoaderProps {
  loading: boolean;
  loadProgress: number;
  onStart: () => void;
}

const Loader: React.FC<LoaderProps> = ({ loading, loadProgress, onStart }) => {
  return (
    <div id="loader" className={loading ? '' : 'loaded'}>
      <div className="loader-brand">Invitación Alexander Rodriguez</div>

      {loadProgress < 100 ? (
        <>
          <div className="loader-bar-track">
            <div className="loader-bar-fill" style={{ width: `${loadProgress}%` }} />
          </div>
          <div className="loader-percent">{loadProgress}%</div>
        </>
      ) : (
        <button
          className="loader-start-btn"
          onClick={onStart}
          aria-label="Comenzar invitación"
        >
          Comenzar
        </button>
      )}
    </div>
  );
};

export default Loader;
