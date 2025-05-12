import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { Seat, Zone, Mode, Action, SeatPickerProps } from '../types';
import './SeatPicker.css';

export const SeatPicker: React.FC<SeatPickerProps> = ({
  initialSeats = [],
  initialZones = [],
  onChange,
  onZoneChange,
  width = 800,
  height = 600,
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [toolMode, setToolMode] = useState<Mode>('select');
  const [toolAction, setToolAction] = useState<Action>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isMultipleSeatMode, setIsMultipleSeatMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const newCanvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: '#ffffff',
      });
      setCanvas(newCanvas);
    }

    return () => {
      canvas?.dispose();
    };
  }, []);

  // Initialize seats and setup event listeners
  useEffect(() => {
    if (canvas) {
      // Clear existing objects
      canvas.clear();

      // Add seats to canvas
      seats.forEach((seat) => {
        const circle = new fabric.Circle({
          left: seat.left,
          top: seat.top,
          radius: seat.radius,
          fill: seat.fill,
          stroke: seat.stroke,
          data: { id: seat.id },
        });

        const text = new fabric.Text(seat.text, {
          left: seat.left - seat.radius,
          top: seat.top - seat.radius,
          fontSize: seat.textSize,
          fill: seat.textColor,
        });

        const group = new fabric.Group([circle, text], {
          left: seat.left,
          top: seat.top,
          data: { id: seat.id },
        });

        canvas.add(group);
      });

      // Setup event listeners
      canvas.on('object:added', (e) => {
        if (e.target && 'data' in e.target) {
          const id = (e.target as any).data.id;
          if (id) {
            setSelectedSeatIds([id]);
          }
        }
      });

      canvas.on('object:modified', (e) => {
        if (e.target && 'data' in e.target) {
          const id = (e.target as any).data.id;
          if (id) {
            const obj = e.target as fabric.Object;
            updateSeat(id, {
              left: obj.left || 0,
              top: obj.top || 0,
            });
          }
        }
      });

      canvas.on('selection:created', (e) => {
        const selected = e.selected || [];
        const ids = selected
          .map((obj) => (obj as any).data?.id)
          .filter(Boolean) as string[];
        setSelectedSeatIds(ids);
      });

      canvas.renderAll();
    }
  }, [canvas, seats]);

  const addSeat = (seat: Seat) => {
    const newSeats = [...seats, seat];
    setSeats(newSeats);
    onChange?.(newSeats);
  };

  const updateSeat = (id: string, updates: Partial<Seat>) => {
    const newSeats = seats.map((seat) =>
      seat.id === id ? { ...seat, ...updates } : seat
    );
    setSeats(newSeats);
    onChange?.(newSeats);
  };

  const deleteSeat = (id: string) => {
    const newSeats = seats.filter((seat) => seat.id !== id);
    setSeats(newSeats);
    onChange?.(newSeats);
  };

  const handleToolModeChange = (mode: Mode) => {
    setToolMode(mode);
    if (mode === 'multiple-seat') {
      setIsMultipleSeatMode(true);
    } else {
      setIsMultipleSeatMode(false);
    }
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(50, Math.min(200, zoomLevel + delta));
    setZoomLevel(newZoom);
    if (canvas) {
      canvas.setZoom(newZoom / 100);
      canvas.renderAll();
    }
  };

  return (
    <div className={className} style={style}>
      <div className="toolbar">
        <button onClick={() => handleToolModeChange('select')}>Select</button>
        <button onClick={() => handleToolModeChange('one-seat')}>Add Seat</button>
        <button onClick={() => handleToolModeChange('multiple-seat')}>
          Multiple Seats
        </button>
        <button onClick={() => handleZoom(10)}>Zoom In</button>
        <button onClick={() => handleZoom(-10)}>Zoom Out</button>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
};
