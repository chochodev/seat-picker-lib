import { useEffect } from 'react';
import { fabric } from 'fabric';

const useObjectDeletion = (
  canvas: fabric.Canvas | null,
  toolAction: string | null
) => {
  useEffect(() => {
    if (!canvas) return;

    const deleteFunction = () => {
      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;

      if (activeObject.type === 'activeSelection') {
        const activeSelection = activeObject as fabric.ActiveSelection;
        const objects = [...activeSelection.getObjects()];
        objects.forEach((obj) => canvas.remove(obj));
      } else {
        canvas.remove(activeObject);
      }

      canvas.discardActiveObject();
      canvas.renderAll();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Delete' ||
        (event.ctrlKey && event.key.toLowerCase() === 'd')
      ) {
        deleteFunction();
      }
    };

    if (toolAction === 'delete') {
      deleteFunction();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas, toolAction]);
};

export default useObjectDeletion;
