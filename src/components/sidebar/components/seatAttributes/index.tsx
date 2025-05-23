import React, { useState } from 'react';
import { Properties } from '../../hooks';
import { useEventGuiStore } from '@/zustand';
import CurrencySelect from './CurrencySelect';

interface SeatAttributesProps {
  properties: Properties;
  updateObject: (updates: Partial<Properties>) => void;
  Select: React.FC<{
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }>;
  selectedObjects?: any[];
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
}) => {
  const { canvas } = useEventGuiStore();
  const [error, setError] = useState('');

  // Helper to check if a seat number is unique
  function isSeatNumberUnique(num: string) {
    if (!canvas || !num) return true;
    const allSeats = canvas.getObjects('circle');
    return !allSeats.some(
      (obj: any) => obj.seatNumber === num && obj !== canvas.getActiveObject()
    );
  }

  function handleSeatNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value && !isSeatNumberUnique(value)) {
      setError('Seat number already used');
    } else {
      setError('');
      updateObject({ seatNumber: value });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Seat Number
        </label>
        <input
          type="text"
          value={
            properties.seatNumber === 'mixed' ? '' : properties.seatNumber || ''
          }
          placeholder={properties.seatNumber === 'mixed' ? '—' : ''}
          onChange={handleSeatNumberChange}
          className="mt-1 w-full rounded-md border border-solid border-gray-300 px-2 py-1"
        />
        {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Category
        </label>
        <Select
          options={categoryOptions}
          value={
            properties.category === 'mixed'
              ? ''
              : properties.category || 'standard'
          }
          onChange={(value) => updateObject({ category: value })}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Price
        </label>
        <input
          type="number"
          value={properties.price === 'mixed' ? '' : properties.price || 0}
          placeholder={properties.price === 'mixed' ? '—' : ''}
          onChange={(e) => updateObject({ price: Number(e.target.value) })}
          className="mt-1 w-full rounded-md border border-solid border-gray-300 px-2 py-1"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Status
        </label>
        <Select
          options={statusOptions}
          value={
            properties.status === 'mixed'
              ? ''
              : properties.status || 'available'
          }
          onChange={(value) =>
            updateObject({ status: value as Properties['status'] })
          }
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Currency
        </label>
        <CurrencySelect
          value={properties.currencySymbol || ''}
          onChange={(symbol, code, country) =>
            updateObject({
              currencySymbol: symbol,
              currencyCode: code,
              currencyCountry: country,
            })
          }
        />
      </div>
    </div>
  );
};

export default SeatAttributes;
