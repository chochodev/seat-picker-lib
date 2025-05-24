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
  // Customization props
  style?: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    showSeatNumbers?: boolean;
    seatNumberStyle?: {
      fontSize?: number;
      fill?: string;
      fontWeight?: string | number;
      fontFamily?: string;
    };
    seatStyle?: {
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      radius?: number;
    };
  };
  // Custom components
  renderToolbar?: (props: { onSave?: CanvasJsonCallback }) => React.ReactNode;
  renderSidebar?: () => React.ReactNode;
  renderSeatDetails?: (props: {
    seat: SeatData;
    onClose: () => void;
    onAction: (action: string) => void;
  }) => React.ReactNode;
  // Custom handlers
  onSeatClick?: (seat: SeatData) => void;
  onSeatAction?: (action: string, seat: SeatData) => void;
  // Custom labels
  labels?: {
    buyButton?: string;
    cancelButton?: string;
    seatNumber?: string;
    category?: string;
    price?: string;
    status?: string;
  };
}

export interface SeatData {
  number?: string;
  price?: number;
  category?: string;
  status?: string;
  currencySymbol?: string;
  currencyCode?: string;
  currencyCountry?: string;
  [key: string]: any; // Allow custom properties
}

export interface ZoneData {
  name?: string;
  description?: string;
  [key: string]: any; // Allow custom properties
}
