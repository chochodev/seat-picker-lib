import { toFloat, PropertiesType } from '@/utils';
// import { toFloat } from '../utils';

interface Properties {
  width: number;
  height: number;
}

interface RectanglePropertiesProps {
  properties: Properties;
  updateObject: (updates: Partial<Properties>) => void;
}

const RectangleProperties: React.FC<RectanglePropertiesProps> = ({ 
  properties, updateObject 
}) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700">Width</label>
      <div className="flex items-center mt-1">
        <button className="px-2 py-1 bg-gray-200 rounded-l-md" onClick={() => updateObject({ width: toFloat(properties.width) - 1 })}>-</button>
        <input
          type="number"
          value={toFloat(properties.width)}
          onChange={(e) => updateObject({ width: Number(e.target.value) })}
          className="w-full px-2 py-1 text-center border-t border-b shadow-sm"
        />
        <button className="px-2 py-1 bg-gray-200 rounded-r-md" onClick={() => updateObject({ width: toFloat(properties.width) + 1 })}>+</button>
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Height</label>
      <div className="flex items-center  mt-1">
        <button className="px-2 py-1 bg-gray-200 rounded-l-md" onClick={() => updateObject({ height: toFloat(properties.height) - 1 })}>-</button>
        <input
          type="number"
          value={toFloat(properties.height)}
          onChange={(e) => updateObject({ height: Number(e.target.value) })}
          className="w-full px-2 py-1 text-center border-t border-b shadow-sm"
        />
        <button className="px-2 py-1 bg-gray-200 rounded-r-md" onClick={() => updateObject({ height: toFloat(properties.height) + 1 })}>+</button>
      </div>
    </div>
  </>
);

export default RectangleProperties;