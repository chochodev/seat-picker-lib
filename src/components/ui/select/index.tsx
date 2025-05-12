import React, { useState, useRef, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ options, value, onChange, placeholder = 'Select an option' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');

  const handleToggle = () => setIsOpen(!isOpen);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(option => option.value === value);

  // :::::::::::::::::::: Set dropdown position based on bottom space
  const calculateDropdownPosition = () => {
    if (selectRef.current) {
      const { bottom } = selectRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // :::::::::::::::::::::: Check if there is enough space below
      if (windowHeight - bottom < 120) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
    }
  }, [isOpen]);

  return (
    <div ref={selectRef} className="relative">
      <div
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
        onClick={handleToggle}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {/* {isOpen && ( */}
      <div className={`absolute z-10 w-full mt-1 bg-white border-solid border border-gray-300 shadow-lg rounded-[8px] overflow-hidden ${dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} ${isOpen? 'opacity-100 user-select-auto visible' : 'select-none user-select-none invisible opacity-0'} ease-250` }>
        <ul className="overflow-auto text-base max-h-60 focus:outline-none sm:text-sm">
          {options.map((option) => (
            <li
              key={option.value}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                value === option.value ? 'bg-gray-100 text-gray-600' : 'text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => handleOptionClick(option.value)}
            >
              <span className="block truncate">{option.label}</span>
              {value === option.value && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600">
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* )} */}
    </div>
  );
};

export default Select;
