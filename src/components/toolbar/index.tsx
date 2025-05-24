import React, { useState, useEffect } from 'react';
import { useEventGuiStore } from '@/zustand';
import useClipboardActions from '@/hooks/useClipboardActions';
import useUndoRedo from '@/hooks/useUndoRedo';
import { useLockSelection } from '@/hooks/useLockSelection';
import {
  LuFile,
  LuFolderOpen,
  LuSave,
  LuMousePointer,
  LuClipboardCheck,
  LuLayoutDashboard,
  LuPlus,
  LuGrid2X2,
  LuUndo,
  LuRedo,
  LuScissors,
  LuCopy,
  LuTrash2,
  LuZoomIn,
  LuZoomOut,
  LuLock,
  LuDownload,
} from 'react-icons/lu';
import {
  RiText,
  RiShapeLine,
  RiApps2AddLine,
  RiLockUnlockLine,
} from 'react-icons/ri';
import { ExportModal, OpenFileModal } from '@/components/modals';
import Toast from '@/components/ui/Toast';
import { applyCustomStyles } from '@/components/createObject/applyCustomStyles';
import { CanvasObject } from '@/types/data.types';

interface ToolbarProps {
  onSave?: (json: any) => void;
  onBgLayout?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onSave, onBgLayout }) => {
  const {
    toolMode,
    setToolMode,
    toolAction,
    setToolAction,
    canvas,
    snapEnabled,
    setSnapEnabled,
  } = useEventGuiStore();

  const [zoomLevel, setZoomLevel] = useState(100);

  const { copySelectedObjects, cutSelectedObjects, pasteObjects } =
    useClipboardActions();
  const { undo, redo } = useUndoRedo();

  const { isSelectionLocked, toggleLockSelection } = useLockSelection(canvas);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileName, setExportFileName] = useState('seats.json');
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [openFile, setOpenFile] = useState<File | null>(null);
  const [openFileError, setOpenFileError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>(
    'info'
  );

  // Update canvas zoom when zoomLevel changes
  useEffect(() => {
    if (!canvas) return;

    const zoom = zoomLevel / 100;
    canvas.setZoom(zoom);

    // Always center the canvas content in the viewport after zoom
    const viewportWidth = canvas.getWidth();
    const viewportHeight = canvas.getHeight();
    const contentWidth = canvas.width! * zoom;
    const contentHeight = canvas.height! * zoom;

    canvas.absolutePan({
      x: (viewportWidth - contentWidth) / 2,
      y: (viewportHeight - contentHeight) / 2,
    });

    canvas.renderAll();
  }, [zoomLevel, canvas]);

  // Export handler
  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFileName.endsWith('.json')
      ? exportFileName
      : exportFileName + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  // ::::::::::::::::::: Function: toggle create multiple seats mode
  const toggleMultipleSeatMode = () => {
    setToolMode(toolMode === 'multiple-seat' ? 'select' : 'multiple-seat');
  };

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setOpenFile(file);
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setOpenFile(e.dataTransfer.files[0]);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle open file submit
  const handleOpenFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canvas || !openFile) return;
    try {
      const text = await openFile.text();
      const json = JSON.parse(text);
      canvas.loadFromJSON(json, () => {
        canvas.getObjects().forEach((obj) => {
          if (
            obj.type === 'circle' ||
            obj.type === 'rect' ||
            obj.type === 'i-text'
          ) {
            applyCustomStyles(obj);
          }
        });
        canvas.renderAll();
        setShowOpenModal(false);
        setOpenFile(null);
        setToastMsg('Seating arrangement loaded!');
        setToastType('success');
        setShowToast(true);
      });
    } catch (err) {
      setOpenFileError(
        'Invalid JSON file. Please select a valid seating arrangement file.'
      );
      setToastMsg('Invalid JSON file.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 10, 120)); // Max zoom 120%
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 10, 80)); // Min zoom 80%
  };

  // ::::::::::::::::::: Buttons data
  const buttonGroups = [
    [
      {
        icon: LuFolderOpen,
        tooltip: 'Open File',
        onClick: () => setShowOpenModal(true),
        state: false,
      },
      {
        icon: LuSave,
        tooltip: 'Save',
        onClick: () => {
          if (canvas && onSave) {
            const json = {
              type: 'canvas',
              ...canvas.toJSON(['customType', 'seatData', 'zoneData']),
            } as unknown as CanvasObject;
            onSave(json);
          }
        },
        state: false,
      },
      {
        icon: LuDownload,
        tooltip: 'Download',
        onClick: () => setShowExportModal(true),
        state: false,
      },
    ],
    [
      {
        icon: LuMousePointer,
        tooltip: 'Select',
        onClick: () => setToolMode('select'),
        state: toolMode === 'select',
      },
      {
        icon: LuGrid2X2,
        tooltip: snapEnabled ? 'Remove Grid' : 'Smart Grid',
        onClick: () => setSnapEnabled(!snapEnabled),
        state: snapEnabled,
      },
      {
        icon: LuLayoutDashboard,
        tooltip: 'Layout View',
        onClick: onBgLayout,
        state: false,
      },
    ],
    [
      {
        icon: RiText,
        tooltip: 'Add Text',
        onClick: () => setToolMode('text'),
        state: toolMode === 'text',
      },
      {
        icon: RiShapeLine,
        tooltip: 'Add Square',
        onClick: () => setToolMode('shape-square'),
        state: toolMode === 'shape-square',
      },
      {
        icon: LuPlus,
        tooltip: 'Add Seat',
        onClick: () => setToolMode('one-seat'),
        state: toolMode === 'one-seat',
      },
      {
        icon: RiApps2AddLine,
        tooltip: 'Add Rows',
        onClick: toggleMultipleSeatMode,
        state: toolMode === 'multiple-seat',
      },
    ],
    [
      { icon: LuUndo, tooltip: 'Undo', onClick: undo, state: false },
      { icon: LuRedo, tooltip: 'Redo', onClick: redo, state: false },
    ],
    [
      {
        icon: LuScissors,
        tooltip: 'Cut',
        onClick: cutSelectedObjects,
        state: toolAction === 'cut',
      },
      {
        icon: LuCopy,
        tooltip: 'Copy',
        onClick: copySelectedObjects,
        state: toolAction === 'copy',
      },
      {
        icon: LuClipboardCheck,
        tooltip: 'Paste',
        onClick: pasteObjects,
        state: toolAction === 'paste',
      },
      {
        icon: LuTrash2,
        tooltip: 'Delete',
        onClick: () => setToolAction('delete'),
        state: false,
      },
    ],
  ];

  return (
    <div className="fixed left-0 top-0 z-[200] flex w-full items-center justify-center gap-1 bg-white px-[1rem] py-[0.5rem] shadow">
      {/* :::::::::::::::: add space */}
      <div className="flex-1" />

      {buttonGroups.map((group, groupIdx) => (
        <React.Fragment key={groupIdx}>
          {groupIdx > 0 && <Separator />}
          {group.map((item, idx) => (
            <Button
              key={`button-${groupIdx}-${idx}`}
              icon={<item.icon className="h-4 w-4" />}
              tooltip={item.tooltip}
              onClick={item.onClick}
              state={item.state}
            />
          ))}
        </React.Fragment>
      ))}

      {/* :::::::::::::: add seperator */}
      <Separator />

      {/* :::::::::::::: zoom button */}
      <Button
        icon={<LuZoomOut className="h-4 w-4" />}
        tooltip="Zoom Out"
        onClick={handleZoomOut}
      />
      <div className="flex h-8 w-12 items-center justify-center text-sm font-medium">
        {zoomLevel}%
      </div>
      <Button
        icon={<LuZoomIn className="h-4 w-4" />}
        tooltip="Zoom In"
        onClick={handleZoomIn}
      />

      {/* ::::::::::::::: add space */}
      <div className="flex-1" />

      {/* ::::::::::::::: Lock/Unlock button */}
      <Button
        icon={
          isSelectionLocked() ? (
            <LuLock className="h-4 w-4" />
          ) : (
            <RiLockUnlockLine className="h-4 w-4" />
          )
        }
        tooltip={isSelectionLocked() ? 'Unlock Selection' : 'Lock Selection'}
        onClick={toggleLockSelection}
      />

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        fileName={exportFileName}
        setFileName={setExportFileName}
        onExport={handleExport}
      />

      {/* Open File Modal */}
      <OpenFileModal
        open={showOpenModal}
        onClose={() => {
          setShowOpenModal(false);
          setOpenFile(null);
          setOpenFileError('');
        }}
        file={openFile}
        setFile={setOpenFile}
        error={openFileError}
        onFileChange={handleFileChange}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onSubmit={handleOpenFile}
      />

      {/* Toast */}
      <Toast
        open={showToast}
        message={toastMsg}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default Toolbar;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  tooltip: string;
  state?: boolean;
}

const Button: React.FC<ButtonProps> = ({ icon, tooltip, state, ...props }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        className={`rounded-md p-2 hover:bg-gray-200/60 ${
          state ? 'shadow-sm shadow-gray-400 ring-1 ring-gray-400' : ''
        } ease-250 active:bg-gray-200 `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        {...props}
      >
        {icon}
      </button>

      <div
        className={`absolute left-1/2 -translate-x-1/2 transform ${
          showTooltip
            ? 'top-[calc(100%+0.5rem)] opacity-100'
            : 'top-[100%] opacity-0'
        } ease-250 whitespace-nowrap rounded bg-gray-200 px-2 py-1 text-[0.625rem] text-gray-900 shadow-md`}
      >
        {tooltip}
      </div>
    </div>
  );
};

const Separator: React.FC = () => (
  <div className="mx-[1rem] h-6 w-px bg-gray-300 " />
);
