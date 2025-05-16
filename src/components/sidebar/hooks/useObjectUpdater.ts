// import { fabric } from 'fabric';
// import { CustomFabricObject } from '@/types/fabric-types';
// import { Properties } from './useObjectProperties';

// export const useObjectUpdater = (
//   canvas: fabric.Canvas | null, 
//   setProperties: React.Dispatch<React.SetStateAction<Properties>>
// ) => {
//   const updateObject = (updates: Partial<Properties>) => {
//     if (!canvas) return;

//     const activeObjects = canvas.getActiveObjects();
//     if (activeObjects.length === 0) return;

//     // Only update the properties that have changed
//     const updatedProperties: Partial<CustomFabricObject> = {};
//     for (const [key, value] of Object.entries(updates)) {
//       if (activeObjects[0][key as keyof CustomFabricObject] !== value) {
//         updatedProperties[key as keyof CustomFabricObject] = value;
//       }
//     }

//     // Ensure stroke is always a string when it's being updated
//     if ('stroke' in updatedProperties && updatedProperties.stroke !== undefined) {
//       updatedProperties.stroke = String(updatedProperties.stroke);
//     }

//     activeObjects.forEach((obj) => {
//       obj.set(updatedProperties);

//       if (obj.type === 'i-text') {
//         obj.set({
//           scaleX: 1,
//           scaleY: 1,
//         });
//       }
//     });

//     canvas.renderAll();

//     // Update properties based on the first selected object
//     setProperties(prev => ({
//       ...prev,
//       ...updatedProperties
//     }));
//   };

//   return { updateObject };
// };

import { fabric } from 'fabric';
import { CustomFabricObject } from '@/types/fabric-types';
import { Properties } from './useObjectProperties';

export const useObjectUpdater = (
  canvas: fabric.Canvas | null,
  setProperties: React.Dispatch<React.SetStateAction<Properties>>
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
      if ('stroke' in updatedProperties && updatedProperties.stroke !== undefined) {
        updatedProperties.stroke = String(updatedProperties.stroke);
      }

      selectedObject.set(updatedProperties);

      // :::::::::::: Ensures the text's scales remains 1, only font-size should change
      if (selectedObject.type === 'i-text') {
        selectedObject.set({
          scaleX: 1,
          scaleY: 1,
        });
      }

      // --- Auto-snap to canvas edge after rotation ---
      if (Object.prototype.hasOwnProperty.call(updates, 'angle')) {
        // Get bounding box after rotation
        const rect = selectedObject.getBoundingRect();
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        let newLeft = selectedObject.left ?? 0;
        let newTop = selectedObject.top ?? 0;
        // Snap left/right
        if (rect.left < 0) {
          newLeft += -rect.left;
        } else if (rect.left + rect.width > canvasWidth) {
          newLeft -= (rect.left + rect.width - canvasWidth);
        }
        // Snap top/bottom
        if (rect.top < 0) {
          newTop += -rect.top;
        } else if (rect.top + rect.height > canvasHeight) {
          newTop -= (rect.top + rect.height - canvasHeight);
        }
        // Only update if changed
        if (newLeft !== selectedObject.left || newTop !== selectedObject.top) {
          selectedObject.set({ left: newLeft, top: newTop });
        }
      }

      canvas.renderAll();

      setProperties(prev => ({
        ...prev,
        ...updatedProperties
      }));
    });
  };

  return { updateObject };
};