import { fabric } from 'fabric';

export interface Seat {
  id: string;
  left: number;
  top: number;
  radius: number;
  fill: string;
  stroke: string;
  text: string;
  textSize: number;
  textColor: string;
}

export interface Zone {
  id: string;
  name: string;
  isChecked: boolean;
}

export type Mode = 'select' | 'one-seat' | 'multiple-seat' | 'shape-square' | 'text';
export type Action = null | 'delete' | 'copy' | 'cut' | 'paste';

export interface SeatPickerProps {
  initialSeats?: Seat[];
  initialZones?: Zone[];
  onChange?: (seats: Seat[]) => void;
  onZoneChange?: (zones: Zone[]) => void;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
} 