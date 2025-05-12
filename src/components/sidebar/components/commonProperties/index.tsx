import { toFloat, PropertiesType } from '@/utils';
// import { toFloat } from '../utils';

interface Properties {
  angle: number;
  left: number;
  top: number;
}

interface CommonPropertiesProps {
  properties: Properties;
  updateObject: (updates: Partial<Properties>) => void;
}

const CommonProperties: React.FC<CommonPropertiesProps> = ({ properties, updateObject }) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700">Angle (&deg;)</label>
      <div className="flex items-center mt-1">
        <button className="px-2 py-1 bg-gray-200 rounded-l-md" onClick={() => updateObject({ angle: toFloat(properties.angle) - 1 })}>-</button>
        <input
          type="number"
          value={toFloat(properties.angle)}
          onChange={(e) => updateObject({ angle: Number(e.target.value) })}
          className="w-full px-2 py-1 text-center border-t border-b shadow-sm"
        />
        <button className="px-2 py-1 bg-gray-200 rounded-r-md" onClick={() => updateObject({ angle: toFloat(properties.angle) + 1 })}>+</button>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">Position X</label>
      <div className="flex items-center mt-1">
        <button className="px-2 py-1 bg-gray-200 rounded-l-md" onClick={() => updateObject({ left: toFloat(properties.left) - 1 })}>-</button>
        <input
          type="number"
          value={toFloat(properties.left)}
          onChange={(e) => updateObject({ left: Number(e.target.value) })}
          className="w-full px-2 py-1 text-center border-t border-b shadow-sm"
        />
        <button className="px-2 py-1 bg-gray-200 rounded-r-md" onClick={() => updateObject({ left: toFloat(properties.left) + 1 })}>+</button>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">Position Y</label>
      <div className="flex items-center mt-1">
        <button className="px-2 py-1 bg-gray-200 rounded-l-md" onClick={() => updateObject({ top: toFloat(properties.top) - 1 })}>-</button>
        <input
          type="number"
          value={toFloat(properties.top)}
          onChange={(e) => updateObject({ top: Number(e.target.value) })}
          className="w-full px-2 py-1 text-center border-t border-b shadow-sm"
        />
        <button className="px-2 py-1 bg-gray-200 rounded-r-md" onClick={() => updateObject({ top: toFloat(properties.top) + 1 })}>+</button>
      </div>
    </div>
  </>
);

export default CommonProperties;