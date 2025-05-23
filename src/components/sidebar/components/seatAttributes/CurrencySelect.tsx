import React, { useEffect, useState } from 'react';
import { LuX } from 'react-icons/lu';

interface CurrencyOption {
  label: string;
  value: string;
  country: string;
  code: string;
  symbol: string;
}

interface CurrencySelectProps {
  value: string;
  onChange: (symbol: string, code: string, country: string) => void;
}

const CurrencySelect: React.FC<CurrencySelectProps> = ({ value, onChange }) => {
  const [options, setOptions] = useState<CurrencyOption[]>([]);
  const [input, setInput] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Fetch currency data from restcountries
    fetch('https://restcountries.com/v3.1/all')
      .then((res) => res.json())
      .then((data) => {
        const opts: CurrencyOption[] = [];
        data.forEach((country: any) => {
          if (country.currencies) {
            Object.entries(country.currencies).forEach(([code, cur]: any) => {
              opts.push({
                label: `${cur.name} (${cur.symbol || code}) - ${country.name.common}`,
                value: cur.symbol || code,
                country: country.name.common,
                code,
                symbol: cur.symbol || code,
              });
            });
          }
        });
        // Remove duplicates by code+country
        const unique = Array.from(
          new Map(opts.map((o) => [o.code + o.country, o])).values()
        );
        setOptions(unique);
      });
  }, []);

  const filtered = input
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(input.toLowerCase()) ||
          o.code.toLowerCase().includes(input.toLowerCase()) ||
          o.symbol.toLowerCase().includes(input.toLowerCase())
      )
    : options;

  const showClear = !!(value || input);

  return (
    <div className="relative">
      <input
        type="text"
        value={input || value}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setShow(true)}
        placeholder="Search currency..."
        className="w-full rounded border border-solid border-gray-300 bg-white px-2 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
      {showClear && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          onClick={() => {
            setInput('');
            onChange('', '', '');
          }}
          tabIndex={-1}
        >
          <LuX size={16} />
        </button>
      )}
      {show && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded border border-solid border-gray-200 bg-white shadow-lg">
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">No results</div>
          )}
          {filtered.slice(0, 30).map((opt) => (
            <div
              key={opt.code + opt.country}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
              onClick={() => {
                onChange(opt.symbol, opt.code, opt.country);
                setInput(`${opt.symbol} - ${opt.country}`);
                setShow(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelect;
