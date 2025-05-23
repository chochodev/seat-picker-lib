import { create } from 'zustand';
import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';

interface Seat {
  id: string;
  left: number;
  top: number;
  radius: number;
  fill: string;
  stroke: string;
  text: string;
  textSize: number;
  textColor: string;
}

interface Zone {
  id: string;
  name: string;
  isChecked: boolean;
}

export type Mode =
  | 'select'
  | 'one-seat'
  | 'multiple-seat'
  | 'shape-square'
  | 'text';
export type Action = null | 'delete' | 'copy' | 'cut' | 'paste';

interface EventGuiState {
  // ::::::::::: Loading state
  loading: boolean;

  // ::::::::::: Canvas
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas) => void;
  seats: Seat[];
  addSeat: (seat: Seat) => void;
  updateSeat: (id: string, updates: Partial<Seat>) => void;
  deleteSeat: (id: string) => void;
  selectedSeatIds: string[];

  // ::::::::::: Mode
  toolMode: Mode;
  setToolMode: (mode: Mode) => void;

  // ::::::::::: Action
  toolAction: Action;
  setToolAction: (action: Action) => void;

  setSelectedSeatIds: (ids: string[]) => void;
  isMultipleSeatMode: boolean;
  setIsMultipleSeatMode: (isCreating: boolean) => void;
  zones: Zone[];
  addZone: (name: string) => void;
  updateZone: (id: string, updates: Partial<Zone>) => void;
  deleteZone: (id: string) => void;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;

  // :::::::::::::::: Clipboard
  clipboard: fabric.Object[] | null;
  setClipboard: (objects: fabric.Object[] | null) => void;
  lastClickedPoint: { x: number; y: number } | null;
  setLastClickedPoint: (point: { x: number; y: number } | null) => void;

  // New properties for undo/redo functionality
  undoStack: string[];
  redoStack: string[];
  addToUndoStack: (state: string) => void;
  undo: () => void;
  redo: () => void;

  snapEnabled: boolean;
  setSnapEnabled: (enabled: boolean) => void;
}

export const useEventGuiStore = create<EventGuiState>((set, get) => ({
  // ::::::::::::::::::: Loading state
  loading: false,

  // ::::::::::::::::::: Canvas state
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),

  // ::::::::::::::::::: Seat states
  seats: [],
  // ::::::::::::::::::: Add Seat
  addSeat: (seat) => set((state) => ({ seats: [...state.seats, seat] })),
  // ::::::::::::::::::: Update Seat
  updateSeat: (id, updates) =>
    set((state) => ({
      seats: state.seats.map((seat) =>
        seat.id === id ? { ...seat, ...updates } : seat
      ),
    })),
  // ::::::::::::::::::: Delete Seat
  deleteSeat: (id) =>
    set((state) => ({
      seats: state.seats.filter((seat) => seat.id !== id),
    })),

  // ::::::::::::::::::: Selected Seat ID
  selectedSeatIds: [],
  setSelectedSeatIds: (ids) => set({ selectedSeatIds: ids }),

  // ::::::::::::::::::: Multiple seat creation mode state
  isMultipleSeatMode: false,
  setIsMultipleSeatMode: (isCreating) =>
    set({ isMultipleSeatMode: isCreating }),

  // ::::::::::::::::::: Zone states
  zones: [{ id: uuidv4(), name: 'Ground floor', isChecked: true }],
  // ::::::::::::::::::: Add zone
  addZone: (name) =>
    set((state) => ({
      zones: [...state.zones, { id: uuidv4(), name, isChecked: true }],
    })),
  // ::::::::::::::::::: Update zone
  updateZone: (id, updates) =>
    set((state) => ({
      zones: state.zones.map((zone) =>
        zone.id === id ? { ...zone, ...updates } : zone
      ),
    })),
  // ::::::::::::::::::: Delete zone
  deleteZone: (id) =>
    set((state) => ({
      zones: state.zones.filter((zone) => zone.id !== id),
    })),

  // ::::::::::::::::::: Zoom level state
  zoomLevel: 100,
  setZoomLevel: (level) => set({ zoomLevel: level }),

  // ::::::::::::::::::: Mode state
  toolMode: 'select',
  setToolMode: (mode: Mode) => set({ toolMode: mode }),

  // ::::::::::::::::::: Action state
  toolAction: null,
  setToolAction: (action: Action) => set({ toolAction: action }),

  // ::::::::::::::::::: Clipboard state
  clipboard: null,
  setClipboard: (objects) => set({ clipboard: objects }),
  lastClickedPoint: null,
  setLastClickedPoint: (point) => set({ lastClickedPoint: point }),

  // ::::::::::::::::::::: Undo/redo functionality
  undoStack: [],
  redoStack: [],
  addToUndoStack: (state) => {
    const { loading, undoStack } = get();
    const lastState = undoStack[undoStack.length - 1];

    if (lastState !== state && !loading) {
      set((prevState) => ({
        undoStack: [...prevState.undoStack, state],
        redoStack: [],
      }));
    }
  },

  // ::::::::::::::: Function: UNDO
  undo: () => {
    const { canvas, undoStack, redoStack } = get();

    if (undoStack.length > 1 && canvas) {
      // :::::::::::::::: set loading to true
      set({ loading: true });

      const currentState = JSON.stringify(canvas.toJSON());
      const previousState = undoStack[undoStack.length - 2];

      // ::::::::::::: update the canvas
      canvas.loadFromJSON(previousState, () => {
        canvas.getObjects().forEach((obj) => {
          if (obj instanceof fabric.Circle) {
            obj.setControlsVisibility({
              mt: false,
              mb: false,
              ml: false,
              mr: false,
            });
          }
        });
        canvas.renderAll();
        set({
          undoStack: undoStack.slice(0, -1),
          redoStack: [currentState, ...redoStack],
        });
      });

      // ::::::::::::::::: set loading to false
      set({ loading: false });

      // console.log('\n\nundo func: ', undoStack);
    }
  },

  // :::::::::::::: Function: REDO
  redo: () => {
    const { canvas, undoStack, redoStack } = get();

    if (redoStack.length > 0 && canvas) {
      // :::::::::::::::: set loading to true
      set({ loading: true });

      const nextState = redoStack[0];

      // :::::::::::::::: update the canvas
      canvas.loadFromJSON(nextState, () => {
        canvas.getObjects().forEach((obj) => {
          if (obj instanceof fabric.Circle) {
            obj.setControlsVisibility({
              mt: false,
              mb: false,
              ml: false,
              mr: false,
            });
          }
        });
        canvas.renderAll();
        const currentState = JSON.stringify(
          canvas.toJSON([
            'id',
            'borderColor',
            'borderDashArray',
            'cornerColor',
            'cornerSize',
            'cornerStrokeColor',
            'transparentCorners',
            'rx',
            'ry',
          ])
        );
        set({
          undoStack: [...undoStack, currentState],
          redoStack: redoStack.slice(1),
        });
      });

      // ::::::::::::::::: set loading to false
      set({ loading: false });

      // console.log('\n\nredo func: ', undoStack, '\n\nredo stack: ', redoStack);
    }
  },

  snapEnabled: false,
  setSnapEnabled: (enabled) => set({ snapEnabled: enabled }),
}));
