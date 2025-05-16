import React, { useState } from 'react';
import { useEventGuiStore } from '@/zustand';
import useClipboardActions from '@/hooks/useClipboardActions';
import useUndoRedo from '@/hooks/useUndoRedo';
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
  LuQrCode,
} from 'react-icons/lu';
import { RiText, RiShapeLine, RiApps2AddLine } from 'react-icons/ri';

const Toolbar: React.FC = () => {
  const {
    zoomLevel,
    setZoomLevel,
    toolMode,
    setToolMode,
    toolAction,
    setToolAction,
  } = useEventGuiStore();

  const { copySelectedObjects, cutSelectedObjects, pasteObjects } =
    useClipboardActions();
  const { undo, redo } = useUndoRedo();

  // ::::::::::::::::::: Function: toggle create multiple seats mode
  const toggleMultipleSeatMode = () => {
    setToolMode(toolMode === 'multiple-seat' ? 'select' : 'multiple-seat');
  };

  // ::::::::::::::::::: Buttons data
  const buttonGroups = [
    { icon: LuFile, tooltip: 'New File', onClick: () => {}, state: false },
    {
      icon: LuFolderOpen,
      tooltip: 'Open File',
      onClick: () => {},
      state: false,
    },
    { icon: LuSave, tooltip: 'Save File', onClick: () => {}, state: false },
    {
      icon: LuMousePointer,
      tooltip: 'Select',
      onClick: () => {
        setToolMode('select');
      },
      state: toolMode === 'select',
    },
    { icon: LuGrid2X2, tooltip: 'Grid View', onClick: () => {}, state: false },
    {
      icon: LuLayoutDashboard,
      tooltip: 'Layout View',
      onClick: () => {},
      state: false,
    },
    {
      icon: RiText,
      tooltip: 'Add Text',
      onClick: () => {
        setToolMode('text');
      },
      state: toolMode === 'text',
    },
    {
      icon: RiShapeLine,
      tooltip: 'Add Square',
      onClick: () => {
        setToolMode('shape-square');
      },
      state: toolMode === 'shape-square',
    },
    {
      icon: LuPlus,
      tooltip: 'Add Seat',
      onClick: () => {
        setToolMode('one-seat');
      },
      state: toolMode === 'one-seat',
    },
    {
      icon: RiApps2AddLine,
      tooltip: 'Add Rows',
      onClick: toggleMultipleSeatMode,
      state: toolMode === 'multiple-seat',
    },
    { icon: LuUndo, tooltip: 'Undo', onClick: undo, state: false },
    { icon: LuRedo, tooltip: 'Redo', onClick: redo, state: false },
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
      onClick: () => {
        setToolAction('delete');
      },
      state: false, // toolAction === 'delete'
    },
  ];

  return (
    <div className="sticky top-0 left-0 z-[200] flex items-center gap-1 w-full bg-white px-[1rem] py-[0.5rem] shadow">
      {buttonGroups.map((item, index) => (
        <React.Fragment key={index}>
          {/* :::::::::::::: add seperator */}
          {[6, 10, 12].includes(index) && (
            <Separator key={`seperator-${index}`} />
          )}

          {/* :::::::::::::: add space */}
          {3 === index && <div className="flex-1" key={`space-${index}`} />}

          {/* ::::::::::::::: buttons */}
          <Button
            key={`button-${index}`}
            icon={<item.icon className="h-4 w-4" />}
            tooltip={item.tooltip}
            onClick={item.onClick}
            state={item.state}
          />
        </React.Fragment>
      ))}

      {/* :::::::::::::: add seperator */}
      <Separator />

      {/* :::::::::::::: zoom button */}
      <Button
        icon={<LuZoomOut className="h-4 w-4" />}
        tooltip="Zoom Out"
        onClick={() => setZoomLevel(zoomLevel - 10)}
      />
      <div className="flex items-center justify-center w-12 h-8 text-sm font-medium">
        {zoomLevel}%
      </div>
      <Button
        icon={<LuZoomIn className="h-4 w-4" />}
        tooltip="Zoom In"
        onClick={() => setZoomLevel(zoomLevel + 10)}
      />

      {/* ::::::::::::::: add space */}
      <div className="flex-1" />

      {/* ::::::::::::::: qr code button */}
      <Button icon={<LuQrCode className="h-4 w-4" />} tooltip="QR Code" />
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
        className={`p-2 rounded-md hover:bg-gray-200/60 ${
          state ? 'ring-1 ring-gray-400 shadow-sm shadow-gray-400' : ''
        } active:bg-gray-200 ease-250 `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        {...props}
      >
        {icon}
      </button>

      <div
        className={`absolute left-1/2 transform -translate-x-1/2 ${
          showTooltip
            ? 'top-[calc(100%+0.5rem)] opacity-100'
            : 'top-[100%] opacity-0'
        } px-2 py-1 bg-gray-200 text-gray-900 text-[0.625rem] rounded whitespace-nowrap shadow-md ease-250`}
      >
        {tooltip}
      </div>
    </div>
  );
};

const Separator: React.FC = () => (
  <div className="w-px h-6 bg-gray-300 mx-[1rem] " />
);
