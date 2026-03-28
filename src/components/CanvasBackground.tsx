import React, { forwardRef } from 'react';

const CanvasBackground = forwardRef<HTMLCanvasElement>((_, ref) => {
  return (
    <div className="canvas-wrap">
      <canvas ref={ref} />
    </div>
  );
});

CanvasBackground.displayName = 'CanvasBackground';
export default CanvasBackground;
