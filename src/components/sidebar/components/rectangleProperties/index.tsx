import { toFloat, PropertiesType } from '@/utils';
// import { toFloat } from '../utils';
import { Pattern, Gradient } from 'fabric/fabric-impl';
import { useState, useEffect } from 'react';
import { useEventGuiStore } from '@/zustand';

interface Properties {
  width: number;
  height: number;
  fill?: string | Pattern | Gradient;
  stroke?: string | Pattern | Gradient;
  strokeWidth?: number;
  rx?: number;
  ry?: number;
}

interface RectanglePropertiesProps {
  properties: Properties;
  updateObject: (updates: Partial<Properties>) => void;
  Select: React.FC<{
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }>;
}

const strokeWidthOptions = [
  { value: '0', label: 'None' },
  { value: '1', label: 'Thin' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'Thick' },
  { value: '4', label: 'Extra Thick' },
];

const RectangleProperties: React.FC<RectanglePropertiesProps> = ({
  properties,
  updateObject,
  Select,
}) => {
  const [lockAspect, setLockAspect] = useState(true);
  const { canvas } = useEventGuiStore();

  useEffect(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject && canvas.getActiveObject();
    if (activeObject && activeObject.type === 'rect') {
      activeObject.set('lockUniScaling', lockAspect);
      activeObject.setControlsVisibility({
        mt: !lockAspect,
        mb: !lockAspect,
        ml: !lockAspect,
        mr: !lockAspect,
      });
      canvas.renderAll && canvas.renderAll();
    }
  }, [lockAspect, canvas]);

  return (
    <>
      <div className="mt-2 flex items-center">
        <input
          type="checkbox"
          checked={lockAspect}
          onChange={(e) => setLockAspect(e.target.checked)}
          className="mr-2"
        />
        <span className="text-xs text-gray-600">Lock aspect ratio</span>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Stroke Width
        </label>
        <Select
          options={strokeWidthOptions}
          value={properties.strokeWidth?.toString() || '1'}
          onChange={(value) => updateObject({ strokeWidth: Number(value) })}
        />
      </div>
      <div className="mt-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Border Radius
        </label>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
              onClick={() =>
                updateObject({
                  rx: Number(toFloat((properties as any).rx ?? 0)) - 1,
                  ry: Number(toFloat((properties as any).ry ?? 0)) - 1,
                })
              }
            >
              -
            </button>
            <input
              type="number"
              value={toFloat((properties as any).rx ?? 0)}
              onChange={(e) =>
                updateObject({
                  rx: Number(e.target.value),
                  ry: Number(e.target.value),
                })
              }
              className="w-12 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
              onClick={() =>
                updateObject({
                  rx: Number(toFloat((properties as any).rx ?? 0)) + 1,
                  ry: Number(toFloat((properties as any).ry ?? 0)) + 1,
                })
              }
            >
              +
            </button>
          </div>
          <div className="mb-1 flex items-center gap-1">
            <button
              className={`flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${
                ((properties as any).rx ?? 0) === 0 ? 'bg-gray-200' : 'bg-white'
              } transition-colors`}
              onClick={() => updateObject({ rx: 0, ry: 0 })}
              title="None"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="2" width="10" height="10" rx="0" />
              </svg>
            </button>
            <button
              className={`flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${
                ((properties as any).rx ?? 0) === 4 ? 'bg-gray-200' : 'bg-white'
              } text-xs transition-colors`}
              onClick={() => updateObject({ rx: 4, ry: 4 })}
              title="Small"
            >
              sm
            </button>
            <button
              className={`flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${
                ((properties as any).rx ?? 0) === 10
                  ? 'bg-gray-200'
                  : 'bg-white'
              } text-xs transition-colors`}
              onClick={() => updateObject({ rx: 10, ry: 10 })}
              title="Medium"
            >
              md
            </button>
            <button
              className={`flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${
                ((properties as any).rx ?? 0) === 20
                  ? 'bg-gray-200'
                  : 'bg-white'
              } text-xs transition-colors`}
              onClick={() => updateObject({ rx: 20, ry: 20 })}
              title="Large"
            >
              lg
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RectangleProperties;
