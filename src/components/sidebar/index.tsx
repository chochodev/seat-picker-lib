import { useEffect, useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import { useEventGuiStore } from '@/zustand';
import { CustomFabricObject } from '@/types/fabric-types';
import { Select } from '@/components/ui';
import { useObjectProperties, useObjectUpdater } from './hooks';
import CommonProperties from './components/commonProperties';
import CircleProperties from './components/circleProperties';
import RectangleProperties from './components/rectangleProperties';
import TextProperties from './components/textProperties';
import ColorProperties from './components/colorProperties';

export type Mode =
  | 'select'
  | 'one-seat'
  | 'multiple-seat'
  | 'shape-square'
  | 'text';

const Sidebar: React.FC = () => {
  const { canvas } = useEventGuiStore();
  const [selectedObject, setSelectedObject] =
    useState<CustomFabricObject | null>(null);
  const [objectType, setObjectType] = useState<
    'circle' | 'rect' | 'i-text' | null
  >(null);

  const { properties, setProperties } = useObjectProperties(
    canvas,
    selectedObject
  );
  const { updateObject } = useObjectUpdater(canvas, setProperties);

  // ::::::::::::::::::::::: Listen for object selection
  useEffect(() => {
    if (!canvas) return;

    const updateSelectedObject = () => {
      const activeObject = canvas.getActiveObject() as CustomFabricObject;
      setSelectedObject(activeObject || null);
      setObjectType(activeObject?.type as 'circle' | 'rect' | 'i-text' | null);
    };

    const eventsToListen = [
      'selection:created',
      'selection:updated',
      'object:moving',
      'object:rotating',
      'object:scaling',
      'object:modified',
    ];

    // ::::::::::::::: Loop through events to call update function on
    eventsToListen.forEach((event) => {
      canvas.on(event, updateSelectedObject);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setObjectType(null);
    });

    return () => {
      eventsToListen.forEach((event) => {
        canvas.off(event, updateSelectedObject);
      });
      canvas.off('selection:cleared');
    };
  }, [canvas]);

  return (
    <div className="w-[20rem] min-h-screen bg-gray-50 p-4 space-y-4">
      <div className="bg-white rounded-md shadow">
        <div className="flex items-center justify-between p-2 bg-gray-200 rounded-t-md">
          <span className="font-semibold">Zones</span>
          <button className="text-gray-600 hover:text-gray-800">
            <LuPlus size={20} />
          </button>
        </div>
        <div className="p-2 flex items-center space-x-2">
          <input
            type="checkbox"
            id="ground-floor"
            className="rounded text-blue-600"
          />
          <label htmlFor="ground-floor">Ground floor</label>
        </div>
      </div>

      {selectedObject && (
        <div className="bg-white rounded-md shadow p-4 space-y-4">
          <h3 className="font-semibold">Properties</h3>

          <CommonProperties
            properties={properties}
            updateObject={updateObject}
          />

          {objectType === 'circle' && (
            <CircleProperties
              properties={properties}
              updateObject={updateObject}
            />
          )}

          {objectType === 'rect' && (
            <RectangleProperties
              properties={properties}
              updateObject={updateObject}
            />
          )}

          {objectType === 'i-text' && (
            <TextProperties
              properties={properties}
              updateObject={updateObject}
              Select={Select}
            />
          )}

          <ColorProperties
            properties={properties}
            updateObject={updateObject}
            objectType={objectType}
          />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
