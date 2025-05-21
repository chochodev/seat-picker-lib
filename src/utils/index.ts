import { Pattern, Gradient } from 'fabric/fabric-impl';

// :::::::::::::::::::: Converts number to float conditionally
export const toFloat = (num: any) => {
  if (typeof num !== 'number' || isNaN(num)) return '';
  return num % 1 !== 0 ? Number(num.toFixed(2)) : num;
};

// ::::::::::::::::::: Object Properties type
export interface PropertiesType {
  angle?: number;
  radius?: number;
  width?: number;
  height?: number;
  fill?: string | Pattern | Gradient | undefined;
  stroke?: string | Pattern | Gradient | undefined;
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  left?: number;
  top?: number;
}
