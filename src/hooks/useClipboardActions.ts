import { useEventGuiStore } from '@/zustand';
import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { applyCustomStyles } from '@/components/createObject/applyCustomStyles';

const useClipboardActions = () => {
  const { canvas, clipboard, setClipboard, lastClickedPoint, setToolAction } =
    useEventGuiStore();

  // :::::::::::::::::::::::::: Function: copy objects
  const copySelectedObjects = async () => {
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    // ::::::::::::: Set action to copy
    setToolAction('copy');

    const clonedObjects: fabric.Object[] = [];
    for (const obj of activeObjects) {
      await new Promise<void>((resolve) => {
        obj.clone((cloned: fabric.Object) => {
          // Assign a new ID if needed
          if ('id' in cloned) (cloned as any).id = uuidv4();
          clonedObjects.push(cloned);
          resolve();
        });
      });
    }
    setClipboard(clonedObjects);
  };

  // :::::::::::::::::::::::::: Function: cut objects
  const cutSelectedObjects = async () => {
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    // ::::::::::::: Set action to cut
    setToolAction('cut');

    const clonedObjects: fabric.Object[] = [];
    for (const obj of activeObjects) {
      await new Promise<void>((resolve) => {
        obj.clone((cloned: fabric.Object) => {
          if ('id' in cloned) (cloned as any).id = uuidv4();
          clonedObjects.push(cloned);
          resolve();
        });
      });
    }
    setClipboard(clonedObjects);

    canvas.remove(...activeObjects);
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  // :::::::::::::::::::::::::: Function: paste objects
  const pasteObjects = async () => {
    if (!canvas || !clipboard || !lastClickedPoint) return;

    setToolAction('paste');

    const pastedObjects: fabric.Object[] = [];
    for (const obj of clipboard) {
      await new Promise<void>((resolve) => {
        obj.clone((cloned: fabric.Object) => {
          if ('id' in cloned) (cloned as any).id = uuidv4();
          applyCustomStyles(cloned);
          // Offset the new object so it's not directly on top
          cloned.set({
            left: (cloned.left || 0) + 20,
            top: (cloned.top || 0) + 20,
            evented: true,
          });
          canvas.add(cloned);
          pastedObjects.push(cloned);
          resolve();
        });
      });
    }

    if (pastedObjects.length === 1) {
      canvas.setActiveObject(pastedObjects[0]);
    } else if (pastedObjects.length > 1) {
      const selection = new fabric.ActiveSelection(pastedObjects, { canvas });
      canvas.setActiveObject(selection);
    }
    canvas.requestRenderAll();
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

// // import '../fabricCustomRegistration';
// import { useEventGuiStore } from '@/zustand';
// import { fabric } from 'fabric';
// import React, { useRef } from 'react';

// function useRegisterFabricCustomClasses() {
//   const registered = useRef(false);
//   if (!registered.current) {
//     if (!(fabric as any).CustomRect) {
//       (fabric as any).CustomRect = CustomRect;
//       (CustomRect as any).fromObject = function (object: any, callback: any) {
//         return fabric.Object._fromObject(CustomRect, object, callback);
//       };
//     }
//     if (!(fabric as any).CustomCircle) {
//       (fabric as any).CustomCircle = CustomCircle;
//       (CustomCircle as any).fromObject = function (object: any, callback: any) {
//         return fabric.Object._fromObject(CustomCircle, object, callback);
//       };
//     }
//     if (!(fabric as any).CustomText) {
//       (fabric as any).CustomText = CustomText;
//       (CustomText as any).fromObject = function (object: any, callback: any) {
//         return fabric.Object._fromObject(CustomText, object, callback);
//       };
//     }
//     registered.current = true;
//   }
// }

// const PASTE_OFFSET = 25;

// const useClipboardActions = () => {
//   useRegisterFabricCustomClasses();
//   const { canvas, setToolAction } = useEventGuiStore();
//   // Local clipboard and paste count
//   const clipboardRef = React.useRef<fabric.Object[] | null>(null);
//   const pasteCountRef = React.useRef(0);

//   // Copy selected objects
//   const copySelectedObjects = () => {
//     if (!canvas) return;
//     const activeObjects = canvas.getActiveObjects();
//     if (activeObjects.length === 0) return;
//     setToolAction('copy');
//     // Deep clone for clipboard
//     clipboardRef.current = activeObjects.map((obj) =>
//       obj.clone ? obj.clone() : fabric.util.object.clone(obj)
//     );
//     pasteCountRef.current = 0;
//   };

//   // Cut selected objects
//   const cutSelectedObjects = () => {
//     if (!canvas) return;
//     const activeObjects = canvas.getActiveObjects();
//     if (activeObjects.length === 0) return;
//     setToolAction('cut');
//     clipboardRef.current = activeObjects.map((obj) =>
//       obj.clone ? obj.clone() : fabric.util.object.clone(obj)
//     );
//     pasteCountRef.current = 0;
//     canvas.remove(...activeObjects);
//     canvas.discardActiveObject();
//     canvas.renderAll();
//   };

//   // Paste objects with offset
//   const pasteObjects = () => {
//     if (!canvas || !clipboardRef.current || clipboardRef.current.length === 0)
//       return;
//     setToolAction('paste');
//     // Clone objects for pasting
//     const pastedObjects = clipboardRef.current.map((obj) =>
//       obj.clone ? obj.clone() : fabric.util.object.clone(obj)
//     );
//     // Compute bounding box of originals
//     const boundingBox = getBoundingBox(pastedObjects);
//     const canvasWidth = canvas.getWidth();
//     const canvasHeight = canvas.getHeight();
//     // Offset increases with each paste
//     const offset = PASTE_OFFSET * (pasteCountRef.current + 1);
//     let newLeft = boundingBox.left + offset;
//     let newTop = boundingBox.top + offset;
//     // Clamp to canvas
//     if (newLeft + boundingBox.width > canvasWidth)
//       newLeft = canvasWidth - boundingBox.width;
//     if (newLeft < 0) newLeft = 0;
//     if (newTop + boundingBox.height > canvasHeight)
//       newTop = canvasHeight - boundingBox.height;
//     if (newTop < 0) newTop = 0;
//     const actualOffsetX = newLeft - boundingBox.left;
//     const actualOffsetY = newTop - boundingBox.top;
//     // Place and add to canvas
//     pastedObjects.forEach((obj) => {
//       obj.set({
//         left: (obj.left || 0) + actualOffsetX,
//         top: (obj.top || 0) + actualOffsetY,
//         evented: true,
//         selectable: true,
//       });
//       canvas.add(obj);
//     });
//     // Select pasted objects
//     canvas.discardActiveObject();
//     if (pastedObjects.length === 1) {
//       canvas.setActiveObject(pastedObjects[0]);
//     } else if (pastedObjects.length > 1) {
//       const group = new fabric.ActiveSelection(pastedObjects, { canvas });
//       canvas.setActiveObject(group);
//     }
//     canvas.requestRenderAll();
//     pasteCountRef.current += 1;
//   };

//   // Helper: get bounding box
//   const getBoundingBox = (objects: fabric.Object[]) => {
//     let minX = Infinity,
//       minY = Infinity,
//       maxX = -Infinity,
//       maxY = -Infinity;
//     objects.forEach((obj) => {
//       const rect = obj.getBoundingRect();
//       minX = Math.min(minX, rect.left);
//       minY = Math.min(minY, rect.top);
//       maxX = Math.max(maxX, rect.left + rect.width);
//       maxY = Math.max(maxY, rect.top + rect.height);
//     });
//     return { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
//   };

//   return { copySelectedObjects, cutSelectedObjects, pasteObjects };
// };

// export default useClipboardActions;
// export { useRegisterFabricCustomClasses };
