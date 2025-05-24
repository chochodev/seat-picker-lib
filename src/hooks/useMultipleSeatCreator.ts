import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { createSeat } from '../components/createObject';
import { Mode } from '@/zustand/store/eventGuiStore';

const useMultipleSeatCreator = (
  canvas: fabric.Canvas | null,
  toolMode: Mode,
  setToolMode: (mode: Mode) => void
) => {
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const highlightRectRef = useRef<fabric.Rect | null>(null);

  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (event: fabric.IEvent) => {
      if (toolMode !== 'multiple-seat') return;
      const pointer = canvas.getPointer(event.e);
      startPointRef.current = { x: pointer.x, y: pointer.y };

      // Create highlight rectangle
      const rect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 1,
        height: 1,
        fill: 'rgba(0,0,255,0.1)',
        stroke: 'blue',
        strokeDashArray: [4, 4],
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      highlightRectRef.current = rect;
      canvas.add(rect);
      canvas.bringToFront(rect);
    };

    const handleMouseMove = (event: fabric.IEvent) => {
      if (
        toolMode !== 'multiple-seat' ||
        !startPointRef.current ||
        !highlightRectRef.current
      )
        return;
      const pointer = canvas.getPointer(event.e);
      const rect = highlightRectRef.current;
      rect.set({
        width: Math.abs(pointer.x - startPointRef.current.x),
        height: Math.abs(pointer.y - startPointRef.current.y),
        left: Math.min(pointer.x, startPointRef.current.x),
        top: Math.min(pointer.y, startPointRef.current.y),
      });
      canvas.requestRenderAll();
      canvas.bringToFront(rect);
    };

    const handleMouseUp = (event: fabric.IEvent) => {
      if (toolMode !== 'multiple-seat' || !startPointRef.current) return;
      const endPoint = canvas.getPointer(event.e);
      const startPoint = startPointRef.current;
      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);
      const rows = Math.floor(height / 60);
      const cols = Math.floor(width / 60);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const left = startPoint.x + j * 60;
          const top = startPoint.y + i * 60;
          const seat = createSeat(left, top, canvas);
          canvas.add(seat);
        }
      }
      canvas.renderAll();
      // Remove highlight rectangle
      if (highlightRectRef.current) {
        canvas.remove(highlightRectRef.current);
        highlightRectRef.current = null;
      }
      startPointRef.current = null;
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

export default useMultipleSeatCreator;
