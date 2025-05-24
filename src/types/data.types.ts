// src/types/data.types.ts

// Base type for all canvas objects
export interface CanvasObject {
  type: string;
  version: string;
  objects: CanvasObjectData[];
  background?: string;
  width?: number;
  height?: number;
}

// Types for different object properties
export interface ObjectProperties {
  type: 'circle' | 'rect' | 'i-text' | 'path' | 'group';
  left: number;
  top: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
  opacity: number;
  selectable: boolean;
  evented: boolean;
  hasControls: boolean;
  hasBorders: boolean;
  lockMovementX: boolean;
  lockMovementY: boolean;
  lockRotation: boolean;
  lockScalingX: boolean;
  lockScalingY: boolean;
  lockUniScaling: boolean;
  customType?: 'seat' | 'zone' | 'text';
}

// Circle specific properties (for seats)
export interface CircleObject extends ObjectProperties {
  type: 'circle';
  radius: number;
  startAngle: number;
  endAngle: number;
  customType: 'seat';
  seatData?: {
    id: string;
    number: string;
    row: string;
    section: string;
    status: 'available' | 'reserved' | 'sold';
    price?: number;
    category?: string;
  };
}

// Rectangle specific properties (for zones)
export interface RectangleObject extends ObjectProperties {
  type: 'rect';
  rx: number;
  ry: number;
  customType: 'zone';
  zoneData?: {
    id: string;
    name: string;
    category?: string;
    price?: number;
  };
}

// Text specific properties
export interface TextObject extends ObjectProperties {
  type: 'i-text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string | number;
  customType: 'text';
}

// Union type for all possible object types
export type CanvasObjectData = CircleObject | RectangleObject | TextObject;

// Type for the onChange and onSave callbacks
export type CanvasJsonCallback = (json: CanvasObject) => void;

// Props type for SeatCanvas component
export interface SeatCanvasProps {
  className?: string;
  onChange?: CanvasJsonCallback;
  onSave?: CanvasJsonCallback;
  layout?: CanvasObject;
  readOnly?: boolean;
}
