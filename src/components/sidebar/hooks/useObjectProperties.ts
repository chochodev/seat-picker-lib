import { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { Pattern, Gradient } from 'fabric/fabric-impl';
import { CustomFabricObject } from '@/types/fabric-types';

export interface Properties {
  angle: number;
  radius: number;
  width: number;
  height: number;
  fill: string | Pattern | Gradient | undefined;
  stroke: string | Pattern | Gradient | undefined;
  text: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  left: number;
  top: number;
  rx?: number;
  ry?: number;
  seatNumber?: string;
  category?: string;
  price?: number;
  status?: 'available' | 'reserved' | 'sold';
}

export const useObjectProperties = (
  canvas: fabric.Canvas | null,
  selectedObject: CustomFabricObject | null
) => {
  // ::::::::::::::::::: Properties state
  const [properties, setProperties] = useState<Properties>({
    angle: 0,
    radius: 10,
    width: 100,
    height: 100,
    fill: 'transparent' as string | undefined,
    stroke: '#000000' as string | undefined,
    text: '',
    fontSize: 20,
    fontWeight: 'normal',
    fontFamily: 'sans-serif',
    left: 0,
    top: 0,
  });

  // ::::::::::::::::::::::: Listen for object selection
  useEffect(() => {
    if (!selectedObject) return;

    setProperties({
      angle: selectedObject.angle || 0,
      radius:
        (selectedObject as any).radius * (selectedObject as any).scaleX || 10,
      width: (selectedObject.width ?? 100) * (selectedObject.scaleX ?? 1),
      height: (selectedObject.height ?? 100) * (selectedObject.scaleY ?? 1),

      // ::::::::::: fill
      fill: selectedObject.fill
        ? String(selectedObject.fill).toUpperCase() === 'BLACK'
          ? '#000000'
          : String(selectedObject.fill)
        : 'transparent',

      // ::::::::::: stroke
      stroke: selectedObject.stroke
        ? Number(selectedObject.stroke) === 1
          ? '#000000'
          : String(selectedObject.stroke)
        : '#000000',

      text: (selectedObject as any).text || '',
      fontSize: (selectedObject as any).fontSize || 20,
      fontWeight: (selectedObject as any).fontWeight || 'normal',
      fontFamily: (selectedObject as any).fontFamily || 'sans-serif',
      left: selectedObject.left || 0,
      top: selectedObject.top || 0,
      rx: (selectedObject as any).rx ?? 0,
      ry: (selectedObject as any).ry ?? 0,
      seatNumber: (selectedObject as any).seatNumber || '',
      category: (selectedObject as any).category || '',
      price: (selectedObject as any).price || undefined,
      status: (selectedObject as any).status || 'available',
    });
  }, [selectedObject]);

  return { properties, setProperties };
};
