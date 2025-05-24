import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import Modal from '@/components/ui/Modal';

interface SeatDetails {
  number: string | number;
  price: string | number;
  category: string;
  status: string;
  currencySymbol: string;
  currencyCode: string;
  currencyCountry: string;
}

interface SeatLayoutRendererProps {
  layout: any; // JSON object exported from the editor
  style?: { width?: number; height?: number; backgroundColor?: string };
}

const SeatLayoutRenderer: React.FC<SeatLayoutRendererProps> = ({
  layout,
  style = { width: 800, height: 600, backgroundColor: '#f8fafc' },
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<SeatDetails | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const c = new fabric.Canvas(canvasRef.current, {
      width: style.width,
      height: style.height,
      backgroundColor: style.backgroundColor,
      selection: false,
    });
    setCanvas(c);
    return () => {
      c.dispose();
    };
    // eslint-disable-next-line
  }, [style]);

  useEffect(() => {
    if (!canvas || !layout) return;
    canvas.clear();
    canvas.loadFromJSON(layout, () => {
      // Label each seat by number
      canvas.getObjects('circle').forEach((seat: any) => {
        // Remove any previous label
        if (seat.labelObj) {
          canvas.remove(seat.labelObj);
          seat.labelObj = null;
        }
        const label = new fabric.Text(
          seat.attributes?.number?.toString() ||
            seat.seatNumber?.toString() ||
            '',
          {
            left: (seat.left ?? 0) + (seat.radius ?? 0),
            top: (seat.top ?? 0) + (seat.radius ?? 0),
            fontSize: 14,
            fill: '#222',
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            fontWeight: 'bold',
          }
        );
        seat.labelObj = label;
        canvas.add(label);
        canvas.bringToFront(label);
      });

      // Make all objects not selectable/editable, only seats (circles) are clickable
      canvas.getObjects().forEach((obj: any) => {
        obj.selectable = false;
        obj.evented = obj.type === 'circle';
      });
      canvas.selection = false;

      // Add click handler for seats
      canvas.on('mouse:down', (options) => {
        if (!options.target || options.target.type !== 'circle') return;
        const seat = options.target as any;
        setSelectedSeat({
          number: seat.attributes?.number ?? seat.seatNumber ?? '',
          price: seat.attributes?.price ?? seat.price ?? '',
          category: seat.attributes?.category ?? seat.category ?? '',
          status: seat.attributes?.status ?? seat.status ?? '',
          currencySymbol:
            seat.attributes?.currencySymbol ?? seat.currencySymbol ?? '',
          currencyCode:
            seat.attributes?.currencyCode ?? seat.currencyCode ?? '',
          currencyCountry:
            seat.attributes?.currencyCountry ?? seat.currencyCountry ?? '',
        });
      });

      canvas.renderAll();
    });
  }, [canvas, layout]);

  const handleBuy = () => {
    // TODO: Implement buy functionality
    setSelectedSeat(null);
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow">
      <canvas ref={canvasRef} />
      <Modal
        open={!!selectedSeat}
        onClose={() => setSelectedSeat(null)}
        title="Seat Details"
      >
        {selectedSeat && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Seat Number
                </label>
                <p className="text-lg font-semibold">{selectedSeat.number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Category
                </label>
                <p className="text-lg font-semibold">{selectedSeat.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Price
                </label>
                <p className="text-lg font-semibold">
                  {selectedSeat.currencySymbol}
                  {selectedSeat.price}{' '}
                  <span className="text-sm text-gray-500">
                    ({selectedSeat.currencyCode})
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <p className="text-lg font-semibold">{selectedSeat.status}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleBuy}
                className="flex-1 rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Buy Seat
              </button>
              <button
                onClick={() => setSelectedSeat(null)}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SeatLayoutRenderer;
