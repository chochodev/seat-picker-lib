import { useEffect } from 'react';
import { fabric } from 'fabric';
import { createSeat } from '../components/createObject';

const useCanvasSetup = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  canvasParent: React.RefObject<HTMLDivElement>,
  setCanvas: (c: fabric.Canvas) => void,
  width: number = 800,
  height: number = 600,
  backgroundColor: string = '#f8fafc',
  allowSelection: boolean = true
) => {
  useEffect(() => {
    if (!canvasRef.current || !canvasParent.current) return;

    const c = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor,
      selection: allowSelection,
    });
    setCanvas(c);

    const resizeCanvas = () => {
      if (canvasParent.current) {
        const parent = canvasParent.current;
        if (parent) {
          const { width, height } = parent.getBoundingClientRect();
          c.setDimensions({ width, height }, { cssOnly: false });
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const seat = createSeat(100, 100);
    seat.angle = 45;
    // c.add(seat);

    c.on('object:moving', (event) => {
      const obj = event.target;
      const { width: canvasWidth, height: canvasHeight } = c;

      if (obj) {
        obj.setCoords(); // Ensure bounding box is up to date
        const rect = obj.getBoundingRect();
        let dx = 0,
          dy = 0;
        // Clamp left/right
        if (rect.left < 0) {
          dx = -rect.left;
        } else if (rect.left + rect.width > (canvasWidth ?? 0)) {
          dx = (canvasWidth ?? 0) - (rect.left + rect.width);
        }
        // Clamp top/bottom
        if (rect.top < 0) {
          dy = -rect.top;
        } else if (rect.top + rect.height > (canvasHeight ?? 0)) {
          dy = (canvasHeight ?? 0) - (rect.top + rect.height);
        }
        if (dx !== 0 || dy !== 0) {
          obj.left = (obj.left ?? 0) + dx;
          obj.top = (obj.top ?? 0) + dy;
          obj.setCoords();
        }
      }
    });

    // Enforce strokeUniform: true for all supported objects on selection
    c.on('selection:created', (event) => {
      const objs = event.selected || (event.target ? [event.target] : []);
      objs.forEach((obj) => {
        if (
          typeof obj.type === 'string' &&
          ['rect', 'circle', 'i-text'].includes(obj.type)
        ) {
          obj.strokeUniform = true;
        }
      });
    });
    // Also enforce after loading from JSON (if needed)
    c.on('after:render', () => {
      c.getObjects().forEach((obj) => {
        if (
          typeof obj.type === 'string' &&
          ['rect', 'circle', 'i-text'].includes(obj.type)
        ) {
          obj.strokeUniform = true;
        }
      });
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      c.dispose();
    };
  }, [canvasRef, canvasParent, setCanvas, width, height]);
};

export default useCanvasSetup;
