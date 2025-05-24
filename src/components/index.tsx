import { useRef, useEffect } from 'react';
import Toolbar from './toolbar';
import Sidebar from './sidebar';
import { useEventGuiStore } from '@/zustand';
import useCanvasSetup from '@/hooks/useCanvasSetup';
import useSelectionHandler from '@/hooks/useSelectionHandler';
import useMultipleSeatCreator from '@/hooks/useMultipleSeatCreator';
import useObjectDeletion from '@/hooks/useObjectDeletion';
import useObjectCreator from '@/hooks/useObjectCreator';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import useUndoRedo from '@/hooks/useUndoRedo';
import { useSmartSnap } from '@/hooks/useSmartSnap';
import '@/index.css';
import '../fabricCustomRegistration';
import {
  CanvasObject,
  CanvasJsonCallback,
  SeatCanvasProps,
} from '@/types/data.types';

const SeatCanvas: React.FC<SeatCanvasProps> = ({
  className,
  onChange,
  onSave,
  layout,
  readOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasParent = useRef<HTMLDivElement>(null);
  const { canvas, setCanvas, toolMode, setToolMode, toolAction, snapEnabled } =
    useEventGuiStore();

  useCanvasSetup(canvasRef, canvasParent, setCanvas);
  useSelectionHandler(canvas);
  useMultipleSeatCreator(canvas, toolMode, setToolMode);
  useObjectDeletion(canvas, toolAction);
  useObjectCreator(canvas, toolMode, setToolMode);
  useUndoRedo();
  useKeyboardShortcuts(onSave);
  useSmartSnap(canvas, snapEnabled);

  useEffect(() => {
    if (!canvas) return;

    const handleCanvasChange = () => {
      if (onChange) {
        const json = {
          type: 'canvas',
          ...canvas.toJSON(['customType', 'seatData', 'zoneData']),
        } as unknown as CanvasObject;
        onChange(json);
      }
    };

    // Listen to all relevant canvas events
    const events = [
      'object:modified',
      'object:added',
      'object:removed',
      'object:moving',
      'object:scaling',
      'object:rotating',
      'object:skewing',
      'path:created',
      'selection:created',
      'selection:updated',
      'selection:cleared',
    ];

    events.forEach((event) => {
      canvas.on(event, handleCanvasChange);
    });

    return () => {
      events.forEach((event) => {
        canvas.off(event, handleCanvasChange);
      });
    };
  }, [canvas, onChange]);

  return (
    <div className={`relative size-full bg-gray-200 ${className}`}>
      <Toolbar onSave={onSave} />
      <div className="flex w-full justify-between">
        <div
          className="mx-auto w-full max-w-[45rem] bg-gray-100"
          ref={canvasParent}
        >
          <canvas ref={canvasRef} />
        </div>
        <Sidebar />
      </div>
    </div>
  );
};

export default SeatCanvas;
