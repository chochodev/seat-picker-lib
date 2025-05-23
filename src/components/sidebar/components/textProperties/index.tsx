import { toFloat, PropertiesType } from '@/utils';
// import { toFloat } from '../utils';

interface Properties {
  text: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  strokeWidth?: number;
}

interface TextPropertiesProps {
  properties: Properties;
  updateObject: (updates: Partial<Properties>) => void;
  Select: React.ComponentType<{
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (value: string) => void;
  }>;
}

const fontWeightOptions = [
  { value: '100', label: 'Thin' },
  { value: '200', label: 'Extra Light' },
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' },
];

const fontFamilyOptions = [
  { value: 'sans-serif', label: 'Sans-serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'poppins', label: 'Poppins' },
];

const strokeWidthOptions = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Thin' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Thick' },
  { value: 4, label: 'Extra Thick' },
];

const TextProperties: React.FC<TextPropertiesProps> = ({
  properties,
  updateObject,
  Select,
}) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700">Text</label>
      <input
        type="text"
        value={properties.text}
        onChange={(e) => updateObject({ text: e.target.value })}
        className="mt-1 w-full rounded-md border border-solid border-gray-300 px-2 py-1"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Font Size
      </label>
      <div className="mt-1 flex gap-1 items-center">
        <button
          className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
          onClick={() =>
            updateObject({ fontSize: Number(toFloat(properties.fontSize)) - 1 })
          }
        >
          -
        </button>
        <input
          type="number"
          value={toFloat(properties.fontSize)}
          onChange={(e) => updateObject({ fontSize: Number(e.target.value) })}
          className="w-12 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
          onClick={() =>
            updateObject({ fontSize: Number(toFloat(properties.fontSize)) + 1 })
          }
        >
          +
        </button>
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Font Weight
      </label>
      <Select
        options={fontWeightOptions}
        value={properties.fontWeight}
        onChange={(value) => updateObject({ fontWeight: value })}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Font Family
      </label>
      <Select
        options={fontFamilyOptions}
        value={properties.fontFamily}
        onChange={(value) => updateObject({ fontFamily: value })}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Stroke Width
      </label>
      <Select
        options={strokeWidthOptions.map((option) => ({
          value: option.value.toString(),
          label: option.label,
        }))}
        value={properties.strokeWidth?.toString() || '0'}
        onChange={(value) => updateObject({ strokeWidth: Number(value) })}
      />
    </div>
  </>
);

export default TextProperties;
