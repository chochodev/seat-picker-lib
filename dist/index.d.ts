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
    onSave?: CanvasJsonCallback;
    layout?: CanvasObject;
    readOnly?: boolean;
}

declare const SeatCanvas: React.FC<SeatCanvasProps>;

interface SeatLayoutRendererProps {
    layout: any;
    style?: {
        width?: number;
        height?: number;
        backgroundColor?: string;
    };
}
declare const SeatLayoutRenderer: React$1.FC<SeatLayoutRendererProps>;

export { type CanvasJsonCallback, type CanvasObject, type CanvasObjectData, type SeatCanvasProps, SeatLayoutRenderer, SeatCanvas as SeatPicker };
