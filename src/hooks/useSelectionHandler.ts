import { useEffect } from 'react';
import { fabric } from 'fabric';

const useSelectionHandler = (canvas: fabric.Canvas | null) => {
  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const activeObject = canvas.getActiveObject();

      if (activeObject && activeObject.type === 'activeSelection') {
        activeObject.setControlsVisibility({
          mt: false,
          mb: false,
          ml: false,
          mr: false,
        });

        activeObject.borderColor = 'green';
        activeObject.borderDashArray = [2, 4];
        activeObject.padding = 4;
        activeObject.cornerColor = 'lightblue';
        activeObject.cornerSize = 7;
        activeObject.cornerStrokeColor = 'blue';

        canvas.requestRenderAll();
      }
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
    };
  }, [canvas]);
};

export default useSelectionHandler;