import { toFloat } from '@/utils';

interface Properties {
  angle: number;
  left: number;
  top: number;
  width?: number;
  height?: number;
}

interface CommonPropertiesProps {
  properties: Properties;
  updateObject: (updates: Partial<Properties>) => void;
}

const angleOptions = [
  { value: 45, label: '45°' },
  { value: 90, label: '90°' },
  { value: 180, label: '180°' },
  { value: 270, label: '270°' },
];

const CommonProperties: React.FC<CommonPropertiesProps> = ({
  properties,
  updateObject,
}) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Position X
        </label>
        <div className="flex items-center gap-1">
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid"
            onClick={() => updateObject({ left: toFloat(properties.left) - 1 })}
          >
            -
          </button>
          <input
            type="number"
            value={toFloat(properties.left)}
            onChange={(e) => updateObject({ left: Number(e.target.value) })}
            className="border-solid w-16 px-1 py-0.5 text-center border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid"
            onClick={() => updateObject({ left: toFloat(properties.left) + 1 })}
          >
            +
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Position Y
        </label>
        <div className="flex items-center gap-1">
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid"
            onClick={() => updateObject({ top: toFloat(properties.top) - 1 })}
          >
            -
          </button>
          <input
            type="number"
            value={toFloat(properties.top)}
            onChange={(e) => updateObject({ top: Number(e.target.value) })}
            className="border-solid w-16 px-1 py-0.5 text-center border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid"
            onClick={() => updateObject({ top: toFloat(properties.top) + 1 })}
          >
            +
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Width
        </label>
        <div className="flex items-center gap-1">
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid"
            onClick={() =>
              updateObject({ width: toFloat(properties.width ?? 0) - 1 })
            }
          >
            -
          </button>
          <input
            type="number"
            value={toFloat(properties.width ?? 0)}
            onChange={(e) => updateObject({ width: Number(e.target.value) })}
            className="border-solid w-16 px-1 py-0.5 text-center border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid"
            onClick={() =>
              updateObject({ width: toFloat(properties.width ?? 0) + 1 })
            }
          >
            +
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Height
        </label>
        <div className="flex items-center gap-1">
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid"
            onClick={() =>
              updateObject({ height: toFloat(properties.height ?? 0) - 1 })
            }
          >
            -
          </button>
          <input
            type="number"
            value={toFloat(properties.height ?? 0)}
            onChange={(e) => updateObject({ height: Number(e.target.value) })}
            className="border-solid w-16 px-1 py-0.5 text-center border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid"
            onClick={() =>
              updateObject({ height: toFloat(properties.height ?? 0) + 1 })
            }
          >
            +
          </button>
        </div>
      </div>
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        Angle
      </label>
      <div className="flex items-center gap-1">
        <button
          className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid"
          onClick={() => updateObject({ angle: toFloat(properties.angle) - 1 })}
        >
          -
        </button>
        <input
          type="number"
          value={toFloat(properties.angle)}
          onChange={(e) => updateObject({ angle: Number(e.target.value) })}
          className="border-solid w-16 px-1 py-0.5 text-center border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid"
          onClick={() => updateObject({ angle: toFloat(properties.angle) + 1 })}
        >
          +
        </button>
        <div className="flex items-center gap-1 ml-1">
          {angleOptions.map(({ value, label }) => (
            <button
              key={value}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid"
              onClick={() => updateObject({ angle: value })}
              title={label}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: `rotate(${value+90}deg)` }}
              >
                <path d="M12 2v20M2 12h20" />
                <path d="M2 12l4-4M2 12l4 4" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default CommonProperties;
