// import '../fabricCustomRegistration';
import { useEffect, useCallback } from 'react';
import { useEventGuiStore } from '@/zustand';

const useUndoRedo = () => {
  const { canvas, addToUndoStack, undo, redo, undoStack } = useEventGuiStore();

  // :::::::::::::::: Function: appends undo state
  const handleObjectModified = useCallback(() => {
    if (canvas) {
      const jsonState = JSON.stringify(
        canvas.toJSON([
          'id',
          'borderColor',
          'borderDashArray',
          'cornerColor',
          'cornerSize',
          'cornerStrokeColor',
          'transparentCorners',
          'rx',
          'ry',
        ])
      );
      addToUndoStack(jsonState);
    }
  }, [canvas, addToUndoStack]);

  useEffect(() => {
    if (!canvas) return;

    const eventsToListen = [
      'object:modified',
      'object:added',
      'object:removed',
    ];

    // ::::::::::::::: Loop through events to call function
    eventsToListen.forEach((event) => {
      canvas.on(event, handleObjectModified);
    });

    return () => {
      eventsToListen.forEach((event) => {
        canvas.off(event, handleObjectModified);
      });
    };
  }, [canvas, addToUndoStack]);

  return { undo, redo };
};

export default useUndoRedo;
