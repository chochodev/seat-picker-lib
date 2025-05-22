import { fabric } from 'fabric';
import { CustomFabricObject } from '@/types/fabric-types';
import { Properties } from './useObjectProperties';

export const useObjectUpdater = (
  canvas: fabric.Canvas | null,
  setProperties: React.Dispatch<React.SetStateAction<Properties>>,
  lockAspect: boolean = false
) => {
  const updateObject = (updates: Partial<Properties>) => {
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects() as CustomFabricObject[];
    if (activeObjects.length === 0) return;

    activeObjects.forEach((selectedObject) => {
      const updatedProperties: Partial<CustomFabricObject> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (selectedObject[key as keyof CustomFabricObject] !== value) {
          updatedProperties[key as keyof CustomFabricObject] = value;
        }
      }

      // Ensure stroke is always a string when it's being updated
      if (
        'stroke' in updatedProperties &&
        updatedProperties.stroke !== undefined
      ) {
        updatedProperties.stroke = String(updatedProperties.stroke);
      }

      // Special handling for width/height: set and reset scaleX/scaleY
      if ('width' in updates && updates.width !== undefined) {
        const renderedWidth = updates.width;
        const currentScaleX = selectedObject.scaleX || 1;
        selectedObject.set({
          width: renderedWidth / currentScaleX,
          scaleX: 1,
          height: lockAspect
            ? renderedWidth / currentScaleX
            : selectedObject.height,
        });
        delete updatedProperties.width;
      }
      if ('height' in updates && updates.height !== undefined) {
        const renderedHeight = updates.height;
        const currentScaleY = selectedObject.scaleY || 1;
        selectedObject.set({
          height: renderedHeight / currentScaleY,
          scaleY: 1,
          width: lockAspect
            ? renderedHeight / currentScaleY
            : selectedObject.width,
        });
        delete updatedProperties.height;
      }

      selectedObject.set(updatedProperties);

      // :::::::::::: Ensures the text's scales remains 1, only font-size should change
      if (selectedObject.type === 'i-text') {
        selectedObject.set({
          scaleX: 1,
          scaleY: 1,
        });
      }

      // --- Improved auto-snap to canvas edge after rotation ---
      if (Object.prototype.hasOwnProperty.call(updates, 'angle')) {
        selectedObject.setCoords(); // recalculate coords after rotation
        const rect = selectedObject.getBoundingRect();
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        let dx = 0,
          dy = 0;
        // Snap left/right
        if (rect.left < 0) {
          dx = -rect.left;
        } else if (rect.left + rect.width > canvasWidth) {
          dx = canvasWidth - (rect.left + rect.width);
        }
        // Snap top/bottom
        if (rect.top < 0) {
          dy = -rect.top;
        } else if (rect.top + rect.height > canvasHeight) {
          dy = canvasHeight - (rect.top + rect.height);
        }
        if (dx !== 0 || dy !== 0) {
          // Move by offset, using current origin
          const originX = selectedObject.originX || 'center';
          const originY = selectedObject.originY || 'center';
          // Calculate new center position
          const newCenter = new fabric.Point(
            (selectedObject.left ?? 0) + dx,
            (selectedObject.top ?? 0) + dy
          );
          selectedObject.setPositionByOrigin(newCenter, originX, originY);
          selectedObject.setCoords();
        }
      }

      canvas.renderAll();

      setProperties((prev) => ({
        ...prev,
        ...updatedProperties,
      }));
    });
  };

  return { updateObject };
};
