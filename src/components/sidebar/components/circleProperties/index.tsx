import { toFloat, PropertiesType } from '@/utils';
// import { toFloat } from '../utils';
import React from 'react';

interface Properties {
  radius: number;
  seatNumber?: string;
  category?: string;
  price?: number;
  status?: 'available' | 'reserved' | 'sold';
}

interface CirclePropertiesProps {
  properties: Properties;
  updateObject: (updates: Partial<Properties>) => void;
  Select: React.FC<{
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }>;
}

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold', label: 'Sold' },
];

const categoryOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'vip', label: 'VIP' },
  { value: 'premium', label: 'Premium' },
];

const SeatAttributes: React.FC<CirclePropertiesProps> = ({
  properties,
  updateObject,
  Select,
}) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Seat Number
      </label>
      <input
        type="text"
        value={properties.seatNumber || ''}
        onChange={(e) => updateObject({ seatNumber: e.target.value })}
        className="mt-1 px-2 py-1 w-full border rounded-md"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Category
      </label>
      <Select
        options={categoryOptions}
        value={properties.category || 'standard'}
        onChange={(value) => updateObject({ category: value })}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Price</label>
      <input
        type="number"
        value={properties.price || 0}
        onChange={(e) => updateObject({ price: Number(e.target.value) })}
        className="mt-1 px-2 py-1 w-full border rounded-md"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Status</label>
      <Select
        options={statusOptions}
        value={properties.status || 'available'}
        onChange={(value) =>
          updateObject({ status: value as Properties['status'] })
        }
      />
    </div>
  </div>
);

const CircleProperties: React.FC<CirclePropertiesProps> = ({
  properties,
  updateObject,
  Select,
}) => {
  const [activeTab, setActiveTab] = React.useState<'basic' | 'attributes'>(
    'basic'
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          className={`px-3 py-1.5 text-sm font-medium ${
            activeTab === 'basic'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('basic')}
        >
          Properties
        </button>
        <button
          className={`px-3 py-1.5 text-sm font-medium ${
            activeTab === 'attributes'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('attributes')}
        >
          Attributes
        </button>
      </div>

      {activeTab === 'basic' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Radius
          </label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded border border-gray-200 border-solid text-xs transition-colors"
                onClick={() =>
                  updateObject({ radius: toFloat(properties.radius) - 1 })
                }
              >
                -
              </button>
              <input
                type="number"
                value={toFloat(properties.radius)}
                onChange={(e) =>
                  updateObject({ radius: Number(e.target.value) })
                }
                className="w-12 px-1 py-0.5 text-center border border-gray-200 border-solid rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded border border-gray-200 border-solid text-xs transition-colors"
                onClick={() =>
                  updateObject({ radius: toFloat(properties.radius) + 1 })
                }
              >
                +
              </button>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <button
                className={`w-6 h-6 flex items-center justify-center rounded border border-gray-200 border-solid ${
                  properties.radius === 0 ? 'bg-gray-200' : 'bg-white'
                } transition-colors`}
                onClick={() => updateObject({ radius: 0 })}
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
                className={`w-6 h-6 flex items-center justify-center rounded border border-gray-200 border-solid ${
                  properties.radius === 4 ? 'bg-gray-200' : 'bg-white'
                } transition-colors text-xs`}
                onClick={() => updateObject({ radius: 4 })}
                title="Small"
              >
                sm
              </button>
              <button
                className={`w-6 h-6 flex items-center justify-center rounded border border-gray-200 border-solid ${
                  properties.radius === 10 ? 'bg-gray-200' : 'bg-white'
                } transition-colors text-xs`}
                onClick={() => updateObject({ radius: 10 })}
                title="Medium"
              >
                md
              </button>
              <button
                className={`w-6 h-6 flex items-center justify-center rounded border border-gray-200 border-solid ${
                  properties.radius === 20 ? 'bg-gray-200' : 'bg-white'
                } transition-colors text-xs`}
                onClick={() => updateObject({ radius: 20 })}
                title="Large"
              >
                lg
              </button>
            </div>
          </div>
        </div>
      ) : (
        <SeatAttributes
          properties={properties}
          updateObject={updateObject}
          Select={Select}
        />
      )}
    </div>
  );
};

export default CircleProperties;
