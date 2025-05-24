import React$1 from 'react';

declare module 'fabric/fabric-impl' {
    interface Circle {
        attributes?: {
            number?: string | number;
            price?: string | number;
            category?: string;
            status?: string;
            currencySymbol?: string;
            currencyCode?: string;
            currencyCountry?: string;
        };
        seatNumber?: string | number;
        price?: string | number;
        category?: string;
        status?: string;
        currencySymbol?: string;
        currencyCode?: string;
        currencyCountry?: string;
    }
}

interface CanvasObject {
    type: string;
    version: string;
    objects: CanvasObjectData[];
    background?: string;
    width?: number;
    height?: number;
    [key: string]: any;
}
interface ObjectProperties {
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
interface CircleObject extends ObjectProperties {
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
interface RectangleObject extends ObjectProperties {
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
interface TextObject extends ObjectProperties {
    type: 'i-text';
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string | number;
    customType: 'text';
}
type CanvasObjectData = CircleObject | RectangleObject | TextObject;
type CanvasJsonCallback = (json: CanvasObject) => void;
interface SeatCanvasProps {
    className?: string;
    onChange?: CanvasJsonCallback;
    onSave?: (json: CanvasObject) => void;
    layout?: CanvasObject;
    readOnly?: boolean;
    style?: {
        width?: number;
        height?: number;
        backgroundColor?: string;
        showSeatNumbers?: boolean;
        seatNumberStyle?: {
            fontSize?: number;
            fill?: string;
            fontWeight?: string;
            fontFamily?: string;
        };
        seatStyle?: {
            fill?: string;
            stroke?: string;
            strokeWidth?: number;
            radius?: number;
        };
    };
    renderToolbar?: (props: {
        onSave?: (json: CanvasObject) => void;
        onBgLayout?: () => void;
    }) => React.ReactNode;
    renderSidebar?: () => React.ReactNode;
    renderSeatDetails?: (props: {
        seat: SeatData;
        onClose: () => void;
        onAction: (action: string) => void;
    }) => React.ReactNode;
    onSeatClick?: (seat: SeatData) => void;
    onSeatAction?: (action: string, seat: SeatData) => void;
    labels?: {
        buyButton?: string;
        cancelButton?: string;
        seatNumber?: string;
        category?: string;
        price?: string;
        status?: string;
    };
}
interface SeatData {
    number: string | number;
    price: string | number;
    category: string;
    status: string;
    currencySymbol: string;
    currencyCode: string;
    currencyCountry: string;
}
interface ZoneData {
    name?: string;
    description?: string;
    [key: string]: any;
}

declare const SeatPicker: React.FC<SeatCanvasProps>;

interface SeatLayoutRendererProps {
    layout: any;
    style?: {
        width?: number;
        height?: number;
        backgroundColor?: string;
    };
}
declare const SeatLayoutRenderer: React$1.FC<SeatLayoutRendererProps>;

export { type CanvasJsonCallback, type CanvasObject, type CanvasObjectData, type CircleObject, type ObjectProperties, type RectangleObject, type SeatCanvasProps, type SeatData, SeatLayoutRenderer, SeatPicker, type TextObject, type ZoneData };
