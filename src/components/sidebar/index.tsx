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
import { Pattern, Gradient } from 'fabric/fabric-impl';
import SeatAttributes from './components/seatAttributes';

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
  const [activeTab, setActiveTab] = useState<'basic' | 'attributes'>('basic');

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
      // --- Sync sidebar properties with active object ---
      if (activeObject) {
        setProperties((prev) => ({
          ...prev,
          angle: activeObject.angle ?? prev.angle,
          radius: (activeObject as any).radius ?? prev.radius,
          width:
            (activeObject.width ?? prev.width) * (activeObject.scaleX ?? 1),
          height:
            (activeObject.height ?? prev.height) * (activeObject.scaleY ?? 1),
          fill: activeObject.fill ?? prev.fill,
          stroke: activeObject.stroke ?? prev.stroke,
          text: (activeObject as any).text ?? prev.text,
          fontSize: (activeObject as any).fontSize ?? prev.fontSize,
          fontWeight: (activeObject as any).fontWeight ?? prev.fontWeight,
          fontFamily: (activeObject as any).fontFamily ?? prev.fontFamily,
          left: activeObject.left ?? prev.left,
          top: activeObject.top ?? prev.top,
          rx: (activeObject as any).rx ?? prev.rx,
          ry: (activeObject as any).ry ?? prev.ry,
        }));
      }
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
    <div className="min-h-screen w-[20rem] space-y-4 bg-gray-50 p-4">
      <div className="rounded-md bg-white shadow">
        <div className="flex items-center justify-between rounded-t-md bg-gray-200 p-2">
          <span className="font-semibold">Zones</span>
          <button className="text-gray-600 hover:text-gray-800">
            <LuPlus size={20} />
          </button>
        </div>
        <div className="flex items-center space-x-2 p-2">
          <input
            type="checkbox"
            id="ground-floor"
            className="rounded text-gray-600"
          />
          <label htmlFor="ground-floor">Ground floor</label>
        </div>
      </div>

      {selectedObject && (
        <div className="space-y-4 rounded-md bg-white p-4 shadow">
          {objectType === 'circle' && (
            <div className="mb-4 flex items-center gap-2 border-0 border-b border-solid border-gray-200">
              <button
                className={`px-3 py-1.5 text-sm font-medium ${
                  activeTab === 'basic'
                    ? 'border-0 border-b-2 border-solid border-gray-500 text-gray-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('basic')}
              >
                Properties
              </button>
              <button
                className={`px-3 py-1.5 text-sm font-medium ${
                  activeTab === 'attributes'
                    ? 'border-0 border-b-2 border-solid border-gray-500 text-gray-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('attributes')}
              >
                Attributes
              </button>
            </div>
          )}

          {objectType === 'circle' && activeTab === 'attributes' ? (
            <SeatAttributes
              properties={properties}
              updateObject={updateObject}
              Select={Select}
            />
          ) : (
            <>
              <h3 className="font-semibold">Properties</h3>
              <CommonProperties
                properties={properties}
                updateObject={updateObject}
              />

              {objectType === 'circle' && (
                <CircleProperties
                  properties={properties}
                  updateObject={updateObject}
                  Select={Select}
                />
              )}

              {objectType === 'rect' && (
                <RectangleProperties
                  properties={properties}
                  updateObject={updateObject}
                  Select={Select}
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
