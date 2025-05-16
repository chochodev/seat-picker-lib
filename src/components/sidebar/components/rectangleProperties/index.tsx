import { toFloat, PropertiesType } from '@/utils';
// import { toFloat } from '../utils';
import { Pattern, Gradient } from 'fabric/fabric-impl';

interface Properties {
  width: number;
  height: number;
  fill?: string | Pattern | Gradient;
  stroke?: string | Pattern | Gradient;
  strokeWidth?: number;
}

interface RectanglePropertiesProps {
  properties: Properties;
  updateObject: (updates: Partial<Properties>) => void;
  Select: React.ComponentType<{
    options: Array<{ value: string | number; label: string }>;
    value: string;
    onChange: (value: string) => void;
  }>;
}

const strokeWidthOptions = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Thin' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Thick' },
  { value: 4, label: 'Extra Thick' },
];

const RectangleProperties: React.FC<RectanglePropertiesProps> = ({
  properties,
  updateObject,
  Select,
}) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Fill Color
      </label>
      <div className="flex items-center mt-1">
        <input
          type="color"
          value={properties.fill || '#cccccc'}
          onChange={(e) => updateObject({ fill: e.target.value })}
          className="w-8 h-8 rounded-md border shadow-sm"
        />
        <input
          type="text"
          value={properties.fill || ''}
          onChange={(e) => updateObject({ fill: e.target.value })}
          className="ml-2 px-2 py-1 w-full border rounded-md shadow-sm"
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Stroke Color
      </label>
      <div className="flex items-center mt-1">
        <input
          type="color"
          value={properties.stroke || '#000000'}
          onChange={(e) => updateObject({ stroke: e.target.value })}
          className="w-8 h-8 rounded-md border shadow-sm"
        />
        <input
          type="text"
          value={properties.stroke || ''}
          onChange={(e) => updateObject({ stroke: e.target.value })}
          className="ml-2 px-2 py-1 w-full border rounded-md shadow-sm"
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Stroke Width
      </label>
      <Select
        options={strokeWidthOptions}
        value={properties.strokeWidth?.toString() || '1'}
        onChange={(value) => updateObject({ strokeWidth: Number(value) })}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Width</label>
      <div className="flex items-center mt-1">
        <button
          className="px-2 py-1 bg-gray-200 rounded-l-md"
          onClick={() => updateObject({ width: toFloat(properties.width) - 1 })}
        >
          -
        </button>
        <input
          type="number"
          value={toFloat(properties.width)}
          onChange={(e) => updateObject({ width: Number(e.target.value) })}
          className="w-full px-2 py-1 text-center border-t border-b shadow-sm"
        />
        <button
          className="px-2 py-1 bg-gray-200 rounded-r-md"
          onClick={() => updateObject({ width: toFloat(properties.width) + 1 })}
        >
          +
        </button>
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Height</label>
      <div className="flex items-center  mt-1">
        <button
          className="px-2 py-1 bg-gray-200 rounded-l-md"
          onClick={() =>
            updateObject({ height: toFloat(properties.height) - 1 })
          }
        >
          -
        </button>
        <input
          type="number"
          value={toFloat(properties.height)}
          onChange={(e) => updateObject({ height: Number(e.target.value) })}
          className="w-full px-2 py-1 text-center border-t border-b shadow-sm"
        />
        <button
          className="px-2 py-1 bg-gray-200 rounded-r-md"
          onClick={() =>
            updateObject({ height: toFloat(properties.height) + 1 })
          }
        >
          +
        </button>
      </div>
    </div>
  </>
);

export default RectangleProperties;
