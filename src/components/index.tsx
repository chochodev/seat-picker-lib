import { useRef } from 'react';
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

const SeatCanvas = ({ className }: { className?: string }) => {
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
  useKeyboardShortcuts();
  useSmartSnap(canvas, snapEnabled);

  return (
    <div className={`relative size-full bg-gray-200 ${className}`}>
      <Toolbar />
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
