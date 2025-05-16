import { toFloat, PropertiesType } from '@/utils';
// import { toFloat } from '../utils';
import { Pattern, Gradient } from 'fabric/fabric-impl';
import { useState, useEffect } from 'react';
import { useEventGuiStore } from '@/zustand';

interface Properties {
  width: number;
  height: number;
  fill?: string | Pattern | Gradient;
  stroke?: string | Pattern | Gradient;
  strokeWidth?: number;
}

interface RectanglePropertiesProps {
  properties: Properties;
  updateObject: (updates: Partial<Properties>) => void;
  Select: React.FC<{
    options: { value: number; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }>;
}

const strokeWidthOptions = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Thin' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Thick' },
  { value: 4, label: 'Extra Thick' },
];

const RectangleProperties: React.FC<RectanglePropertiesProps> = ({
  properties,
  updateObject,
  Select,
}) => {
  const [lockAspect, setLockAspect] = useState(true);
  const { canvas } = useEventGuiStore();

  useEffect(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject && canvas.getActiveObject();
    if (activeObject && activeObject.type === 'rect') {
      activeObject.set('lockUniScaling', lockAspect);
      activeObject.setControlsVisibility({
        mt: !lockAspect,
        mb: !lockAspect,
        ml: !lockAspect,
        mr: !lockAspect,
      });
      canvas.renderAll && canvas.renderAll();
    }
  }, [lockAspect, canvas]);

  return (
    <>
      <div className="flex items-center mt-2">
        <input
          type="checkbox"
          checked={lockAspect}
          onChange={(e) => setLockAspect(e.target.checked)}
          className="mr-2"
        />
        <span className="text-xs text-gray-600">Lock aspect ratio</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Stroke Width
        </label>
        <Select
          options={strokeWidthOptions}
          value={properties.strokeWidth?.toString() || '1'}
          onChange={(value) => updateObject({ strokeWidth: Number(value) })}
        />
      </div>
    </>
  );
};

export default RectangleProperties;
