import { toFloat, PropertiesType } from '@/utils';
// import { toFloat } from '../utils';

interface Properties {
  radius: number;
}

interface CirclePropertiesProps {
  properties: Properties;
  updateObject: (updates: Partial<Properties>) => void;
}

const CircleProperties: React.FC<CirclePropertiesProps> = ({ properties, updateObject }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">Radius</label>
    <div className="flex items-center mt-1">
      <button className="px-2 py-1 bg-gray-200 rounded-l-md" onClick={() => updateObject({ radius: toFloat(properties.radius) - 1 })}>-</button>
      <input
        type="number"
        value={toFloat(properties.radius)}
        onChange={(e) => updateObject({ radius: Number(e.target.value) })}
        className="w-full px-2 py-1 text-center border-t border-b shadow-sm"
      />
      <button className="px-2 py-1 bg-gray-200 rounded-r-md" onClick={() => updateObject({ radius: toFloat(properties.radius) + 1 })}>+</button>
    </div>
  </div>
);

export default CircleProperties;