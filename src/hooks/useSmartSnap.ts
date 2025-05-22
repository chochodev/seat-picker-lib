import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const SNAP_THRESHOLD = 10;

function getSnapPoints(obj: fabric.Object) {
  const left = obj.left ?? 0;
  const top = obj.top ?? 0;
  const width = (obj.width ?? 0) * (obj.scaleX ?? 1);
  const height = (obj.height ?? 0) * (obj.scaleY ?? 1);
  return {
    left,
    right: left + width,
    top,
    bottom: top + height,
    centerX: left + width / 2,
    centerY: top + height / 2,
  };
}

export function useSmartSnap(
  canvas: fabric.Canvas | null,
  snapEnabled: boolean
) {
  const guideLines = useRef<fabric.Line[]>([]);

  useEffect(() => {
    if (!canvas || !snapEnabled) return;

    function clearGuides() {
      guideLines.current.forEach((line) => canvas.remove(line));
      guideLines.current = [];
    }

    const handleMoving = (e: fabric.IEvent) => {
      clearGuides();
      const moving = e.target;
      if (!moving) return;
      const movingPoints = getSnapPoints(moving);
      let snapX = moving.left ?? 0;
      let snapY = moving.top ?? 0;
      let snappedX = false;
      let snappedY = false;
      const others = canvas
        .getObjects()
        .filter((obj) => obj !== moving && obj.selectable !== false);
      for (const obj of others) {
        const pts = getSnapPoints(obj);
        // X axis (vertical guides)
        [pts.left, pts.centerX, pts.right].forEach((x) => {
          if (Math.abs(movingPoints.left - x) < SNAP_THRESHOLD) {
            snapX = x;
            snappedX = true;
            // Draw guide
            const line = new fabric.Line([x, 0, x, canvas.height ?? 1000], {
              stroke: 'rgba(0,0,255,0.5)',
              selectable: false,
              evented: false,
              strokeDashArray: [4, 4],
              excludeFromExport: true,
            });
            canvas.add(line);
            guideLines.current.push(line);
          }
          if (Math.abs(movingPoints.centerX - x) < SNAP_THRESHOLD) {
            snapX = x - ((moving.width ?? 0) * (moving.scaleX ?? 1)) / 2;
            snappedX = true;
            const line = new fabric.Line([x, 0, x, canvas.height ?? 1000], {
              stroke: 'rgba(0,0,255,0.5)',
              selectable: false,
              evented: false,
              strokeDashArray: [4, 4],
              excludeFromExport: true,
            });
            canvas.add(line);
            guideLines.current.push(line);
          }
          if (Math.abs(movingPoints.right - x) < SNAP_THRESHOLD) {
            snapX = x - (moving.width ?? 0) * (moving.scaleX ?? 1);
            snappedX = true;
            const line = new fabric.Line([x, 0, x, canvas.height ?? 1000], {
              stroke: 'rgba(0,0,255,0.5)',
              selectable: false,
              evented: false,
              strokeDashArray: [4, 4],
              excludeFromExport: true,
            });
            canvas.add(line);
            guideLines.current.push(line);
          }
        });
        // Y axis (horizontal guides)
        [pts.top, pts.centerY, pts.bottom].forEach((y) => {
          if (Math.abs(movingPoints.top - y) < SNAP_THRESHOLD) {
            snapY = y;
            snappedY = true;
            const line = new fabric.Line([0, y, canvas.width ?? 1000, y], {
              stroke: 'rgba(0,0,255,0.5)',
              selectable: false,
              evented: false,
              strokeDashArray: [4, 4],
              excludeFromExport: true,
            });
            canvas.add(line);
            guideLines.current.push(line);
          }
          if (Math.abs(movingPoints.centerY - y) < SNAP_THRESHOLD) {
            snapY = y - ((moving.height ?? 0) * (moving.scaleY ?? 1)) / 2;
            snappedY = true;
            const line = new fabric.Line([0, y, canvas.width ?? 1000, y], {
              stroke: 'rgba(0,0,255,0.5)',
              selectable: false,
              evented: false,
              strokeDashArray: [4, 4],
              excludeFromExport: true,
            });
            canvas.add(line);
            guideLines.current.push(line);
          }
          if (Math.abs(movingPoints.bottom - y) < SNAP_THRESHOLD) {
            snapY = y - (moving.height ?? 0) * (moving.scaleY ?? 1);
            snappedY = true;
            const line = new fabric.Line([0, y, canvas.width ?? 1000, y], {
              stroke: 'rgba(0,0,255,0.5)',
              selectable: false,
              evented: false,
              strokeDashArray: [4, 4],
              excludeFromExport: true,
            });
            canvas.add(line);
            guideLines.current.push(line);
          }
        });
      }
      if (snappedX) moving.set({ left: snapX });
      if (snappedY) moving.set({ top: snapY });
      canvas.requestRenderAll();
    };

    const handleModified = () => {
      clearGuides();
      canvas.requestRenderAll();
    };

    canvas.on('object:moving', handleMoving);
    canvas.on('object:modified', handleModified);
    canvas.on('mouse:up', handleModified);
    return () => {
      canvas.off('object:moving', handleMoving);
      canvas.off('object:modified', handleModified);
      canvas.off('mouse:up', handleModified);
      clearGuides();
    };
  }, [canvas, snapEnabled]);
}
