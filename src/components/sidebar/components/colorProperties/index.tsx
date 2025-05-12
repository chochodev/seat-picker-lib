import { Properties } from '../../hooks';

interface ColorPropertiesProps {
  properties: Properties;
  updateObject: (updates: Partial<Properties>) => void;
  objectType: string | null;
}

const ColorProperties: React.FC<ColorPropertiesProps> = ({ properties, updateObject, objectType }) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700">Fill Color</label>
      <div className="flex items-center mt-1">
        <input
          type="color"
          value={
            properties?.fill === 'transparent' ? '#ffffff' : properties.fill?.toString() || '#ffffff'
          }
          onChange={(e) => {
            updateObject({ fill: e.target.value });
            updateObject({ stroke: properties.stroke });
          }}
          className="w-8 h-8 rounded-md border shadow-sm"
        />
        <input
          type="text"
          value={
            properties.fill === 'transparent' ? 'transparent' : (properties.fill?.toString() || '').toUpperCase()
          }
          onChange={(e) => updateObject({ fill: e.target.value })}
          className="ml-2 px-2 py-1 w-full border rounded-md shadow-sm"
        />
      </div>
    </div>

    {objectType !== 'i-text' && (
      <div>
        <label className="block text-sm font-medium text-gray-700">Border Color</label>
        <div className="flex items-center mt-1">
          <input
            type="color"
            value={
              properties?.stroke === 'transparent' ? '#ffffff' : properties.stroke?.toString() || '#000000'
            }
            onChange={(e) => updateObject({ stroke: e.target.value })}
            className="w-8 h-8 rounded-md border shadow-sm"
          />
          <input
            type="text"
            value={
              properties.stroke === 'transparent' ? 'transparent' : (properties.stroke?.toString() || '').toUpperCase()
            }
            onChange={(e) => updateObject({ stroke: e.target.value })}
            className="ml-2 px-2 py-1 w-full border rounded-md shadow-sm"
          />
        </div>
      </div>
    )}
  </>
);

export default ColorProperties;