import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { createSeat, createRect, createText } from '../components/createObject';
import { Mode } from '@/zustand/store/eventGuiStore';

const useObjectCreator = (
  canvas: fabric.Canvas | null,
  toolMode: Mode,
  setToolMode: (mode: Mode) => void
) => {
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const rectRef = useRef<fabric.Rect | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (event: fabric.IEvent) => {
      const pointer = canvas.getPointer(event.e);

      if (toolMode === 'one-seat') {
        const seat = createSeat(pointer.x, pointer.y, canvas);
        canvas.add(seat);
        canvas.renderAll();
      } else if (toolMode === 'shape-square') {
        const rect = createRect(pointer.x, pointer.y);
        rectRef.current = rect;
        isDraggingRef.current = false;
        canvas.add(rect);
        canvas.setActiveObject(rect);
        startPointRef.current = { x: pointer.x, y: pointer.y };
      } else if (toolMode === 'text') {
        const text = createText(pointer.x, pointer.y);
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();
      }
    };

    const handleMouseMove = (event: fabric.IEvent) => {
      if (
        toolMode === 'shape-square' &&
        startPointRef.current &&
        rectRef.current
      ) {
        const pointer = canvas.getPointer(event.e);
        const width = Math.abs(pointer.x - startPointRef.current.x);
        const height = Math.abs(pointer.y - startPointRef.current.y);
        rectRef.current.set({
          width: width,
          height: height,
        });
        isDraggingRef.current = true;
        canvas.renderAll();
      }
    };

    const handleMouseUp = () => {
      if (toolMode === 'shape-square' && rectRef.current) {
        if (!isDraggingRef.current) {
          // If not dragged, set to default size
          rectRef.current.set({ width: 100, height: 100 });
          canvas.renderAll();
        }
        startPointRef.current = null;
        rectRef.current = null;
        isDraggingRef.current = false;
      }
      setToolMode('select');
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [canvas, toolMode, setToolMode]);
};

export default useObjectCreator;
