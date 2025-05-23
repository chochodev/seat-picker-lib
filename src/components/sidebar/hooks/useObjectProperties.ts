import { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { Pattern, Gradient } from 'fabric/fabric-impl';
import { CustomFabricObject } from '@/types/fabric-types';

export interface Properties {
  angle: number;
  radius: number | 'mixed';
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
  seatNumber?: string | 'mixed';
  category?: string | 'mixed';
  price?: number | 'mixed';
  status?: 'available' | 'reserved' | 'sold' | 'mixed';
  currencySymbol?: string | 'mixed';
  currencyCode?: string | 'mixed';
  currencyCountry?: string | 'mixed';
}

export const useObjectProperties = (
  canvas: fabric.Canvas | null,
  selectedObjects: CustomFabricObject[]
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

  function getMergedValue<T>(objs: any[], key: string) {
    if (objs.length === 0) return '';
    const first = objs[0][key];
    return objs.every((obj) => obj[key] === first) ? first : 'mixed';
  }

  useEffect(() => {
    if (!selectedObjects || selectedObjects.length === 0) return;
    const objs = selectedObjects;
    setProperties({
      angle: getMergedValue(objs, 'angle'),
      radius: getMergedValue(objs, 'radius'),
      width:
        getMergedValue(objs, 'width') * (getMergedValue(objs, 'scaleX') || 1),
      height:
        getMergedValue(objs, 'height') * (getMergedValue(objs, 'scaleY') || 1),
      fill: getMergedValue(objs, 'fill'),
      stroke: getMergedValue(objs, 'stroke'),
      text: getMergedValue(objs, 'text'),
      fontSize: getMergedValue(objs, 'fontSize'),
      fontWeight: getMergedValue(objs, 'fontWeight'),
      fontFamily: getMergedValue(objs, 'fontFamily'),
      left: getMergedValue(objs, 'left'),
      top: getMergedValue(objs, 'top'),
      rx: getMergedValue(objs, 'rx'),
      ry: getMergedValue(objs, 'ry'),
      seatNumber: getMergedValue(objs, 'seatNumber'),
      category: getMergedValue(objs, 'category'),
      price: getMergedValue(objs, 'price'),
      status: getMergedValue(objs, 'status'),
      currencySymbol: getMergedValue(objs, 'currencySymbol'),
      currencyCode: getMergedValue(objs, 'currencyCode'),
      currencyCountry: getMergedValue(objs, 'currencyCountry'),
    });
  }, [selectedObjects]);

  return { properties, setProperties };
};
