import { useEffect, useState } from 'react';
import {
  LuCircleFadingPlus,
  LuCirclePlus,
  LuCommand,
  LuPlus,
} from 'react-icons/lu';
import { useEventGuiStore } from '@/zustand';
import { CustomFabricObject } from '@/types/fabric-types';
import { Select } from '@/components/ui';
import { useObjectProperties, useObjectUpdater } from './hooks';
import CommonProperties from './components/commonProperties';
import CircleProperties from './components/circleProperties';
import RectangleProperties from './components/rectangleProperties';
import TextProperties from './components/textProperties';
import ColorProperties from './components/colorProperties';
import SeatAttributes from './components/seatAttributes';
import GridSpacing from './components/gridSpacing';

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

  // Listen for object selection
  useEffect(() => {
    if (!canvas) return;

    const updateSelectedObjects = () => {
      const activeObjects = canvas.getActiveObjects() as CustomFabricObject[];
      const activeObject = canvas.getActiveObject();
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
      // --- Sync sidebar properties with group if group is selected ---
      if (activeObject && activeObject.type === 'activeSelection') {
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
      } else if (activeObjects[0]) {
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

    const handleGroupTransform = (e: fabric.IEvent) => {
      const obj = e.target;
      if (obj && obj.type === 'activeSelection') {
        setProperties((prev) => ({
          ...prev,
          left: obj.left ?? prev.left,
          top: obj.top ?? prev.top,
          angle: obj.angle ?? prev.angle,
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

    canvas.on('object:moving', handleGroupTransform);
    canvas.on('object:rotating', handleGroupTransform);

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
      canvas.off('object:moving', handleGroupTransform);
      canvas.off('object:rotating', handleGroupTransform);
      canvas.off('selection:cleared');
    };
  }, [canvas]);

  return (
    <div className="h-full w-[20rem] space-y-4 border-0 border-l border-solid border-gray-200 bg-gray-50 p-4">
      {selectedObjects.length > 1 &&
        objectTypes.length === 1 &&
        objectTypes[0] === 'circle' && (
          <GridSpacing canvas={canvas} selectedObjects={selectedObjects} />
        )}

      {/* Show placeholder when nothing is selected */}
      {selectedObjects.length === 0 && !selectedObject && (
        <div className="flex h-full select-none flex-col items-center py-8 text-gray-400">
          <LuCircleFadingPlus className="h-10 w-10 text-gray-400" />
          <div className="text-center">
            <div className="mb-1 font-semibold text-gray-500">No selection</div>
            <div className="text-sm">
              Select a seat or shape to edit its properties.
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Tip: Use the toolbar above to add new items.
            </div>
          </div>
          <div className="mt-8 w-full max-w-xs rounded-lg border border-solid border-gray-200 bg-white/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <LuCommand className="" />
              Command Palette
            </div>
            <ul className="mt-2 grid grid-cols-2 space-y-1 text-xs text-gray-500">
              <li className="flex items-center">
                <span className="flex font-semibold text-gray-700">
                  <LuCommand className="text-[0.875rem]" /> + Z
                </span>{' '}
                — Undo
              </li>
              <li className="flex items-center">
                <span className="flex font-semibold text-gray-700">
                  <LuCommand className="text-[0.875rem]" /> + Y
                </span>{' '}
                — Redo
              </li>
              <li className="flex items-center">
                <span className="font-semibold text-gray-700">Delete</span> —
                Remove
              </li>
              <li className="flex items-center">
                <span className="flex font-semibold text-gray-700">
                  <LuCommand className="text-[0.875rem]" /> + S
                </span>{' '}
                — Save
              </li>
            </ul>
          </div>
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
