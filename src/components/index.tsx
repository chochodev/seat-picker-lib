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
import Modal, { DefaultSeatModal } from './ui/Modal';

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
  const bgInputRef = useRef<HTMLInputElement>(null);
  const { canvas, setCanvas, toolMode, setToolMode, toolAction, snapEnabled } =
    useEventGuiStore();
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgOpacity] = useState(0.3);

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

  // Handle background image upload
  const handleBgImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBgImage(e.target?.result as string);
      if (canvas && canvas.getElement && canvas.getElement()) {
        fabric.Image.fromURL(e.target?.result as string, (img) => {
          img.set({ opacity: bgOpacity });

          // Calculate scale to fit while maintaining aspect ratio
          const canvasRatio = canvas.width! / canvas.height!;
          const imgRatio = img.width! / img.height!;

          let scaleX, scaleY;
          if (imgRatio > canvasRatio) {
            // Image is wider than canvas
            scaleX = canvas.width! / img.width!;
            scaleY = scaleX;
          } else {
            // Image is taller than canvas
            scaleY = canvas.height! / img.height!;
            scaleX = scaleY;
          }

          // Center the image
          const scaledWidth = img.width! * scaleX;
          const scaledHeight = img.height! * scaleY;
          const left = (canvas.width! - scaledWidth) / 2;
          const top = (canvas.height! - scaledHeight) / 2;

          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX,
            scaleY,
            left,
            top,
          });
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove background image
  const handleRemoveBgImage = () => {
    setBgImage(null);
    if (canvas && canvas.getElement && canvas.getElement()) {
      canvas.setBackgroundImage(null as any, canvas.renderAll.bind(canvas));
    }
  };

  // Keep background image in sync with canvas
  useEffect(() => {
    if (bgImage && canvas && canvas.getElement && canvas.getElement()) {
      fabric.Image.fromURL(bgImage, (img) => {
        img.set({ opacity: bgOpacity });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width! / img.width!,
          scaleY: canvas.height! / img.height!,
        });
      });
    }
    if (!bgImage && canvas && canvas.getElement && canvas.getElement()) {
      canvas.setBackgroundImage(null as any, canvas.renderAll.bind(canvas));
    }
  }, [bgImage, canvas, bgOpacity]);

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

    // Remove background image if present when layout changes
    setBgImage(null);
    canvas.setBackgroundImage(null as any, canvas.renderAll.bind(canvas));
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

  // Save handler that excludes background image from saved file
  const handleSave = () => {
    if (!canvas || !onSave) return;
    // Temporarily remove background image
    const currentBg = canvas.backgroundImage;
    canvas.setBackgroundImage(null as any, canvas.renderAll.bind(canvas), {
      dirty: false,
    });
    const json = {
      type: 'canvas',
      ...canvas.toJSON(['customType', 'seatData', 'zoneData']),
    } as unknown as CanvasObject;
    // Restore background image
    if (currentBg) {
      canvas.setBackgroundImage(currentBg, canvas.renderAll.bind(canvas));
    }
    onSave(json);
  };

  // Default seat details modal
  const defaultSeatDetails = (
    <DefaultSeatModal
      selectedSeat={selectedSeat}
      setSelectedSeat={setSelectedSeat}
      mergedLabels={mergedLabels}
      handleSeatAction={handleSeatAction}
    />
  );

  return (
    <div
      className={`relative flex h-full w-full flex-col bg-gray-200 ${className}`}
    >
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={bgInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleBgImageUpload(e.target.files[0]);
          }
        }}
      />
      {!readOnly &&
        (renderToolbar ? (
          renderToolbar({
            onSave: handleSave,
            onBgLayout: () => {
              if (bgImage) {
                handleRemoveBgImage();
              } else {
                bgInputRef.current?.click();
              }
            },
          })
        ) : (
          <Toolbar
            onSave={handleSave}
            onBgLayout={() => {
              if (bgImage) {
                handleRemoveBgImage();
              } else {
                bgInputRef.current?.click();
              }
            }}
          />
        ))}
      <div className="flex h-0 w-full flex-1 overflow-hidden pt-12">
        <div
          className="m-auto flex flex-1 items-center justify-center overflow-auto bg-gray-100"
          ref={canvasParent}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: mergedStyle.width,
            maxHeight: mergedStyle.height,
          }}
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
