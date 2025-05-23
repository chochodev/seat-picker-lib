import React from 'react';
import Modal from '@/components/ui/Modal';

// Export Modal
export const ExportModal: React.FC<{
  open: boolean;
  onClose: () => void;
  fileName: string;
  setFileName: (name: string) => void;
  onExport: (e: React.FormEvent) => void;
}> = ({ open, onClose, fileName, setFileName, onExport }) => (
  <Modal open={open} onClose={onClose} title="Export as JSON">
    <form onSubmit={onExport} className="flex flex-col gap-4">
      <label className="text-sm font-medium text-gray-700">File Name</label>
      <input
        type="text"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        className="rounded-md border border-gray-300 border-solid bg-gray-100 px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
        placeholder="seats.json"
        required
      />
      <button
        type="submit"
        className="rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        Export
      </button>
    </form>
  </Modal>
);

// Open File Modal
export const OpenFileModal: React.FC<{
  open: boolean;
  onClose: () => void;
  file: File | null;
  setFile: (file: File | null) => void;
  error: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({
  open,
  onClose,
  file,
  setFile,
  error,
  onFileChange,
  onDrop,
  onDragOver,
  onSubmit,
}) => (
  <Modal
    open={open}
    onClose={() => {
      onClose();
      setFile(null);
    }}
    title="Open Seating Arrangement"
  >
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="text-sm font-medium text-gray-700">
        Select or drag a JSON file
      </label>
      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed ${error ? 'border-red-400' : 'border-gray-300'} bg-gray-100 px-6 py-8 transition-colors hover:bg-gray-200`}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <input
          type="file"
          accept="application/json,.json"
          onChange={onFileChange}
          className="hidden"
          id="open-file-input"
        />
        <label
          htmlFor="open-file-input"
          className="cursor-pointer text-sm rounded-md bg-gray-700 px-4 py-2 text-white shadow-sm transition-colors hover:bg-gray-800"
        >
          {file ? 'Change File' : 'Choose File'}
        </label>
        <span className="mt-2 text-xs text-gray-500">
          or drag and drop here
        </span>
        {file && (
          <span className="mt-2 text-sm font-medium text-gray-700">
            {file.name}
          </span>
        )}
        {error && <span className="mt-2 text-xs text-red-500">{error}</span>}
      </div>
      <button
        type="submit"
        className="rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 disabled:bg-gray-300"
        disabled={!file}
      >
        Open
      </button>
    </form>
  </Modal>
);
