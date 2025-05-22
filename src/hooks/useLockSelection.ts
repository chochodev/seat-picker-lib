import { useCallback, useEffect, useState } from 'react';
import { fabric } from 'fabric';

export function useLockSelection(canvas: fabric.Canvas | null) {
  // Returns true if all selected objects are locked
  const isSelectionLocked = useCallback(() => {
    if (!canvas) return false;
    const selected = canvas.getActiveObjects();
    return (
      selected.length > 0 &&
      selected.every((obj) => obj.lockMovementX && obj.lockMovementY)
    );
  }, [canvas]);

  // Toggle lock state for all selected objects
  const toggleLockSelection = useCallback(() => {
    if (!canvas) return;
    const selected = canvas.getActiveObjects();
    if (selected.length === 0) return;
    const shouldLock = !isSelectionLocked();
    selected.forEach((obj) => {
      obj.set({
        lockMovementX: shouldLock,
        lockMovementY: shouldLock,
      });
    });
    canvas.requestRenderAll();
    // If multiple objects, re-select the group to update controls
    if (selected.length > 1) {
      canvas.discardActiveObject();
      const group = new fabric.ActiveSelection(selected, { canvas });
      canvas.setActiveObject(group);
      canvas.requestRenderAll();
    }
    // Fire a custom event so UI can update immediately
    canvas.fire('lock:changed');
  }, [canvas, isSelectionLocked]);

  // State for forcing re-render on selection/lock change
  const [selectionVersion, setSelectionVersion] = useState(0);
  useEffect(() => {
    if (!canvas) return;
    const update = () => setSelectionVersion((v) => v + 1);
    canvas.on('selection:created', update);
    canvas.on('selection:updated', update);
    canvas.on('lock:changed', update);
    return () => {
      canvas.off('selection:created', update);
      canvas.off('selection:updated', update);
      canvas.off('lock:changed', update);
    };
  }, [canvas]);

  return { isSelectionLocked, toggleLockSelection, selectionVersion };
}
