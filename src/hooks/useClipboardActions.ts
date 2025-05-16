import { useEventGuiStore } from '@/zustand';
import { fabric } from 'fabric';

const useClipboardActions = () => {
  const { canvas, clipboard, setClipboard, lastClickedPoint, setToolAction } =
    useEventGuiStore();

  // :::::::::::::::::::::::::: Function: copy objects
  const copySelectedObjects = () => {
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    // ::::::::::::: Set action to copy
    setToolAction('copy');

    const clonedObjects = activeObjects.map((obj) =>
      fabric.util.object.clone(obj)
    );
    setClipboard(clonedObjects);
  };

  // :::::::::::::::::::::::::: Function: cut objects
  const cutSelectedObjects = () => {
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    // ::::::::::::: Set action to cut
    setToolAction('cut');

    const clonedObjects = activeObjects.map((obj) =>
      fabric.util.object.clone(obj)
    );
    setClipboard(clonedObjects);

    canvas.remove(...activeObjects);
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  // :::::::::::::::::::::::::: Function: paste objects
  const pasteObjects = () => {
    if (!canvas || !clipboard || !lastClickedPoint) return;

    const pastedObjects = clipboard.map((obj) => fabric.util.object.clone(obj));
    const boundingBox = getBoundingBox(pastedObjects);

    // ::::::::::::: Set action to paste
    setToolAction('paste');

    pastedObjects.forEach((obj) => {
      const offsetX = lastClickedPoint.x - boundingBox.left;
      const offsetY = lastClickedPoint.y - boundingBox.top;
      obj.set({
        left: (obj.left || 0) + offsetX,
        top: (obj.top || 0) + offsetY,
      });
      canvas.add(obj);
    });

    canvas.renderAll();
  };

  const getBoundingBox = (objects: fabric.Object[]) => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    objects.forEach((obj) => {
      const objBoundingRect = obj.getBoundingRect();
      minX = Math.min(minX, objBoundingRect.left);
      minY = Math.min(minY, objBoundingRect.top);
      maxX = Math.max(maxX, objBoundingRect.left + objBoundingRect.width);
      maxY = Math.max(maxY, objBoundingRect.top + objBoundingRect.height);
    });

    return { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
  };

  return { copySelectedObjects, cutSelectedObjects, pasteObjects };
};

export default useClipboardActions;
