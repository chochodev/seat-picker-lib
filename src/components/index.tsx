import { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import Toolbar from './toolbar';
import Sidebar from './sidebar';
import { useEventGuiStore } from '@/zustand';
import useCanvasSetup from '@/hooks/useCanvasSetup';
import useSelectionHandler from '@/hooks/useSelectionHandler';
import useMultipleSeatCreator from '@/hooks/useMultipleSeatCreator';
import useObjectDeletion from '@/hooks/useObjectDeletion';
import useObjectCreator from '@/hooks/useObjectCreator';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import useUndoRedo from '@/hooks/useUndoRedo';
import { useSmartSnap } from '@/hooks/useSmartSnap';
import '@/index.css';
import '../fabricCustomRegistration';
import { CanvasObject, SeatCanvasProps, SeatData } from '@/types/data.types';
import Modal from './ui/Modal';

const defaultStyle = {
  width: 800,
  height: 600,
  backgroundColor: '#f8fafc',
  showSeatNumbers: true,
  seatNumberStyle: {
    fontSize: 14,
    fill: '#222',
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  seatStyle: {
    fill: 'transparent',
    stroke: 'black',
    strokeWidth: 1,
    radius: 10,
  },
};

const defaultLabels = {
  buyButton: 'Buy Seat',
  cancelButton: 'Cancel',
  seatNumber: 'Seat Number',
  category: 'Category',
  price: 'Price',
  status: 'Status',
};

const SeatPicker: React.FC<SeatCanvasProps> = ({
  className = '',
  onChange,
  onSave,
  layout,
  readOnly = false,
  style = {},
  renderToolbar,
  renderSidebar,
  renderSeatDetails,
  onSeatClick,
  onSeatAction,
  labels = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasParent = useRef<HTMLDivElement>(null);
  const { canvas, setCanvas, toolMode, setToolMode, toolAction, snapEnabled } =
    useEventGuiStore();
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);

  // Merge default styles with custom styles
  const mergedStyle = {
    ...defaultStyle,
    ...style,
    seatNumberStyle: {
      ...defaultStyle.seatNumberStyle,
      ...style.seatNumberStyle,
    },
    seatStyle: {
      ...defaultStyle.seatStyle,
      ...style.seatStyle,
    },
  };

  // Merge default labels with custom labels
  const mergedLabels = {
    ...defaultLabels,
    ...labels,
  };

  useCanvasSetup(
    canvasRef,
    canvasParent,
    setCanvas,
    mergedStyle.width,
    mergedStyle.height,
    mergedStyle.backgroundColor,
    !readOnly
  );
  useSelectionHandler(canvas);
  useMultipleSeatCreator(canvas, toolMode, setToolMode);
  useObjectDeletion(canvas, toolAction);
  useObjectCreator(canvas, toolMode, setToolMode);
  if (!readOnly) {
    useUndoRedo();
    useKeyboardShortcuts(onSave);
    useSmartSnap(canvas, snapEnabled);
  }

  // Load layout if provided
  useEffect(() => {
    if (!canvas || !layout) return;
    canvas.clear();

    // Store handler reference so we can remove it
    let readOnlyMouseDownHandler: ((options: any) => void) | null = null;

    canvas.loadFromJSON(layout, () => {
      if (readOnly) {
        // Label each seat by number if enabled
        if (mergedStyle.showSeatNumbers) {
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
                left:
                  (seat.left ?? 0) +
                  (seat.radius ?? mergedStyle.seatStyle.radius),
                top:
                  (seat.top ?? 0) +
                  (seat.radius ?? mergedStyle.seatStyle.radius),
                ...mergedStyle.seatNumberStyle,
                originX: 'center',
                originY: 'center',
                selectable: false,
                evented: false,
              }
            );
            seat.labelObj = label;
            canvas.add(label);
            canvas.bringToFront(label);
          });
        }

        // Make all objects not selectable/editable, only seats (circles) are clickable
        canvas.getObjects().forEach((obj: any) => {
          obj.selectable = false;
          obj.evented = obj.type === 'circle';
        });
        canvas.selection = false;

        // Add click handler for seats (read-only mode only)
        readOnlyMouseDownHandler = (options) => {
          if (!options.target || options.target.type !== 'circle') return;

          const seat = options.target as any;
          const seatData: SeatData = {
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
          };

          if (onSeatClick) {
            onSeatClick(seatData);
          } else {
            setSelectedSeat(seatData);
          }
        };
        canvas.on('mouse:down', readOnlyMouseDownHandler);
      } else {
        // Remove any previous read-only handler
        if (readOnlyMouseDownHandler) {
          canvas.off('mouse:down', readOnlyMouseDownHandler);
        }
        // Enable selection and make objects selectable in edit mode
        canvas.selection = true;
        canvas.getObjects().forEach((obj: any) => {
          obj.selectable = true;
          obj.evented = true;
        });
        // Debug log to check object properties
        console.log(
          'Edit mode objects:',
          canvas.getObjects().map((obj) => ({
            type: obj.type,
            selectable: obj.selectable,
            evented: obj.evented,
          }))
        );
      }
      canvas.renderAll();
    });

    // Cleanup: always remove the handler when effect cleans up
    return () => {
      if (readOnlyMouseDownHandler) {
        canvas.off('mouse:down', readOnlyMouseDownHandler);
      }
    };
  }, [canvas, layout, readOnly, mergedStyle, onSeatClick]);

  useEffect(() => {
    if (!canvas || readOnly) return;

    const handleCanvasChange = () => {
      if (onChange) {
        const json = {
          type: 'canvas',
          ...canvas.toJSON(['customType', 'seatData', 'zoneData']),
        } as unknown as CanvasObject;
        onChange(json);
      }
    };

    // Listen to all relevant canvas events
    const events = [
      'object:modified',
      'object:added',
      'object:removed',
      'object:moving',
      'object:scaling',
      'object:rotating',
      'object:skewing',
      'path:created',
      'selection:created',
      'selection:updated',
      'selection:cleared',
    ];

    events.forEach((event) => {
      canvas.on(event, handleCanvasChange);
    });

    return () => {
      events.forEach((event) => {
        canvas.off(event, handleCanvasChange);
      });
    };
  }, [canvas, onChange, readOnly]);

  const handleSeatAction = (action: string) => {
    if (selectedSeat) {
      if (onSeatAction) {
        onSeatAction(action, selectedSeat);
      }
      setSelectedSeat(null);
    }
  };

  // Default seat details modal
  const defaultSeatDetails = (
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
                {mergedLabels.seatNumber}
              </label>
              <p className="text-lg font-semibold">{selectedSeat.number}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                {mergedLabels.category}
              </label>
              <p className="text-lg font-semibold">{selectedSeat.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                {mergedLabels.price}
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
                {mergedLabels.status}
              </label>
              <p className="text-lg font-semibold">{selectedSeat.status}</p>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => handleSeatAction('buy')}
              className="flex-1 rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {mergedLabels.buyButton}
            </button>
            <button
              onClick={() => setSelectedSeat(null)}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {mergedLabels.cancelButton}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );

  /**
   * Custom render function for the seat details modal.
   * If provided, this will be used instead of the default modal.
   * To disable the default modal, provide your own renderSeatDetails function.
   *
   * Example usage:
   * <SeatPicker
   *   renderSeatDetails={({ seat, onClose, onAction }) => (
   *     <MyCustomModal seat={seat} onClose={onClose} onAction={onAction} />
   *   )}
   * />
   */
  return (
    <div className={`relative h-full w-full bg-gray-200 ${className}`}>
      {!readOnly &&
        (renderToolbar ? (
          renderToolbar({ onSave: onSave || (() => {}) })
        ) : (
          <Toolbar onSave={onSave || (() => {})} />
        ))}
      <div className="flex h-full w-full justify-between">
        <div
          className="mx-auto h-full w-full max-w-[45rem] bg-gray-100"
          ref={canvasParent}
          style={{ width: mergedStyle.width, height: mergedStyle.height }}
        >
          <canvas ref={canvasRef} />
        </div>
        {!readOnly && (renderSidebar ? renderSidebar() : <Sidebar />)}
      </div>

      {/* Only show the default modal if renderSeatDetails is not provided */}
      {renderSeatDetails
        ? renderSeatDetails({
            seat: selectedSeat!,
            onClose: () => setSelectedSeat(null),
            onAction: handleSeatAction,
          })
        : defaultSeatDetails}
    </div>
  );
};

export default SeatPicker;
