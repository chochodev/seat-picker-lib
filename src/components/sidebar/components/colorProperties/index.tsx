import { Properties } from '../../hooks';
import { useState, useEffect } from 'react';

interface ColorPropertiesProps {
  properties: Properties;
  updateObject: (updates: Partial<Properties>) => void;
  objectType: string | null;
}

const ColorProperties: React.FC<ColorPropertiesProps> = ({
  properties,
  updateObject,
  objectType,
}) => {
  const [syncColors, setSyncColors] = useState(false);

  useEffect(() => {
    // Check if stroke matches fill initially
    setSyncColors(properties.stroke === properties.fill);
  }, [properties.stroke, properties.fill]);

  const handleFillChange = (value: string) => {
    updateObject({ fill: value });
    if (syncColors) {
      updateObject({ stroke: value });
    }
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Fill Color
        </label>
        <div className="flex items-center mt-1">
          <input
            type="color"
            value={
              typeof properties.fill === 'string' &&
              /^#([0-9A-Fa-f]{6})$/.test(properties.fill)
                ? '#ffffff'
                : properties.fill?.toString() || '#ffffff'
            }
            onChange={(e) => handleFillChange(e.target.value)}
            className="w-8 h-8 rounded-md border shadow-sm"
          />
          <input
            type="text"
            value={
              typeof properties.fill === 'string' &&
              /^#([0-9A-Fa-f]{6})$/.test(properties.fill)
                ? 'transparent'
                : (properties.fill?.toString() || '').toUpperCase()
            }
            onChange={(e) => handleFillChange(e.target.value)}
            className="ml-2 px-2 py-1 w-full border rounded-md shadow-sm"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Stroke Color
          </label>
          <label className="flex items-center space-x-1 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={syncColors}
              onChange={(e) => {
                setSyncColors(e.target.checked);
                if (e.target.checked) {
                  updateObject({ stroke: properties.fill });
                }
              }}
              className="w-3 h-3 rounded border-gray-300"
            />
            <span>Sync with fill</span>
          </label>
        </div>
        <div className="flex items-center mt-1">
          <input
            type="color"
            value={
              properties?.stroke === 'transparent'
                ? '#ffffff'
                : properties.stroke?.toString() || '#000000'
            }
            onChange={(e) => updateObject({ stroke: e.target.value })}
            disabled={syncColors}
            className={`w-8 h-8 rounded-md border shadow-sm ${
              syncColors ? 'opacity-50' : ''
            }`}
          />
          <input
            type="text"
            value={
              properties.stroke === 'transparent'
                ? 'transparent'
                : (properties.stroke?.toString() || '').toUpperCase()
            }
            onChange={(e) => updateObject({ stroke: e.target.value })}
            disabled={syncColors}
            className={`ml-2 px-2 py-1 w-full border rounded-md shadow-sm ${
              syncColors ? 'opacity-50' : ''
            }`}
          />
        </div>
      </div>
    </>
  );
};

export default ColorProperties;
