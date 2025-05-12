import { useEffect } from 'react';
import { fabric } from 'fabric';
import { createSeat } from '../components/createObject';

const useCanvasSetup = (canvasRef: React.RefObject<HTMLCanvasElement>, canvasParent: React.RefObject<HTMLDivElement>, setCanvas: (canvas: fabric.Canvas) => void) => {
  useEffect(() => {
    if (!canvasRef.current || !canvasParent.current) return;

    const newCanvas = new fabric.Canvas(canvasRef.current);
    setCanvas(newCanvas);
    
    const resizeCanvas = () => {
      if (canvasParent.current) {
        const parent = canvasParent.current;
        if (parent) {
          const { width, height } = parent.getBoundingClientRect();
          newCanvas.setDimensions({ width, height }, { cssOnly: false });
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const seat = createSeat(100, 100);
    seat.angle = 45;
    // newCanvas.add(seat);

    newCanvas.on('object:moving', (event) => {
      const obj = event.target;
      const { width: canvasWidth, height: canvasHeight } = newCanvas;
      
      if (obj) {
        const objWidth = (obj.width ?? 0) * (obj.scaleX ?? 1);
        const objHeight = (obj.height ?? 0) * (obj.scaleY ?? 1);
        
        obj.left = Math.max(0, Math.min((obj.left ?? 0), (canvasWidth ?? 0) - objWidth));
        obj.top = Math.max(0, Math.min((obj.top ?? 0), (canvasHeight ?? 0) - objHeight));
      }
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      newCanvas.dispose();
    };
  }, [canvasRef, canvasParent, setCanvas]);
};

export default useCanvasSetup;