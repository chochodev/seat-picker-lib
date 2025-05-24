import { fabric } from 'fabric';
import { CustomFabricObject } from '@/types/fabric-types';
import { Properties } from './useObjectProperties';
import { useEffect } from 'react';

export const useObjectUpdater = (
  canvas: fabric.Canvas | null,
  setProperties: React.Dispatch<React.SetStateAction<Properties>>,
  lockAspect: boolean = false
) => {
  // --- Effect: Listen for scaling circles and update radius ---
  useEffect(() => {
    if (!canvas) return;
    const handleScaling = (e: fabric.IEvent) => {
      const obj = e.target as CustomFabricObject;
      if (!obj) return;
      if (obj.type === 'circle') {
        // Single circle scaling
        const newRadius =
          (obj.radius || (obj.width ? obj.width / 2 : 0)) * (obj.scaleX || 1);
        obj.set({
          radius: newRadius,
          scaleX: 1,
          scaleY: 1,
          width: newRadius * 2,
          height: newRadius * 2,
        });
        obj.setCoords();
        canvas.renderAll();
        setProperties((prev) => ({ ...prev, radius: newRadius }));
      } else if (obj.type === 'activeSelection' && 'getObjects' in obj) {
        // Group scaling
        const selection = obj as fabric.ActiveSelection;
        const circles = (selection.getObjects() as CustomFabricObject[]).filter(
          (o) => o.type === 'circle'
        );
        let radii: number[] = [];
        circles.forEach((circle) => {
          const newRadius =
            (circle.radius || (circle.width ? circle.width / 2 : 0)) *
            (circle.scaleX || 1);
          circle.set({
            radius: newRadius,
            scaleX: 1,
            scaleY: 1,
            width: newRadius * 2,
            height: newRadius * 2,
          });
          circle.setCoords();
          radii.push(newRadius);
        });
        canvas.renderAll();
        // If all radii are the same, show it, else show 'mixed'
        const allSame = radii.every((r) => r === radii[0]);
        setProperties((prev) => ({
          ...prev,
          radius: allSame ? radii[0] : 'mixed',
        }));
      }
    };
    canvas.on('object:scaling', handleScaling);
    return () => {
      canvas.off('object:scaling', handleScaling);
    };
  }, [canvas, setProperties]);

  const updateObject = (updates: Partial<Properties>) => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    const activeObjects = canvas.getActiveObjects() as CustomFabricObject[];
    if (activeObjects.length === 0) return;

    // Handle group move and rotation
    if (activeObject && activeObject.type === 'activeSelection') {
      const group = activeObject as fabric.ActiveSelection;
      // Handle group move
      if ('left' in updates || 'top' in updates) {
        const deltaX =
          'left' in updates && typeof updates.left === 'number'
            ? updates.left - (group.left ?? 0)
            : 0;
        const deltaY =
          'top' in updates && typeof updates.top === 'number'
            ? updates.top - (group.top ?? 0)
            : 0;
        group.getObjects().forEach((obj: fabric.Object) => {
          obj.set({
            left: (obj.left ?? 0) + deltaX,
            top: (obj.top ?? 0) + deltaY,
          });
          obj.setCoords();
        });
        group.setCoords();
        canvas.renderAll();
        setProperties((prev) => ({
          ...prev,
          left: updates.left ?? prev.left,
          top: updates.top ?? prev.top,
        }));
        return;
      }
      // Handle group rotation
      if ('angle' in updates && typeof updates.angle === 'number') {
        group.set('angle', updates.angle);
        group.setCoords();
        canvas.renderAll();
        setProperties((prev) => ({
          ...prev,
          angle: updates.angle ?? prev.angle,
        }));
        return;
      }
    }

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

      // Special handling for circle objects - only use radius
      if (selectedObject.type === 'circle') {
        if ('width' in updates || 'height' in updates) {
          const currentRadius = selectedObject.radius || 0;
          const newRadius = updates.width
            ? updates.width / 2
            : updates.height
              ? updates.height / 2
              : currentRadius;
          selectedObject.set({
            radius: newRadius,
            scaleX: 1,
            scaleY: 1,
            width: newRadius * 2,
            height: newRadius * 2,
          });
          delete updatedProperties.width;
          delete updatedProperties.height;
        }
      } else {
        // Special handling for width/height for non-circle objects
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
