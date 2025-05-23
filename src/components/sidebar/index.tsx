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
  const [selectedObjects, setSelectedObjects] = useState<CustomFabricObject[]>(
    []
  );
  const [objectTypes, setObjectTypes] = useState<string[]>([]);
  const [selectedObject, setSelectedObject] =
    useState<CustomFabricObject | null>(null);
  const [objectType, setObjectType] = useState<
    'circle' | 'rect' | 'i-text' | null
  >(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'attributes'>('basic');

  const { properties, setProperties } = useObjectProperties(
    canvas,
    selectedObjects
  );
  const [lockAspect, setLockAspect] = useState(true);
  const { updateObject } = useObjectUpdater(canvas, setProperties, lockAspect);

  // ::::::::::::::::::::::: Listen for object selection
  useEffect(() => {
    if (!canvas) return;

    const updateSelectedObjects = () => {
      const activeObjects = canvas.getActiveObjects() as CustomFabricObject[];
      setSelectedObjects(activeObjects);
      setSelectedObject(activeObjects[0] || null);
      setObjectType(
        activeObjects[0]?.type as 'circle' | 'rect' | 'i-text' | null
      );
      setObjectTypes(
        Array.from(
          new Set(
            activeObjects
              .map((obj) => obj.type)
              .filter((type): type is string => typeof type === 'string')
          )
        )
      );
      // --- Sync sidebar properties with first active object ---
      if (activeObjects[0]) {
        setProperties((prev) => ({
          ...prev,
          angle: activeObjects[0].angle ?? prev.angle,
          radius: (activeObjects[0] as any).radius ?? prev.radius,
          width:
            (activeObjects[0].width ?? prev.width) *
            (activeObjects[0].scaleX ?? 1),
          height:
            (activeObjects[0].height ?? prev.height) *
            (activeObjects[0].scaleY ?? 1),
          fill: activeObjects[0].fill ?? prev.fill,
          stroke: activeObjects[0].stroke ?? prev.stroke,
          text: (activeObjects[0] as any).text ?? prev.text,
          fontSize: (activeObjects[0] as any).fontSize ?? prev.fontSize,
          fontWeight: (activeObjects[0] as any).fontWeight ?? prev.fontWeight,
          fontFamily: (activeObjects[0] as any).fontFamily ?? prev.fontFamily,
          left: activeObjects[0].left ?? prev.left,
          top: activeObjects[0].top ?? prev.top,
          rx: (activeObjects[0] as any).rx ?? prev.rx,
          ry: (activeObjects[0] as any).ry ?? prev.ry,
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

    eventsToListen.forEach((event) => {
      canvas.on(event, updateSelectedObjects);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObjects([]);
      setSelectedObject(null);
      setObjectType(null);
      setObjectTypes([]);
    });

    return () => {
      eventsToListen.forEach((event) => {
        canvas.off(event, updateSelectedObjects);
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

      {selectedObjects.length > 1 &&
        objectTypes.length === 1 &&
        objectTypes[0] === 'circle' && (
          <div className="mb-2 text-xs font-semibold text-gray-500">
            Editing {selectedObjects.length} seats
          </div>
        )}

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

          {objectTypes.length === 1 &&
          objectTypes[0] === 'circle' &&
          activeTab === 'attributes' ? (
            <SeatAttributes
              properties={properties}
              updateObject={updateObject}
              Select={Select}
              selectedObjects={selectedObjects}
            />
          ) : (
            <>
              {objectType !== 'circle' && (
                <h3 className="font-semibold">Properties</h3>
              )}
              <CommonProperties
                properties={{ ...properties, type: objectType || undefined }}
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
