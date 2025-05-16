import { useEffect } from 'react';
import { useEventGuiStore } from '@/zustand';
import useClipboardActions from './useClipboardActions';

const useKeyboardShortcuts = () => {
  const { canvas, setLastClickedPoint } = useEventGuiStore();
  const { copySelectedObjects, cutSelectedObjects, pasteObjects } =
    useClipboardActions();

  useEffect(() => {
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'c':
            e.preventDefault();
            copySelectedObjects();
            break;
          case 'x':
            e.preventDefault();
            cutSelectedObjects();
            break;
          case 'v':
            e.preventDefault();
            pasteObjects();
            break;
        }
      }
    };

    const handleMouseDown = (event: fabric.IEvent) => {
      const pointer = canvas.getPointer(event.e);
      setLastClickedPoint({ x: pointer.x, y: pointer.y });
    };

    document.addEventListener('keydown', handleKeyDown);
    canvas.on('mouse:down', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      canvas.off('mouse:down', handleMouseDown);
    };
  }, [
    canvas,
    copySelectedObjects,
    cutSelectedObjects,
    pasteObjects,
    setLastClickedPoint,
  ]);
};

export default useKeyboardShortcuts;
