import { toFloat, PropertiesType } from '@/utils';
// import { toFloat } from '../utils';
import React from 'react';
import { Properties as SidebarProperties } from '../../hooks';

interface Properties {
  radius: number | 'mixed';
  seatNumber?: string | 'mixed';
  category?: string | 'mixed';
  price?: number | 'mixed';
  status?: 'available' | 'reserved' | 'sold' | 'mixed';
}

interface CirclePropertiesProps {
  properties: Properties;
  updateObject: (updates: Partial<SidebarProperties>) => void;
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
        className="mt-1 w-full rounded-md border px-2 py-1"
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
        className="mt-1 w-full rounded-md border px-2 py-1"
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
      <label className="block text-sm font-medium text-gray-700">Radius</label>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
            onClick={() => {
              if (typeof properties.radius === 'number') {
                updateObject({ radius: properties.radius - 1 });
              }
            }}
            disabled={properties.radius === 'mixed'}
          >
            -
          </button>
          <input
            type="number"
            value={
              properties.radius === 'mixed' ? '' : toFloat(properties.radius)
            }
            placeholder={properties.radius === 'mixed' ? '—' : ''}
            onChange={(e) => updateObject({ radius: Number(e.target.value) })}
            className="w-12 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100"
            onClick={() => {
              if (typeof properties.radius === 'number') {
                updateObject({ radius: properties.radius + 1 });
              }
            }}
            disabled={properties.radius === 'mixed'}
          >
            +
          </button>
        </div>
        <div className="mb-1 flex items-center gap-1">
          <button
            className={`flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${
              properties.radius === 0 ? 'bg-gray-200' : 'bg-white'
            } transition-colors`}
            onClick={() => updateObject({ radius: 6 })}
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
            className={`flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${
              properties.radius === 4 ? 'bg-gray-200' : 'bg-white'
            } text-xs transition-colors`}
            onClick={() => updateObject({ radius: 8 })}
            title="Small"
          >
            sm
          </button>
          <button
            className={`flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${
              properties.radius === 10 ? 'bg-gray-200' : 'bg-white'
            } text-xs transition-colors`}
            onClick={() => updateObject({ radius: 10 })}
            title="Medium"
          >
            md
          </button>
          <button
            className={`flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${
              properties.radius === 20 ? 'bg-gray-200' : 'bg-white'
            } text-xs transition-colors`}
            onClick={() => updateObject({ radius: 16 })}
            title="Large"
          >
            lg
          </button>
        </div>
      </div>
    </div>
  );
};

export default CircleProperties;
