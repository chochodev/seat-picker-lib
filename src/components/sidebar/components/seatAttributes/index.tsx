import React from 'react';
import { Properties } from '../../hooks';

interface SeatAttributesProps {
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

const SeatAttributes: React.FC<SeatAttributesProps> = ({
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

export default SeatAttributes;
