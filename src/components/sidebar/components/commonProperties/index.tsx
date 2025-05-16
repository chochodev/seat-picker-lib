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
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Position X
        </label>
        <div className="flex items-center gap-1">
          <button
            className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
            onClick={() => updateObject({ left: toFloat(properties.left) - 1 })}
          >
            -
          </button>
          <input
            type="number"
            value={toFloat(properties.left)}
            onChange={(e) => updateObject({ left: Number(e.target.value) })}
            className="w-16 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
            onClick={() => updateObject({ left: toFloat(properties.left) + 1 })}
          >
            +
          </button>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Position Y
        </label>
        <div className="flex items-center gap-1">
          <button
            className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
            onClick={() => updateObject({ top: toFloat(properties.top) - 1 })}
          >
            -
          </button>
          <input
            type="number"
            value={toFloat(properties.top)}
            onChange={(e) => updateObject({ top: Number(e.target.value) })}
            className="w-16 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
            onClick={() => updateObject({ top: toFloat(properties.top) + 1 })}
          >
            +
          </button>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Width
        </label>
        <div className="flex items-center gap-1">
          <button
            className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
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
            className="w-16 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
            onClick={() =>
              updateObject({ width: toFloat(properties.width ?? 0) + 1 })
            }
          >
            +
          </button>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Height
        </label>
        <div className="flex items-center gap-1">
          <button
            className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
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
            className="w-16 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
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
      <label className="mb-1 block text-xs font-medium text-gray-600">
        Angle
      </label>
      <div className="flex items-center gap-1">
        <button
          className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
          onClick={() => updateObject({ angle: toFloat(properties.angle) - 1 })}
        >
          -
        </button>
        <input
          type="number"
          value={toFloat(properties.angle)}
          onChange={(e) => updateObject({ angle: Number(e.target.value) })}
          className="w-16 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
          onClick={() => updateObject({ angle: toFloat(properties.angle) + 1 })}
        >
          +
        </button>
        <div className="ml-1 flex items-center gap-1">
          {angleOptions.map(({ value, label }) => (
            <button
              key={value}
              className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
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
                style={{ transform: `rotate(${value + 90}deg)` }}
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
