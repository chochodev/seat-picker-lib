import { SeatData } from '@/types/data.types';
import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="min-w-[320px] max-w-[90vw] rounded-lg bg-white p-6 shadow-lg">
        {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
        {children}
        <button
          className="mt-4 w-full rounded border border-solid border-gray-300 bg-gray-200 px-4 py-1 text-sm hover:bg-gray-300"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export const DefaultSeatModal = ({
  selectedSeat,
  setSelectedSeat,
  mergedLabels,
  handleSeatAction,
}: {
  selectedSeat: SeatData | null;
  setSelectedSeat: (seat: SeatData | null) => void;
  mergedLabels: any;
  handleSeatAction: (action: string) => void;
}) => {
  return (
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
};

export default Modal;
