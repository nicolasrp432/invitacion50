import React from 'react';

interface LoaderProps {
  loading: boolean;
  loadProgress: number;
}

const Loader: React.FC<LoaderProps> = ({ loading, loadProgress }) => {
  return (
    <div id="loader" className={loading ? '' : 'loaded'}>
      <div className="loader-brand">Alexander Rodriguez</div>
      <div className="loader-bar-track">
        <div className="loader-bar-fill" style={{ width: `${loadProgress}%` }} />
      </div>
      <div className="loader-percent">{loadProgress}%</div>
    </div>
  );
};

export default Loader;
