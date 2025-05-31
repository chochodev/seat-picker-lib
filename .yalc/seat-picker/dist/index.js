import React, { useRef, useState, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import { create } from 'zustand';
import { v4 } from 'uuid';
import { LuFolderOpen, LuSave, LuDownload, LuMousePointer, LuGrid2X2, LuLayoutDashboard, LuPlus, LuUndo, LuRedo, LuScissors, LuCopy, LuClipboardCheck, LuTrash2, LuZoomOut, LuZoomIn, LuLock, LuCircleFadingPlus, LuCommand, LuX } from 'react-icons/lu';
import { RiText, RiShapeLine, RiApps2AddLine, RiLockUnlockLine } from 'react-icons/ri';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';

// src/components/index.tsx
var useEventGuiStore = create((set, get) => ({
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
  updateSeat: (id, updates) => set((state) => ({
    seats: state.seats.map(
      (seat) => seat.id === id ? { ...seat, ...updates } : seat
    )
  })),
  // ::::::::::::::::::: Delete Seat
  deleteSeat: (id) => set((state) => ({
    seats: state.seats.filter((seat) => seat.id !== id)
  })),
  // ::::::::::::::::::: Selected Seat ID
  selectedSeatIds: [],
  setSelectedSeatIds: (ids) => set({ selectedSeatIds: ids }),
  // ::::::::::::::::::: Multiple seat creation mode state
  isMultipleSeatMode: false,
  setIsMultipleSeatMode: (isCreating) => set({ isMultipleSeatMode: isCreating }),
  // ::::::::::::::::::: Zone states
  zones: [{ id: v4(), name: "Ground floor", isChecked: true }],
  // ::::::::::::::::::: Add zone
  addZone: (name) => set((state) => ({
    zones: [...state.zones, { id: v4(), name, isChecked: true }]
  })),
  // ::::::::::::::::::: Update zone
  updateZone: (id, updates) => set((state) => ({
    zones: state.zones.map(
      (zone) => zone.id === id ? { ...zone, ...updates } : zone
    )
  })),
  // ::::::::::::::::::: Delete zone
  deleteZone: (id) => set((state) => ({
    zones: state.zones.filter((zone) => zone.id !== id)
  })),
  // ::::::::::::::::::: Zoom level state
  zoomLevel: 100,
  setZoomLevel: (level) => set({ zoomLevel: level }),
  // ::::::::::::::::::: Mode state
  toolMode: "select",
  setToolMode: (mode) => set({ toolMode: mode }),
  // ::::::::::::::::::: Action state
  toolAction: null,
  setToolAction: (action) => set({ toolAction: action }),
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
        redoStack: []
      }));
    }
  },
  // ::::::::::::::: Function: UNDO
  undo: () => {
    const { canvas, undoStack, redoStack } = get();
    if (undoStack.length > 1 && canvas) {
      set({ loading: true });
      const currentState = JSON.stringify(canvas.toJSON());
      const previousState = undoStack[undoStack.length - 2];
      canvas.loadFromJSON(previousState, () => {
        canvas.getObjects().forEach((obj) => {
          if (obj instanceof fabric.Circle) {
            obj.setControlsVisibility({
              mt: false,
              mb: false,
              ml: false,
              mr: false
            });
          }
        });
        canvas.renderAll();
        set({
          undoStack: undoStack.slice(0, -1),
          redoStack: [currentState, ...redoStack]
        });
      });
      set({ loading: false });
    }
  },
  // :::::::::::::: Function: REDO
  redo: () => {
    const { canvas, undoStack, redoStack } = get();
    if (redoStack.length > 0 && canvas) {
      set({ loading: true });
      const nextState = redoStack[0];
      canvas.loadFromJSON(nextState, () => {
        canvas.getObjects().forEach((obj) => {
          if (obj instanceof fabric.Circle) {
            obj.setControlsVisibility({
              mt: false,
              mb: false,
              ml: false,
              mr: false
            });
          }
        });
        canvas.renderAll();
        const currentState = JSON.stringify(
          canvas.toJSON([
            "id",
            "borderColor",
            "borderDashArray",
            "cornerColor",
            "cornerSize",
            "cornerStrokeColor",
            "transparentCorners",
            "rx",
            "ry"
          ])
        );
        set({
          undoStack: [...undoStack, currentState],
          redoStack: redoStack.slice(1)
        });
      });
      set({ loading: false });
    }
  },
  snapEnabled: false,
  setSnapEnabled: (enabled) => set({ snapEnabled: enabled })
}));

// src/components/createObject/applyCustomStyles.ts
function applyCustomStyles(obj) {
  obj.set({
    borderColor: "green",
    borderDashArray: [2, 4],
    padding: 2,
    cornerColor: "lightblue",
    cornerSize: 5,
    cornerStrokeColor: "blue",
    transparentCorners: false,
    strokeUniform: true
  });
  obj.setControlsVisibility && obj.setControlsVisibility({
    mt: false,
    mb: false,
    ml: false,
    mr: false
  });
}

// src/hooks/useClipboardActions.ts
var useClipboardActions = () => {
  const { canvas, clipboard, setClipboard, lastClickedPoint, setToolAction } = useEventGuiStore();
  const copySelectedObjects = async () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;
    setToolAction("copy");
    const clonedObjects = [];
    for (const obj of activeObjects) {
      await new Promise((resolve) => {
        obj.clone((cloned) => {
          if ("id" in cloned) cloned.id = v4();
          clonedObjects.push(cloned);
          resolve();
        });
      });
    }
    setClipboard(clonedObjects);
  };
  const cutSelectedObjects = async () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;
    setToolAction("cut");
    const clonedObjects = [];
    for (const obj of activeObjects) {
      await new Promise((resolve) => {
        obj.clone((cloned) => {
          if ("id" in cloned) cloned.id = v4();
          clonedObjects.push(cloned);
          resolve();
        });
      });
    }
    setClipboard(clonedObjects);
    canvas.remove(...activeObjects);
    canvas.discardActiveObject();
    canvas.renderAll();
  };
  const pasteObjects = async () => {
    if (!canvas || !clipboard || !lastClickedPoint) return;
    setToolAction("paste");
    const pastedObjects = [];
    for (const obj of clipboard) {
      await new Promise((resolve) => {
        obj.clone((cloned) => {
          if ("id" in cloned) cloned.id = v4();
          applyCustomStyles(cloned);
          cloned.set({
            left: (cloned.left || 0) + 20,
            top: (cloned.top || 0) + 20,
            evented: true
          });
          canvas.add(cloned);
          pastedObjects.push(cloned);
          resolve();
        });
      });
    }
    if (pastedObjects.length === 1) {
      canvas.setActiveObject(pastedObjects[0]);
    } else if (pastedObjects.length > 1) {
      const selection = new fabric.ActiveSelection(pastedObjects, { canvas });
      canvas.setActiveObject(selection);
    }
    canvas.requestRenderAll();
  };
  return { copySelectedObjects, cutSelectedObjects, pasteObjects };
};
var useClipboardActions_default = useClipboardActions;
var useUndoRedo = () => {
  const { canvas, addToUndoStack, undo, redo, undoStack } = useEventGuiStore();
  const handleObjectModified = useCallback(() => {
    if (canvas) {
      const jsonState = JSON.stringify(
        canvas.toJSON([
          "id",
          "borderColor",
          "borderDashArray",
          "cornerColor",
          "cornerSize",
          "cornerStrokeColor",
          "transparentCorners",
          "rx",
          "ry"
        ])
      );
      addToUndoStack(jsonState);
    }
  }, [canvas, addToUndoStack]);
  useEffect(() => {
    if (!canvas) return;
    const eventsToListen = [
      "object:modified",
      "object:added",
      "object:removed"
    ];
    eventsToListen.forEach((event) => {
      canvas.on(event, handleObjectModified);
    });
    return () => {
      eventsToListen.forEach((event) => {
        canvas.off(event, handleObjectModified);
      });
    };
  }, [canvas, addToUndoStack]);
  return { undo, redo };
};
var useUndoRedo_default = useUndoRedo;
function useLockSelection(canvas) {
  const isSelectionLocked = useCallback(() => {
    if (!canvas) return false;
    const selected = canvas.getActiveObjects();
    return selected.length > 0 && selected.every((obj) => obj.lockMovementX && obj.lockMovementY);
  }, [canvas]);
  const toggleLockSelection = useCallback(() => {
    if (!canvas) return;
    const selected = canvas.getActiveObjects();
    if (selected.length === 0) return;
    const shouldLock = !isSelectionLocked();
    selected.forEach((obj) => {
      obj.set({
        lockMovementX: shouldLock,
        lockMovementY: shouldLock
      });
    });
    canvas.requestRenderAll();
    if (selected.length > 1) {
      canvas.discardActiveObject();
      const group = new fabric.ActiveSelection(selected, { canvas });
      canvas.setActiveObject(group);
      canvas.requestRenderAll();
    }
    canvas.fire("lock:changed");
  }, [canvas, isSelectionLocked]);
  const [selectionVersion, setSelectionVersion] = useState(0);
  useEffect(() => {
    if (!canvas) return;
    const update = () => setSelectionVersion((v) => v + 1);
    canvas.on("selection:created", update);
    canvas.on("selection:updated", update);
    canvas.on("lock:changed", update);
    return () => {
      canvas.off("selection:created", update);
      canvas.off("selection:updated", update);
      canvas.off("lock:changed", update);
    };
  }, [canvas]);
  return { isSelectionLocked, toggleLockSelection, selectionVersion };
}
var Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/30", children: /* @__PURE__ */ jsxs("div", { className: "min-w-[320px] max-w-[90vw] rounded-lg bg-white p-6 shadow-lg", children: [
    title && /* @__PURE__ */ jsx("h2", { className: "mb-4 text-lg font-semibold", children: title }),
    children,
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "mt-4 w-full rounded border border-solid border-gray-300 bg-gray-200 px-4 py-1 text-sm hover:bg-gray-300",
        onClick: onClose,
        children: "Cancel"
      }
    )
  ] }) });
};
var DefaultSeatModal = ({
  selectedSeat,
  setSelectedSeat,
  mergedLabels,
  handleSeatAction
}) => {
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open: !!selectedSeat,
      onClose: () => setSelectedSeat(null),
      title: "Seat Details",
      children: selectedSeat && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-600", children: mergedLabels.seatNumber }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: selectedSeat.number })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-600", children: mergedLabels.category }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: selectedSeat.category })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-600", children: mergedLabels.price }),
            /* @__PURE__ */ jsxs("p", { className: "text-lg font-semibold", children: [
              selectedSeat.currencySymbol,
              selectedSeat.price,
              " ",
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500", children: [
                "(",
                selectedSeat.currencyCode,
                ")"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-600", children: mergedLabels.status }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: selectedSeat.status })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleSeatAction("buy"),
              className: "flex-1 rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400",
              children: mergedLabels.buyButton
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelectedSeat(null),
              className: "flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400",
              children: mergedLabels.cancelButton
            }
          )
        ] })
      ] })
    }
  );
};
var Modal_default = Modal;
var ExportModal = ({ open, onClose, fileName, setFileName, onExport }) => /* @__PURE__ */ jsx(Modal_default, { open, onClose, title: "Export as JSON", children: /* @__PURE__ */ jsxs("form", { onSubmit: onExport, className: "flex flex-col gap-4", children: [
  /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700", children: "File Name" }),
  /* @__PURE__ */ jsx(
    "input",
    {
      type: "text",
      value: fileName,
      onChange: (e) => setFileName(e.target.value),
      className: "rounded-md border border-gray-300 border-solid bg-gray-100 px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300",
      placeholder: "seats.json",
      required: true
    }
  ),
  /* @__PURE__ */ jsx(
    "button",
    {
      type: "submit",
      className: "rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400",
      children: "Export"
    }
  )
] }) });
var OpenFileModal = ({
  open,
  onClose,
  file,
  setFile,
  error,
  onFileChange,
  onDrop,
  onDragOver,
  onSubmit
}) => /* @__PURE__ */ jsx(
  Modal_default,
  {
    open,
    onClose: () => {
      onClose();
      setFile(null);
    },
    title: "Open Seating Arrangement",
    children: /* @__PURE__ */ jsxs("form", { onSubmit, className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700", children: "Select or drag a JSON file" }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: `flex flex-col items-center justify-center rounded-lg border-2 border-dashed ${error ? "border-red-400" : "border-gray-300"} bg-gray-100 px-6 py-8 transition-colors hover:bg-gray-200`,
          onDrop,
          onDragOver,
          children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                accept: "application/json,.json",
                onChange: onFileChange,
                className: "hidden",
                id: "open-file-input"
              }
            ),
            /* @__PURE__ */ jsx(
              "label",
              {
                htmlFor: "open-file-input",
                className: "cursor-pointer text-sm rounded-md bg-gray-700 px-4 py-2 text-white shadow-sm transition-colors hover:bg-gray-800",
                children: file ? "Change File" : "Choose File"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "mt-2 text-xs text-gray-500", children: "or drag and drop here" }),
            file && /* @__PURE__ */ jsx("span", { className: "mt-2 text-sm font-medium text-gray-700", children: file.name }),
            error && /* @__PURE__ */ jsx("span", { className: "mt-2 text-xs text-red-500", children: error })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 disabled:bg-gray-300",
          disabled: !file,
          children: "Open"
        }
      )
    ] })
  }
);
var typeStyles = {
  success: "bg-green-500/50 border-green-600",
  error: "bg-red-600 text-white",
  info: "bg-blue-600 text-white"
};
var Toast = ({
  open,
  message,
  type = "info",
  onClose
}) => {
  if (!open) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `fixed bottom-6 left-1/2 z-[100] flex h-12 -translate-x-1/2 transform items-center justify-center rounded-md px-6 shadow-lg backdrop-blur-sm ${typeStyles[type]} border border-solid`,
      role: "alert",
      onClick: onClose,
      children: [
        /* @__PURE__ */ jsx("span", { children: message }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "ease-250 ml-2 -mr-2 rounded border border-solid border-black/20 p-1 text-black/40 hover:border-black/40 hover:text-black/80 active:scale-110",
            onClick: onClose,
            children: /* @__PURE__ */ jsx(LuX, {})
          }
        )
      ]
    }
  );
};
var Toast_default = Toast;
var Toolbar = ({ onSave, onBgLayout }) => {
  const {
    toolMode,
    setToolMode,
    toolAction,
    setToolAction,
    canvas,
    snapEnabled,
    setSnapEnabled
  } = useEventGuiStore();
  const [zoomLevel, setZoomLevel] = useState(100);
  const { copySelectedObjects, cutSelectedObjects, pasteObjects } = useClipboardActions_default();
  const { undo, redo } = useUndoRedo_default();
  const { isSelectionLocked, toggleLockSelection } = useLockSelection(canvas);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileName, setExportFileName] = useState("seats.json");
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [openFile, setOpenFile] = useState(null);
  const [openFileError, setOpenFileError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState(
    "info"
  );
  useEffect(() => {
    if (!canvas) return;
    const zoom = zoomLevel / 100;
    canvas.setZoom(zoom);
    const viewportWidth = canvas.getWidth();
    const viewportHeight = canvas.getHeight();
    const contentWidth = canvas.width * zoom;
    const contentHeight = canvas.height * zoom;
    canvas.absolutePan({
      x: (viewportWidth - contentWidth) / 2,
      y: (viewportHeight - contentHeight) / 2
    });
    canvas.renderAll();
  }, [zoomLevel, canvas]);
  const handleExport = (e) => {
    e.preventDefault();
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFileName.endsWith(".json") ? exportFileName : exportFileName + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };
  const toggleMultipleSeatMode = () => {
    setToolMode(toolMode === "multiple-seat" ? "select" : "multiple-seat");
  };
  const handleFileChange = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (file) setOpenFile(file);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setOpenFile(e.dataTransfer.files[0]);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleOpenFile = async (e) => {
    e.preventDefault();
    if (!canvas || !openFile) return;
    try {
      const text = await openFile.text();
      const json = JSON.parse(text);
      canvas.loadFromJSON(json, () => {
        canvas.getObjects().forEach((obj) => {
          if (obj.type === "circle" || obj.type === "rect" || obj.type === "i-text") {
            applyCustomStyles(obj);
          }
        });
        canvas.renderAll();
        setShowOpenModal(false);
        setOpenFile(null);
        setToastMsg("Seating arrangement loaded!");
        setToastType("success");
        setShowToast(true);
      });
    } catch (err) {
      setOpenFileError(
        "Invalid JSON file. Please select a valid seating arrangement file."
      );
      setToastMsg("Invalid JSON file.");
      setToastType("error");
      setShowToast(true);
    }
  };
  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 10, 120));
  };
  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 10, 80));
  };
  const buttonGroups = [
    [
      {
        icon: LuFolderOpen,
        tooltip: "Open File",
        onClick: () => setShowOpenModal(true),
        state: false
      },
      {
        icon: LuSave,
        tooltip: "Save",
        onClick: () => {
          if (canvas && onSave) {
            const json = {
              type: "canvas",
              ...canvas.toJSON(["customType", "seatData", "zoneData"])
            };
            onSave(json);
          }
        },
        state: false
      },
      {
        icon: LuDownload,
        tooltip: "Download",
        onClick: () => setShowExportModal(true),
        state: false
      }
    ],
    [
      {
        icon: LuMousePointer,
        tooltip: "Select",
        onClick: () => setToolMode("select"),
        state: toolMode === "select"
      },
      {
        icon: LuGrid2X2,
        tooltip: snapEnabled ? "Remove Grid" : "Smart Grid",
        onClick: () => setSnapEnabled(!snapEnabled),
        state: snapEnabled
      },
      {
        icon: LuLayoutDashboard,
        tooltip: "Layout View",
        onClick: onBgLayout,
        state: false
      }
    ],
    [
      {
        icon: RiText,
        tooltip: "Add Text",
        onClick: () => setToolMode("text"),
        state: toolMode === "text"
      },
      {
        icon: RiShapeLine,
        tooltip: "Add Square",
        onClick: () => setToolMode("shape-square"),
        state: toolMode === "shape-square"
      },
      {
        icon: LuPlus,
        tooltip: "Add Seat",
        onClick: () => setToolMode("one-seat"),
        state: toolMode === "one-seat"
      },
      {
        icon: RiApps2AddLine,
        tooltip: "Add Rows",
        onClick: toggleMultipleSeatMode,
        state: toolMode === "multiple-seat"
      }
    ],
    [
      { icon: LuUndo, tooltip: "Undo", onClick: undo, state: false },
      { icon: LuRedo, tooltip: "Redo", onClick: redo, state: false }
    ],
    [
      {
        icon: LuScissors,
        tooltip: "Cut",
        onClick: cutSelectedObjects,
        state: toolAction === "cut"
      },
      {
        icon: LuCopy,
        tooltip: "Copy",
        onClick: copySelectedObjects,
        state: toolAction === "copy"
      },
      {
        icon: LuClipboardCheck,
        tooltip: "Paste",
        onClick: pasteObjects,
        state: toolAction === "paste"
      },
      {
        icon: LuTrash2,
        tooltip: "Delete",
        onClick: () => setToolAction("delete"),
        state: false
      }
    ]
  ];
  return /* @__PURE__ */ jsxs("div", { className: "fixed left-0 top-0 z-[200] flex w-full items-center justify-center gap-1 bg-white px-[1rem] py-[0.5rem] shadow", children: [
    /* @__PURE__ */ jsx("div", { className: "flex-1" }),
    buttonGroups.map((group, groupIdx) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
      groupIdx > 0 && /* @__PURE__ */ jsx(Separator, {}),
      group.map((item, idx) => /* @__PURE__ */ jsx(
        Button,
        {
          icon: /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4" }),
          tooltip: item.tooltip,
          onClick: item.onClick,
          state: item.state
        },
        `button-${groupIdx}-${idx}`
      ))
    ] }, groupIdx)),
    /* @__PURE__ */ jsx(Separator, {}),
    /* @__PURE__ */ jsx(
      Button,
      {
        icon: /* @__PURE__ */ jsx(LuZoomOut, { className: "h-4 w-4" }),
        tooltip: "Zoom Out",
        onClick: handleZoomOut
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex h-8 w-12 items-center justify-center text-sm font-medium", children: [
      zoomLevel,
      "%"
    ] }),
    /* @__PURE__ */ jsx(
      Button,
      {
        icon: /* @__PURE__ */ jsx(LuZoomIn, { className: "h-4 w-4" }),
        tooltip: "Zoom In",
        onClick: handleZoomIn
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex-1" }),
    /* @__PURE__ */ jsx(
      Button,
      {
        icon: isSelectionLocked() ? /* @__PURE__ */ jsx(LuLock, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(RiLockUnlockLine, { className: "h-4 w-4" }),
        tooltip: isSelectionLocked() ? "Unlock Selection" : "Lock Selection",
        onClick: toggleLockSelection
      }
    ),
    /* @__PURE__ */ jsx(
      ExportModal,
      {
        open: showExportModal,
        onClose: () => setShowExportModal(false),
        fileName: exportFileName,
        setFileName: setExportFileName,
        onExport: handleExport
      }
    ),
    /* @__PURE__ */ jsx(
      OpenFileModal,
      {
        open: showOpenModal,
        onClose: () => {
          setShowOpenModal(false);
          setOpenFile(null);
          setOpenFileError("");
        },
        file: openFile,
        setFile: setOpenFile,
        error: openFileError,
        onFileChange: handleFileChange,
        onDrop: handleDrop,
        onDragOver: handleDragOver,
        onSubmit: handleOpenFile
      }
    ),
    /* @__PURE__ */ jsx(
      Toast_default,
      {
        open: showToast,
        message: toastMsg,
        type: toastType,
        onClose: () => setShowToast(false)
      }
    )
  ] });
};
var toolbar_default = Toolbar;
var Button = ({ icon, tooltip, state, ...props }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        className: `rounded-md p-2 hover:bg-gray-200/60 ${state ? "shadow-sm shadow-gray-400 ring-1 ring-gray-400" : ""} ease-250 active:bg-gray-200 `,
        onMouseEnter: () => setShowTooltip(true),
        onMouseLeave: () => setShowTooltip(false),
        ...props,
        children: icon
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `absolute left-1/2 -translate-x-1/2 transform ${showTooltip ? "top-[calc(100%+0.5rem)] opacity-100" : "top-[100%] opacity-0"} ease-250 whitespace-nowrap rounded bg-gray-200 px-2 py-1 text-[0.625rem] text-gray-900 shadow-md`,
        children: tooltip
      }
    )
  ] });
};
var Separator = () => /* @__PURE__ */ jsx("div", { className: "mx-[1rem] h-6 w-px bg-gray-300 " });
var Select = ({
  options,
  value,
  onChange,
  placeholder = "Select an option"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState(
    "bottom"
  );
  const handleToggle = () => setIsOpen(!isOpen);
  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  const handleClickOutside = (event) => {
    if (selectRef.current && !selectRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const selectedOption = options.find((option) => option.value === value);
  const calculateDropdownPosition = () => {
    if (selectRef.current) {
      const { bottom } = selectRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (windowHeight - bottom < 120) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  };
  useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
    }
  }, [isOpen]);
  return /* @__PURE__ */ jsxs("div", { ref: selectRef, className: "relative", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex w-full cursor-pointer items-center justify-between rounded-md border border-solid border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500",
        onClick: handleToggle,
        children: [
          /* @__PURE__ */ jsx("span", { className: "block truncate", children: selectedOption ? selectedOption.label : placeholder }),
          /* @__PURE__ */ jsx("span", { className: "pointer-events-none", children: /* @__PURE__ */ jsx(
            "svg",
            {
              className: "h-5 w-5 text-gray-400",
              viewBox: "0 0 20 20",
              fill: "none",
              stroke: "currentColor",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M7 7l3-3 3 3m0 6l-3 3-3-3",
                  strokeWidth: "1.5",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              )
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `absolute z-10 mt-1 w-full overflow-hidden rounded-[8px] border border-solid border-gray-300 bg-white shadow-lg ${dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"} ${isOpen ? "user-select-auto visible opacity-100" : "user-select-none invisible select-none opacity-0"} ease-250`,
        children: /* @__PURE__ */ jsx("ul", { className: "max-h-60 overflow-auto text-base focus:outline-none sm:text-sm", children: options.map((option) => /* @__PURE__ */ jsxs(
          "li",
          {
            className: `relative cursor-pointer select-none py-2 pl-3 pr-9 ${value === option.value ? "bg-gray-100 text-gray-600" : "text-gray-900 hover:bg-gray-50"}`,
            onClick: () => handleOptionClick(option.value),
            children: [
              /* @__PURE__ */ jsx("span", { className: "block truncate", children: option.label }),
              value === option.value && /* @__PURE__ */ jsx("span", { className: "absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600", children: /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "h-5 w-5",
                  viewBox: "0 0 20 20",
                  fill: "currentColor",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      fillRule: "evenodd",
                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                      clipRule: "evenodd"
                    }
                  )
                }
              ) })
            ]
          },
          option.value
        )) })
      }
    )
  ] });
};
var select_default = Select;
var useObjectProperties = (canvas, selectedObjects) => {
  const [properties, setProperties] = useState({
    angle: 0,
    radius: 10,
    width: 100,
    height: 100,
    fill: "transparent",
    stroke: "#000000",
    text: "",
    fontSize: 20,
    fontWeight: "normal",
    fontFamily: "sans-serif",
    left: 0,
    top: 0
  });
  function getMergedValue(objs, key) {
    if (objs.length === 0) return "";
    const first = objs[0][key];
    return objs.every((obj) => obj[key] === first) ? first : "mixed";
  }
  useEffect(() => {
    if (!selectedObjects || selectedObjects.length === 0) return;
    const objs = selectedObjects;
    setProperties({
      angle: getMergedValue(objs, "angle"),
      radius: getMergedValue(objs, "radius"),
      width: getMergedValue(objs, "width") * (getMergedValue(objs, "scaleX") || 1),
      height: getMergedValue(objs, "height") * (getMergedValue(objs, "scaleY") || 1),
      fill: getMergedValue(objs, "fill"),
      stroke: getMergedValue(objs, "stroke"),
      text: getMergedValue(objs, "text"),
      fontSize: getMergedValue(objs, "fontSize"),
      fontWeight: getMergedValue(objs, "fontWeight"),
      fontFamily: getMergedValue(objs, "fontFamily"),
      left: getMergedValue(objs, "left"),
      top: getMergedValue(objs, "top"),
      rx: getMergedValue(objs, "rx"),
      ry: getMergedValue(objs, "ry"),
      seatNumber: getMergedValue(objs, "seatNumber"),
      category: getMergedValue(objs, "category"),
      price: getMergedValue(objs, "price"),
      status: getMergedValue(objs, "status"),
      currencySymbol: getMergedValue(objs, "currencySymbol"),
      currencyCode: getMergedValue(objs, "currencyCode"),
      currencyCountry: getMergedValue(objs, "currencyCountry")
    });
  }, [selectedObjects]);
  return { properties, setProperties };
};
var useObjectUpdater = (canvas, setProperties, lockAspect = false) => {
  useEffect(() => {
    if (!canvas) return;
    const handleScaling = (e) => {
      const obj = e.target;
      if (!obj) return;
      if (obj.type === "circle") {
        const newRadius = (obj.radius || (obj.width ? obj.width / 2 : 0)) * (obj.scaleX || 1);
        obj.set({
          radius: newRadius,
          scaleX: 1,
          scaleY: 1,
          width: newRadius * 2,
          height: newRadius * 2
        });
        obj.setCoords();
        canvas.renderAll();
        setProperties((prev) => ({ ...prev, radius: newRadius }));
      } else if (obj.type === "activeSelection" && "getObjects" in obj) {
        const selection = obj;
        const circles = selection.getObjects().filter(
          (o) => o.type === "circle"
        );
        let radii = [];
        circles.forEach((circle) => {
          const newRadius = (circle.radius || (circle.width ? circle.width / 2 : 0)) * (circle.scaleX || 1);
          circle.set({
            radius: newRadius,
            scaleX: 1,
            scaleY: 1,
            width: newRadius * 2,
            height: newRadius * 2
          });
          circle.setCoords();
          radii.push(newRadius);
        });
        canvas.renderAll();
        const allSame = radii.every((r) => r === radii[0]);
        setProperties((prev) => ({
          ...prev,
          radius: allSame ? radii[0] : "mixed"
        }));
      }
    };
    canvas.on("object:scaling", handleScaling);
    return () => {
      canvas.off("object:scaling", handleScaling);
    };
  }, [canvas, setProperties]);
  const updateObject = (updates) => {
    var _a, _b;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;
    if (activeObject && activeObject.type === "activeSelection") {
      const group = activeObject;
      if ("left" in updates || "top" in updates) {
        const deltaX = "left" in updates && typeof updates.left === "number" ? updates.left - ((_a = group.left) != null ? _a : 0) : 0;
        const deltaY = "top" in updates && typeof updates.top === "number" ? updates.top - ((_b = group.top) != null ? _b : 0) : 0;
        group.getObjects().forEach((obj) => {
          var _a2, _b2;
          obj.set({
            left: ((_a2 = obj.left) != null ? _a2 : 0) + deltaX,
            top: ((_b2 = obj.top) != null ? _b2 : 0) + deltaY
          });
          obj.setCoords();
        });
        group.setCoords();
        canvas.renderAll();
        setProperties((prev) => {
          var _a2, _b2;
          return {
            ...prev,
            left: (_a2 = updates.left) != null ? _a2 : prev.left,
            top: (_b2 = updates.top) != null ? _b2 : prev.top
          };
        });
        return;
      }
      if ("angle" in updates && typeof updates.angle === "number") {
        group.set("angle", updates.angle);
        group.setCoords();
        canvas.renderAll();
        setProperties((prev) => {
          var _a2;
          return {
            ...prev,
            angle: (_a2 = updates.angle) != null ? _a2 : prev.angle
          };
        });
        return;
      }
    }
    activeObjects.forEach((selectedObject) => {
      var _a2, _b2;
      const updatedProperties = {};
      for (const [key, value] of Object.entries(updates)) {
        if (selectedObject[key] !== value) {
          updatedProperties[key] = value;
        }
      }
      if ("stroke" in updatedProperties && updatedProperties.stroke !== void 0) {
        updatedProperties.stroke = String(updatedProperties.stroke);
      }
      if (selectedObject.type === "circle") {
        if ("width" in updates || "height" in updates) {
          const currentRadius = selectedObject.radius || 0;
          const newRadius = updates.width ? updates.width / 2 : updates.height ? updates.height / 2 : currentRadius;
          selectedObject.set({
            radius: newRadius,
            scaleX: 1,
            scaleY: 1,
            width: newRadius * 2,
            height: newRadius * 2
          });
          delete updatedProperties.width;
          delete updatedProperties.height;
        }
      } else {
        if ("width" in updates && updates.width !== void 0) {
          const renderedWidth = updates.width;
          const currentScaleX = selectedObject.scaleX || 1;
          selectedObject.set({
            width: renderedWidth / currentScaleX,
            scaleX: 1,
            height: lockAspect ? renderedWidth / currentScaleX : selectedObject.height
          });
          delete updatedProperties.width;
        }
        if ("height" in updates && updates.height !== void 0) {
          const renderedHeight = updates.height;
          const currentScaleY = selectedObject.scaleY || 1;
          selectedObject.set({
            height: renderedHeight / currentScaleY,
            scaleY: 1,
            width: lockAspect ? renderedHeight / currentScaleY : selectedObject.width
          });
          delete updatedProperties.height;
        }
      }
      selectedObject.set(updatedProperties);
      if (selectedObject.type === "i-text") {
        selectedObject.set({
          scaleX: 1,
          scaleY: 1
        });
      }
      if (Object.prototype.hasOwnProperty.call(updates, "angle")) {
        selectedObject.setCoords();
        const rect = selectedObject.getBoundingRect();
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        let dx = 0, dy = 0;
        if (rect.left < 0) {
          dx = -rect.left;
        } else if (rect.left + rect.width > canvasWidth) {
          dx = canvasWidth - (rect.left + rect.width);
        }
        if (rect.top < 0) {
          dy = -rect.top;
        } else if (rect.top + rect.height > canvasHeight) {
          dy = canvasHeight - (rect.top + rect.height);
        }
        if (dx !== 0 || dy !== 0) {
          const originX = selectedObject.originX || "center";
          const originY = selectedObject.originY || "center";
          const newCenter = new fabric.Point(
            ((_a2 = selectedObject.left) != null ? _a2 : 0) + dx,
            ((_b2 = selectedObject.top) != null ? _b2 : 0) + dy
          );
          selectedObject.setPositionByOrigin(newCenter, originX, originY);
          selectedObject.setCoords();
        }
      }
      canvas.renderAll();
      setProperties((prev) => ({
        ...prev,
        ...updatedProperties
      }));
    });
  };
  return { updateObject };
};

// src/utils/index.ts
var toFloat = (num) => {
  if (typeof num !== "number" || isNaN(num)) return "";
  return num % 1 !== 0 ? Number(num.toFixed(2)) : num;
};
var angleOptions = [
  { value: 45, label: "45\xB0" },
  { value: 90, label: "90\xB0" },
  { value: 180, label: "180\xB0" },
  { value: 270, label: "270\xB0" }
];
var CommonProperties = ({
  properties,
  updateObject
}) => {
  var _a, _b;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-gray-600", children: "Position X" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
              onClick: () => {
                if (typeof properties.left === "number") {
                  updateObject({ left: properties.left - 1 });
                }
              },
              disabled: typeof properties.left !== "number",
              children: "-"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: toFloat(properties.left),
              onChange: (e) => updateObject({ left: Number(e.target.value) }),
              className: "w-16 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
              onClick: () => {
                if (typeof properties.left === "number") {
                  updateObject({ left: properties.left + 1 });
                }
              },
              disabled: typeof properties.left !== "number",
              children: "+"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-gray-600", children: "Position Y" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
              onClick: () => {
                if (typeof properties.top === "number") {
                  updateObject({ top: properties.top - 1 });
                }
              },
              disabled: typeof properties.top !== "number",
              children: "-"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: toFloat(properties.top),
              onChange: (e) => updateObject({ top: Number(e.target.value) }),
              className: "w-16 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
              onClick: () => {
                if (typeof properties.top === "number") {
                  updateObject({ top: properties.top + 1 });
                }
              },
              disabled: typeof properties.top !== "number",
              children: "+"
            }
          )
        ] })
      ] }),
      properties.type !== "circle" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-gray-600", children: "Width" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
                onClick: () => {
                  if (typeof properties.width === "number") {
                    updateObject({ width: properties.width - 1 });
                  }
                },
                disabled: typeof properties.width !== "number",
                children: "-"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: toFloat((_a = properties.width) != null ? _a : 0),
                onChange: (e) => updateObject({ width: Number(e.target.value) }),
                className: "w-16 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
                onClick: () => {
                  if (typeof properties.width === "number") {
                    updateObject({ width: properties.width + 1 });
                  }
                },
                disabled: typeof properties.width !== "number",
                children: "+"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-gray-600", children: "Height" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
                onClick: () => {
                  if (typeof properties.height === "number") {
                    updateObject({ height: properties.height - 1 });
                  }
                },
                disabled: typeof properties.height !== "number",
                children: "-"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: toFloat((_b = properties.height) != null ? _b : 0),
                onChange: (e) => updateObject({ height: Number(e.target.value) }),
                className: "w-16 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
                onClick: () => {
                  if (typeof properties.height === "number") {
                    updateObject({ height: properties.height + 1 });
                  }
                },
                disabled: typeof properties.height !== "number",
                children: "+"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-medium text-gray-600", children: "Angle" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
            onClick: () => {
              if (typeof properties.angle === "number") {
                updateObject({ angle: properties.angle - 1 });
              }
            },
            disabled: typeof properties.angle !== "number",
            children: "-"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: toFloat(properties.angle),
            onChange: (e) => updateObject({ angle: Number(e.target.value) }),
            className: "w-16 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
            onClick: () => {
              if (typeof properties.angle === "number") {
                updateObject({ angle: properties.angle + 1 });
              }
            },
            disabled: typeof properties.angle !== "number",
            children: "+"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "ml-1 flex items-center gap-1", children: angleOptions.map(({ value, label }) => /* @__PURE__ */ jsx(
          "button",
          {
            className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
            onClick: () => updateObject({ angle: value }),
            title: label,
            children: /* @__PURE__ */ jsxs(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                width: "12",
                height: "12",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                style: { transform: `rotate(${value + 90}deg)` },
                children: [
                  /* @__PURE__ */ jsx("path", { d: "M12 2v20M2 12h20" }),
                  /* @__PURE__ */ jsx("path", { d: "M2 12l4-4M2 12l4 4" })
                ]
              }
            )
          },
          value
        )) })
      ] })
    ] })
  ] });
};
var commonProperties_default = CommonProperties;
var CircleProperties = ({
  properties,
  updateObject,
  Select: Select2
}) => {
  const [activeTab, setActiveTab] = React.useState(
    "basic"
  );
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Radius" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
            onClick: () => {
              if (typeof properties.radius === "number") {
                updateObject({ radius: properties.radius - 1 });
              }
            },
            disabled: properties.radius === "mixed",
            children: "-"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: properties.radius === "mixed" ? "" : toFloat(properties.radius),
            placeholder: properties.radius === "mixed" ? "\u2014" : "",
            onChange: (e) => updateObject({ radius: Number(e.target.value) }),
            className: "w-12 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
            onClick: () => {
              if (typeof properties.radius === "number") {
                updateObject({ radius: properties.radius + 1 });
              }
            },
            disabled: properties.radius === "mixed",
            children: "+"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${properties.radius === 0 ? "bg-gray-200" : "bg-white"} transition-colors`,
            onClick: () => updateObject({ radius: 6 }),
            title: "None",
            children: /* @__PURE__ */ jsx(
              "svg",
              {
                width: "14",
                height: "14",
                viewBox: "0 0 14 14",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                children: /* @__PURE__ */ jsx("rect", { x: "2", y: "2", width: "10", height: "10", rx: "0" })
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${properties.radius === 4 ? "bg-gray-200" : "bg-white"} text-xs transition-colors`,
            onClick: () => updateObject({ radius: 8 }),
            title: "Small",
            children: "sm"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${properties.radius === 10 ? "bg-gray-200" : "bg-white"} text-xs transition-colors`,
            onClick: () => updateObject({ radius: 10 }),
            title: "Medium",
            children: "md"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${properties.radius === 20 ? "bg-gray-200" : "bg-white"} text-xs transition-colors`,
            onClick: () => updateObject({ radius: 16 }),
            title: "Large",
            children: "lg"
          }
        )
      ] })
    ] })
  ] });
};
var circleProperties_default = CircleProperties;
var strokeWidthOptions = [
  { value: "0", label: "None" },
  { value: "1", label: "Thin" },
  { value: "2", label: "Medium" },
  { value: "3", label: "Thick" },
  { value: "4", label: "Extra Thick" }
];
var RectangleProperties = ({
  properties,
  updateObject,
  Select: Select2
}) => {
  var _a, _b, _c, _d, _e, _f;
  const [lockAspect, setLockAspect] = useState(true);
  const { canvas } = useEventGuiStore();
  useEffect(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject && canvas.getActiveObject();
    if (activeObject && activeObject.type === "rect") {
      activeObject.set("lockUniScaling", lockAspect);
      activeObject.setControlsVisibility({
        mt: !lockAspect,
        mb: !lockAspect,
        ml: !lockAspect,
        mr: !lockAspect
      });
      canvas.renderAll && canvas.renderAll();
    }
  }, [lockAspect, canvas]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          checked: lockAspect,
          onChange: (e) => setLockAspect(e.target.checked),
          className: "mr-2"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-600", children: "Lock aspect ratio" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm font-medium text-gray-700", children: "Stroke Width" }),
      /* @__PURE__ */ jsx(
        Select2,
        {
          options: strokeWidthOptions,
          value: ((_a = properties.strokeWidth) == null ? void 0 : _a.toString()) || "1",
          onChange: (value) => updateObject({ strokeWidth: Number(value) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
      /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm font-medium text-gray-700", children: "Border Radius" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
              onClick: () => {
                var _a2, _b2;
                return updateObject({
                  rx: Number(toFloat((_a2 = properties.rx) != null ? _a2 : 0)) - 1,
                  ry: Number(toFloat((_b2 = properties.ry) != null ? _b2 : 0)) - 1
                });
              },
              children: "-"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: toFloat((_b = properties.rx) != null ? _b : 0),
              onChange: (e) => updateObject({
                rx: Number(e.target.value),
                ry: Number(e.target.value)
              }),
              className: "w-12 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
              onClick: () => {
                var _a2, _b2;
                return updateObject({
                  rx: Number(toFloat((_a2 = properties.rx) != null ? _a2 : 0)) + 1,
                  ry: Number(toFloat((_b2 = properties.ry) != null ? _b2 : 0)) + 1
                });
              },
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${((_c = properties.rx) != null ? _c : 0) === 0 ? "bg-gray-200" : "bg-white"} transition-colors`,
              onClick: () => updateObject({ rx: 0, ry: 0 }),
              title: "None",
              children: /* @__PURE__ */ jsx(
                "svg",
                {
                  width: "14",
                  height: "14",
                  viewBox: "0 0 14 14",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  children: /* @__PURE__ */ jsx("rect", { x: "2", y: "2", width: "10", height: "10", rx: "0" })
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${((_d = properties.rx) != null ? _d : 0) === 4 ? "bg-gray-200" : "bg-white"} text-xs transition-colors`,
              onClick: () => updateObject({ rx: 4, ry: 4 }),
              title: "Small",
              children: "sm"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${((_e = properties.rx) != null ? _e : 0) === 10 ? "bg-gray-200" : "bg-white"} text-xs transition-colors`,
              onClick: () => updateObject({ rx: 10, ry: 10 }),
              title: "Medium",
              children: "md"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 ${((_f = properties.rx) != null ? _f : 0) === 20 ? "bg-gray-200" : "bg-white"} text-xs transition-colors`,
              onClick: () => updateObject({ rx: 20, ry: 20 }),
              title: "Large",
              children: "lg"
            }
          )
        ] })
      ] })
    ] })
  ] });
};
var rectangleProperties_default = RectangleProperties;
var fontWeightOptions = [
  { value: "100", label: "Thin" },
  { value: "200", label: "Extra Light" },
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi Bold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
  { value: "900", label: "Black" }
];
var fontFamilyOptions = [
  { value: "sans-serif", label: "Sans-serif" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
  { value: "poppins", label: "Poppins" }
];
var strokeWidthOptions2 = [
  { value: 0, label: "None" },
  { value: 1, label: "Thin" },
  { value: 2, label: "Medium" },
  { value: 3, label: "Thick" },
  { value: 4, label: "Extra Thick" }
];
var TextProperties = ({
  properties,
  updateObject,
  Select: Select2
}) => {
  var _a;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Text" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: properties.text,
          onChange: (e) => updateObject({ text: e.target.value }),
          className: "mt-1 w-full rounded-md border border-solid border-gray-300 px-2 py-1"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Font Size" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-1 flex gap-1 items-center", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
            onClick: () => updateObject({ fontSize: Number(toFloat(properties.fontSize)) - 1 }),
            children: "-"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: toFloat(properties.fontSize),
            onChange: (e) => updateObject({ fontSize: Number(e.target.value) }),
            className: "w-12 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100",
            onClick: () => updateObject({ fontSize: Number(toFloat(properties.fontSize)) + 1 }),
            children: "+"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Font Weight" }),
      /* @__PURE__ */ jsx(
        Select2,
        {
          options: fontWeightOptions,
          value: properties.fontWeight,
          onChange: (value) => updateObject({ fontWeight: value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Font Family" }),
      /* @__PURE__ */ jsx(
        Select2,
        {
          options: fontFamilyOptions,
          value: properties.fontFamily,
          onChange: (value) => updateObject({ fontFamily: value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Stroke Width" }),
      /* @__PURE__ */ jsx(
        Select2,
        {
          options: strokeWidthOptions2.map((option) => ({
            value: option.value.toString(),
            label: option.label
          })),
          value: ((_a = properties.strokeWidth) == null ? void 0 : _a.toString()) || "0",
          onChange: (value) => updateObject({ strokeWidth: Number(value) })
        }
      )
    ] })
  ] });
};
var textProperties_default = TextProperties;
var ColorProperties = ({
  properties,
  updateObject,
  objectType
}) => {
  var _a, _b, _c;
  const [syncColors, setSyncColors] = useState(false);
  useEffect(() => {
    setSyncColors(properties.stroke === properties.fill);
  }, [properties.stroke, properties.fill]);
  const handleFillChange = (value) => {
    updateObject({ fill: value });
    if (syncColors) {
      updateObject({ stroke: value });
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Fill Color" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "color",
            value: typeof properties.fill === "string" && /^#([0-9A-Fa-f]{6})$/.test(properties.fill) ? properties.fill : "#ffffff",
            onChange: (e) => handleFillChange(e.target.value),
            className: "h-8 w-8 bg-transparent rounded-md"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: (((_a = properties.fill) == null ? void 0 : _a.toString()) || "").toUpperCase(),
            onChange: (e) => handleFillChange(e.target.value),
            className: "ml-2 w-full rounded-md text-sm border border-solid border-gray-200 px-2 py-1 shadow-sm"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Stroke Color" }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center space-x-1 text-xs text-gray-600", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: syncColors,
              onChange: (e) => {
                setSyncColors(e.target.checked);
                if (e.target.checked) {
                  updateObject({ stroke: properties.fill });
                }
              },
              className: "h-3 w-3 rounded border-gray-300"
            }
          ),
          /* @__PURE__ */ jsx("span", { children: "Sync with fill" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "color",
            value: (properties == null ? void 0 : properties.stroke) === "transparent" ? "#ffffff" : ((_b = properties.stroke) == null ? void 0 : _b.toString()) || "#000000",
            onChange: (e) => updateObject({ stroke: e.target.value }),
            disabled: syncColors,
            className: `h-8 w-8 rounded-md bg-transparent ${syncColors ? "opacity-50" : ""}`
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: properties.stroke === "transparent" ? "transparent" : (((_c = properties.stroke) == null ? void 0 : _c.toString()) || "").toUpperCase(),
            onChange: (e) => updateObject({ stroke: e.target.value }),
            disabled: syncColors,
            className: `ml-2 w-full text-sm rounded-md border border-solid border-gray-200 px-2 py-1 shadow-sm ${syncColors ? "opacity-50" : ""}`
          }
        )
      ] })
    ] })
  ] });
};
var colorProperties_default = ColorProperties;
var CurrencySelect = ({ value, onChange }) => {
  const [options, setOptions] = useState([]);
  const [input, setInput] = useState("");
  const [show, setShow] = useState(false);
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all").then((res) => res.json()).then((data) => {
      const opts = [];
      data.forEach((country) => {
        if (country.currencies) {
          Object.entries(country.currencies).forEach(([code, cur]) => {
            opts.push({
              label: `${cur.name} (${cur.symbol || code}) - ${country.name.common}`,
              value: cur.symbol || code,
              country: country.name.common,
              code,
              symbol: cur.symbol || code
            });
          });
        }
      });
      const unique = Array.from(
        new Map(opts.map((o) => [o.code + o.country, o])).values()
      );
      setOptions(unique);
    });
  }, []);
  const filtered = input ? options.filter(
    (o) => o.label.toLowerCase().includes(input.toLowerCase()) || o.code.toLowerCase().includes(input.toLowerCase()) || o.symbol.toLowerCase().includes(input.toLowerCase())
  ) : options;
  const showClear = !!(value || input);
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        value: input || value,
        onChange: (e) => setInput(e.target.value),
        onFocus: () => setShow(true),
        placeholder: "Search currency...",
        className: "w-full rounded border border-solid border-gray-300 bg-white px-2 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
      }
    ),
    showClear && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700",
        onClick: () => {
          setInput("");
          onChange("", "", "");
        },
        tabIndex: -1,
        children: /* @__PURE__ */ jsx(LuX, { size: 16 })
      }
    ),
    show && /* @__PURE__ */ jsxs("div", { className: "absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded border border-solid border-gray-200 bg-white shadow-lg", children: [
      filtered.length === 0 && /* @__PURE__ */ jsx("div", { className: "px-3 py-2 text-sm text-gray-500", children: "No results" }),
      filtered.slice(0, 30).map((opt) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "cursor-pointer px-3 py-2 text-sm hover:bg-gray-100",
          onClick: () => {
            onChange(opt.symbol, opt.code, opt.country);
            setInput(`${opt.symbol} - ${opt.country}`);
            setShow(false);
          },
          children: opt.label
        },
        opt.code + opt.country
      ))
    ] })
  ] });
};
var CurrencySelect_default = CurrencySelect;
var statusOptions = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" }
];
var categoryOptions = [
  { value: "standard", label: "Standard" },
  { value: "vip", label: "VIP" },
  { value: "premium", label: "Premium" }
];
var SeatAttributes = ({
  properties,
  updateObject,
  Select: Select2
}) => {
  const { canvas } = useEventGuiStore();
  const [error, setError] = useState("");
  function isSeatNumberUnique(num) {
    if (!canvas || !num) return true;
    const allSeats = canvas.getObjects("circle");
    return !allSeats.some(
      (obj) => obj.seatNumber === num && obj !== canvas.getActiveObject()
    );
  }
  function handleSeatNumberChange(e) {
    const value = e.target.value;
    if (value && !isSeatNumberUnique(value)) {
      setError("Seat number already used");
    } else {
      setError("");
      updateObject({ seatNumber: value });
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Seat Number" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: properties.seatNumber === "mixed" ? "" : properties.seatNumber || "",
          placeholder: properties.seatNumber === "mixed" ? "\u2014" : "",
          onChange: handleSeatNumberChange,
          className: "mt-1 w-full rounded-md border border-solid border-gray-300 px-2 py-1"
        }
      ),
      error && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-red-500", children: error })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-medium text-gray-700", children: "Category" }),
      /* @__PURE__ */ jsx(
        Select2,
        {
          options: categoryOptions,
          value: properties.category === "mixed" ? "" : properties.category || "standard",
          onChange: (value) => updateObject({ category: value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-medium text-gray-700", children: "Price" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "number",
          value: properties.price === "mixed" ? "" : properties.price || 0,
          placeholder: properties.price === "mixed" ? "\u2014" : "",
          onChange: (e) => updateObject({ price: Number(e.target.value) }),
          className: "mt-1 w-full rounded-md border border-solid border-gray-300 px-2 py-1"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-medium text-gray-700", children: "Status" }),
      /* @__PURE__ */ jsx(
        Select2,
        {
          options: statusOptions,
          value: properties.status === "mixed" ? "" : properties.status || "available",
          onChange: (value) => updateObject({ status: value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-medium text-gray-700", children: "Currency" }),
      /* @__PURE__ */ jsx(
        CurrencySelect_default,
        {
          value: properties.currencySymbol || "",
          onChange: (symbol, code, country) => updateObject({
            currencySymbol: symbol,
            currencyCode: code,
            currencyCountry: country
          })
        }
      )
    ] })
  ] });
};
var seatAttributes_default = SeatAttributes;
var GridSpacing = ({
  canvas,
  selectedObjects
}) => {
  const [gridSpacing, setGridSpacing] = useState({ row: 65, column: 65 });
  const [gridLayout, setGridLayout] = useState({ rows: 2, columns: 2 });
  useEffect(() => {
    if (selectedObjects.length <= 1) return;
    const total = selectedObjects.length;
    const sqrt = Math.sqrt(total);
    const rows = Math.ceil(sqrt);
    const columns = Math.ceil(total / rows);
    setGridLayout({ rows, columns });
  }, [selectedObjects.length]);
  const updateGridLayout = useCallback(() => {
    if (!canvas || selectedObjects.length <= 1) return;
    const objects = canvas.getActiveObjects();
    if (objects.length > 1) {
      const firstObj = objects[0];
      const { rows, columns } = gridLayout;
      const { row: rowSpacing, column: columnSpacing } = gridSpacing;
      objects.forEach((obj, index) => {
        if (index === 0) return;
        const row = Math.floor(index / columns);
        const col = index % columns;
        obj.set({
          left: firstObj.left + col * columnSpacing,
          top: firstObj.top + row * rowSpacing
        });
      });
      canvas.renderAll();
    }
  }, [canvas, selectedObjects, gridLayout, gridSpacing]);
  const handleGridSpacingChange = useCallback(
    (type, value) => {
      if (!canvas || selectedObjects.length <= 1) return;
      const minSpacing = 5;
      const maxSpacing = 200;
      const clampedValue = Math.max(minSpacing, Math.min(maxSpacing, value));
      setGridSpacing((prev) => ({ ...prev, [type]: clampedValue }));
      updateGridLayout();
    },
    [canvas, selectedObjects, updateGridLayout]
  );
  const handleGridLayoutChange = useCallback(
    (type, value) => {
      if (!canvas || selectedObjects.length <= 1) return;
      const total = selectedObjects.length;
      let newValue = Math.max(1, Math.min(total, value));
      if (type === "rows") {
        const columns = Math.ceil(total / newValue);
        setGridLayout((prev) => ({ rows: newValue, columns }));
      } else {
        const rows = Math.ceil(total / newValue);
        setGridLayout((prev) => ({ rows, columns: newValue }));
      }
      updateGridLayout();
    },
    [canvas, selectedObjects, updateGridLayout]
  );
  if (selectedObjects.length <= 1) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-2 text-xs font-semibold text-gray-500", children: [
      "Editing ",
      selectedObjects.length,
      " seats"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-white p-4 shadow", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(LuGrid2X2, { className: "h-5 w-5 text-gray-500" }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Grid Layout" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm text-gray-600", children: "Rows" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50",
                  onClick: () => handleGridLayoutChange("rows", gridLayout.rows - 1),
                  disabled: gridLayout.rows <= 1,
                  title: "Decrease rows",
                  children: "-"
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: gridLayout.rows,
                  onChange: (e) => handleGridLayoutChange("rows", Number(e.target.value)),
                  className: "w-12 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                  min: "1",
                  max: selectedObjects.length,
                  step: "1",
                  title: `Enter number of rows (1-${selectedObjects.length})`
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50",
                  onClick: () => handleGridLayoutChange("rows", gridLayout.rows + 1),
                  disabled: gridLayout.rows >= selectedObjects.length,
                  title: "Increase rows",
                  children: "+"
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-gray-500", children: gridLayout.rows * gridLayout.columns >= selectedObjects.length ? `${gridLayout.rows} rows \xD7 ${gridLayout.columns} columns` : "Not enough space for all seats" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm text-gray-600", children: "Columns" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50",
                  onClick: () => handleGridLayoutChange("columns", gridLayout.columns - 1),
                  disabled: gridLayout.columns <= 1,
                  title: "Decrease columns",
                  children: "-"
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: gridLayout.columns,
                  onChange: (e) => handleGridLayoutChange("columns", Number(e.target.value)),
                  className: "w-12 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                  min: "1",
                  max: selectedObjects.length,
                  step: "1",
                  title: `Enter number of columns (1-${selectedObjects.length})`
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50",
                  onClick: () => handleGridLayoutChange("columns", gridLayout.columns + 1),
                  disabled: gridLayout.columns >= selectedObjects.length,
                  title: "Increase columns",
                  children: "+"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm text-gray-600", children: "Row Spacing" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50",
                  onClick: () => handleGridSpacingChange("row", gridSpacing.row - 5),
                  disabled: gridSpacing.row <= 5,
                  title: "Decrease row spacing",
                  children: "-"
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: gridSpacing.row,
                  onChange: (e) => handleGridSpacingChange("row", Number(e.target.value)),
                  className: "w-12 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                  min: "5",
                  max: "200",
                  step: "5",
                  title: "Enter row spacing (5-200)"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50",
                  onClick: () => handleGridSpacingChange("row", gridSpacing.row + 5),
                  disabled: gridSpacing.row >= 200,
                  title: "Increase row spacing",
                  children: "+"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm text-gray-600", children: "Column Spacing" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50",
                  onClick: () => handleGridSpacingChange("column", gridSpacing.column - 5),
                  disabled: gridSpacing.column <= 5,
                  title: "Decrease column spacing",
                  children: "-"
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: gridSpacing.column,
                  onChange: (e) => handleGridSpacingChange("column", Number(e.target.value)),
                  className: "w-12 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                  min: "5",
                  max: "200",
                  step: "5",
                  title: "Enter column spacing (5-200)"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50",
                  onClick: () => handleGridSpacingChange("column", gridSpacing.column + 5),
                  disabled: gridSpacing.column >= 200,
                  title: "Increase column spacing",
                  children: "+"
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
};
var gridSpacing_default = GridSpacing;
var Sidebar = () => {
  const { canvas } = useEventGuiStore();
  const [selectedObjects, setSelectedObjects] = useState(
    []
  );
  const [objectTypes, setObjectTypes] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [objectType, setObjectType] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const { properties, setProperties } = useObjectProperties(
    canvas,
    selectedObjects
  );
  const [lockAspect, setLockAspect] = useState(true);
  const { updateObject } = useObjectUpdater(canvas, setProperties, lockAspect);
  useEffect(() => {
    if (!canvas) return;
    const updateSelectedObjects = () => {
      var _a;
      const activeObjects = canvas.getActiveObjects();
      const activeObject = canvas.getActiveObject();
      setSelectedObjects(activeObjects);
      setSelectedObject(activeObjects[0] || null);
      setObjectType(
        (_a = activeObjects[0]) == null ? void 0 : _a.type
      );
      setObjectTypes(
        Array.from(
          new Set(
            activeObjects.map((obj) => obj.type).filter((type) => typeof type === "string")
          )
        )
      );
      if (activeObject && activeObject.type === "activeSelection") {
        setProperties((prev) => {
          var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
          return {
            ...prev,
            angle: (_a2 = activeObject.angle) != null ? _a2 : prev.angle,
            radius: (_b = activeObject.radius) != null ? _b : prev.radius,
            width: ((_c = activeObject.width) != null ? _c : prev.width) * ((_d = activeObject.scaleX) != null ? _d : 1),
            height: ((_e = activeObject.height) != null ? _e : prev.height) * ((_f = activeObject.scaleY) != null ? _f : 1),
            fill: (_g = activeObject.fill) != null ? _g : prev.fill,
            stroke: (_h = activeObject.stroke) != null ? _h : prev.stroke,
            text: (_i = activeObject.text) != null ? _i : prev.text,
            fontSize: (_j = activeObject.fontSize) != null ? _j : prev.fontSize,
            fontWeight: (_k = activeObject.fontWeight) != null ? _k : prev.fontWeight,
            fontFamily: (_l = activeObject.fontFamily) != null ? _l : prev.fontFamily,
            left: (_m = activeObject.left) != null ? _m : prev.left,
            top: (_n = activeObject.top) != null ? _n : prev.top,
            rx: (_o = activeObject.rx) != null ? _o : prev.rx,
            ry: (_p = activeObject.ry) != null ? _p : prev.ry
          };
        });
      } else if (activeObjects[0]) {
        setProperties((prev) => {
          var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
          return {
            ...prev,
            angle: (_a2 = activeObjects[0].angle) != null ? _a2 : prev.angle,
            radius: (_b = activeObjects[0].radius) != null ? _b : prev.radius,
            width: ((_c = activeObjects[0].width) != null ? _c : prev.width) * ((_d = activeObjects[0].scaleX) != null ? _d : 1),
            height: ((_e = activeObjects[0].height) != null ? _e : prev.height) * ((_f = activeObjects[0].scaleY) != null ? _f : 1),
            fill: (_g = activeObjects[0].fill) != null ? _g : prev.fill,
            stroke: (_h = activeObjects[0].stroke) != null ? _h : prev.stroke,
            text: (_i = activeObjects[0].text) != null ? _i : prev.text,
            fontSize: (_j = activeObjects[0].fontSize) != null ? _j : prev.fontSize,
            fontWeight: (_k = activeObjects[0].fontWeight) != null ? _k : prev.fontWeight,
            fontFamily: (_l = activeObjects[0].fontFamily) != null ? _l : prev.fontFamily,
            left: (_m = activeObjects[0].left) != null ? _m : prev.left,
            top: (_n = activeObjects[0].top) != null ? _n : prev.top,
            rx: (_o = activeObjects[0].rx) != null ? _o : prev.rx,
            ry: (_p = activeObjects[0].ry) != null ? _p : prev.ry
          };
        });
      }
    };
    const handleGroupTransform = (e) => {
      const obj = e.target;
      if (obj && obj.type === "activeSelection") {
        setProperties((prev) => {
          var _a, _b, _c;
          return {
            ...prev,
            left: (_a = obj.left) != null ? _a : prev.left,
            top: (_b = obj.top) != null ? _b : prev.top,
            angle: (_c = obj.angle) != null ? _c : prev.angle
          };
        });
      }
    };
    const eventsToListen = [
      "selection:created",
      "selection:updated",
      "object:moving",
      "object:rotating",
      "object:scaling",
      "object:modified"
    ];
    eventsToListen.forEach((event) => {
      canvas.on(event, updateSelectedObjects);
    });
    canvas.on("object:moving", handleGroupTransform);
    canvas.on("object:rotating", handleGroupTransform);
    canvas.on("selection:cleared", () => {
      setSelectedObjects([]);
      setSelectedObject(null);
      setObjectType(null);
      setObjectTypes([]);
    });
    return () => {
      eventsToListen.forEach((event) => {
        canvas.off(event, updateSelectedObjects);
      });
      canvas.off("object:moving", handleGroupTransform);
      canvas.off("object:rotating", handleGroupTransform);
      canvas.off("selection:cleared");
    };
  }, [canvas]);
  return /* @__PURE__ */ jsxs("div", { className: "h-full w-[20rem] space-y-4 border-0 border-l border-solid border-gray-200 bg-gray-50 p-4", children: [
    selectedObjects.length > 1 && objectTypes.length === 1 && objectTypes[0] === "circle" && /* @__PURE__ */ jsx(gridSpacing_default, { canvas, selectedObjects }),
    selectedObjects.length === 0 && !selectedObject && /* @__PURE__ */ jsxs("div", { className: "flex h-full select-none flex-col items-center py-8 text-gray-400", children: [
      /* @__PURE__ */ jsx(LuCircleFadingPlus, { className: "h-10 w-10 text-gray-400" }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-1 font-semibold text-gray-500", children: "No selection" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm", children: "Select a seat or shape to edit its properties." }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 text-xs text-gray-400", children: "Tip: Use the toolbar above to add new items." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 w-full max-w-xs rounded-lg border border-solid border-gray-200 bg-white/80 p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700", children: [
          /* @__PURE__ */ jsx(LuCommand, { className: "" }),
          "Command Palette"
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "mt-2 grid grid-cols-2 space-y-1 text-xs text-gray-500", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex font-semibold text-gray-700", children: [
              /* @__PURE__ */ jsx(LuCommand, { className: "text-[0.875rem]" }),
              " + Z"
            ] }),
            " ",
            "\u2014 Undo"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex font-semibold text-gray-700", children: [
              /* @__PURE__ */ jsx(LuCommand, { className: "text-[0.875rem]" }),
              " + Y"
            ] }),
            " ",
            "\u2014 Redo"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-700", children: "Delete" }),
            " \u2014 Remove"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex font-semibold text-gray-700", children: [
              /* @__PURE__ */ jsx(LuCommand, { className: "text-[0.875rem]" }),
              " + S"
            ] }),
            " ",
            "\u2014 Save"
          ] })
        ] })
      ] })
    ] }),
    selectedObject && /* @__PURE__ */ jsxs("div", { className: "space-y-4 rounded-md bg-white p-4 shadow", children: [
      objectType === "circle" && /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-2 border-0 border-b border-solid border-gray-200", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `px-3 py-1.5 text-sm font-medium ${activeTab === "basic" ? "border-0 border-b-2 border-solid border-gray-500 text-gray-600" : "text-gray-500 hover:text-gray-700"}`,
            onClick: () => setActiveTab("basic"),
            children: "Properties"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `px-3 py-1.5 text-sm font-medium ${activeTab === "attributes" ? "border-0 border-b-2 border-solid border-gray-500 text-gray-600" : "text-gray-500 hover:text-gray-700"}`,
            onClick: () => setActiveTab("attributes"),
            children: "Attributes"
          }
        )
      ] }),
      objectTypes.length === 1 && objectTypes[0] === "circle" && activeTab === "attributes" ? /* @__PURE__ */ jsx(
        seatAttributes_default,
        {
          properties,
          updateObject,
          Select: select_default,
          selectedObjects
        }
      ) : /* @__PURE__ */ jsxs(Fragment, { children: [
        objectType !== "circle" && /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Properties" }),
        /* @__PURE__ */ jsx(
          commonProperties_default,
          {
            properties: { ...properties, type: objectType || void 0 },
            updateObject
          }
        ),
        objectType === "circle" && /* @__PURE__ */ jsx(
          circleProperties_default,
          {
            properties,
            updateObject,
            Select: select_default
          }
        ),
        objectType === "rect" && /* @__PURE__ */ jsx(
          rectangleProperties_default,
          {
            properties,
            updateObject,
            Select: select_default
          }
        ),
        objectType === "i-text" && /* @__PURE__ */ jsx(
          textProperties_default,
          {
            properties,
            updateObject,
            Select: select_default
          }
        ),
        /* @__PURE__ */ jsx(
          colorProperties_default,
          {
            properties,
            updateObject,
            objectType
          }
        )
      ] })
    ] })
  ] });
};
var sidebar_default = Sidebar;
var createRect = (left, top) => {
  const rect = new fabric.Rect({
    left,
    top,
    fill: "#cccccc",
    stroke: "black",
    strokeWidth: 1,
    width: 100,
    height: 100,
    selectable: true,
    borderColor: "green",
    borderDashArray: [2, 4],
    padding: 2,
    cornerColor: "lightblue",
    cornerSize: 5,
    cornerStrokeColor: "blue",
    transparentCorners: false,
    id: v4(),
    strokeUniform: true,
    rx: 0,
    ry: 0
  });
  rect.setControlsVisibility({
    mt: false,
    mb: false,
    ml: false,
    mr: false
  });
  return rect;
};
var createSeat = (left, top, canvas) => {
  const seatNumber = getNextSeatNumber(canvas);
  const seat = new fabric.Circle({
    left,
    top,
    fill: "transparent",
    stroke: "black",
    strokeWidth: 1,
    radius: 10,
    selectable: true,
    borderColor: "green",
    borderDashArray: [2, 4],
    padding: 2,
    cornerColor: "lightblue",
    cornerSize: 5,
    cornerStrokeColor: "blue",
    transparentCorners: false,
    rx: 0.25,
    ry: 0.25,
    id: v4(),
    strokeUniform: true,
    seatNumber: String(seatNumber)
  });
  seat.setControlsVisibility({
    mt: false,
    mb: false,
    ml: false,
    mr: false
  });
  return seat;
};
var createText = (left, top, text = "Type here") => {
  const textObject = new fabric.IText(text, {
    left,
    top,
    fontSize: 20,
    fill: "black",
    selectable: true,
    borderColor: "green",
    borderDashArray: [2, 4],
    padding: 2,
    cornerColor: "lightblue",
    cornerSize: 5,
    cornerStrokeColor: "blue",
    transparentCorners: false,
    fontFamily: "sans-serif",
    id: v4(),
    strokeUniform: true
  });
  textObject.setControlsVisibility({
    mt: false,
    mb: false,
    ml: false,
    mr: false
  });
  return textObject;
};
function getNextSeatNumber(canvas) {
  if (!canvas) return 1;
  const allSeats = canvas.getObjects("circle");
  const numbers = allSeats.map((obj) => parseInt(obj.seatNumber || "", 10)).filter((n) => !isNaN(n));
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

// src/hooks/useCanvasSetup.ts
var useCanvasSetup = (canvasRef, canvasParent, setCanvas, width = 800, height = 600, backgroundColor = "#f8fafc", allowSelection = true) => {
  useEffect(() => {
    if (!canvasRef.current || !canvasParent.current) return;
    const c = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor,
      selection: allowSelection
    });
    setCanvas(c);
    const resizeCanvas = () => {
      if (canvasParent.current) {
        const parent = canvasParent.current;
        if (parent) {
          const { width: width2, height: height2 } = parent.getBoundingClientRect();
          c.setDimensions({ width: width2, height: height2 }, { cssOnly: false });
        }
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    const seat = createSeat(100, 100);
    seat.angle = 45;
    c.on("object:moving", (event) => {
      var _a, _b;
      const obj = event.target;
      const { width: canvasWidth, height: canvasHeight } = c;
      if (obj) {
        obj.setCoords();
        const rect = obj.getBoundingRect();
        let dx = 0, dy = 0;
        if (rect.left < 0) {
          dx = -rect.left;
        } else if (rect.left + rect.width > (canvasWidth != null ? canvasWidth : 0)) {
          dx = (canvasWidth != null ? canvasWidth : 0) - (rect.left + rect.width);
        }
        if (rect.top < 0) {
          dy = -rect.top;
        } else if (rect.top + rect.height > (canvasHeight != null ? canvasHeight : 0)) {
          dy = (canvasHeight != null ? canvasHeight : 0) - (rect.top + rect.height);
        }
        if (dx !== 0 || dy !== 0) {
          obj.left = ((_a = obj.left) != null ? _a : 0) + dx;
          obj.top = ((_b = obj.top) != null ? _b : 0) + dy;
          obj.setCoords();
        }
      }
    });
    c.on("selection:created", (event) => {
      const objs = event.selected || (event.target ? [event.target] : []);
      objs.forEach((obj) => {
        if (typeof obj.type === "string" && ["rect", "circle", "i-text"].includes(obj.type)) {
          obj.strokeUniform = true;
        }
      });
    });
    c.on("after:render", () => {
      c.getObjects().forEach((obj) => {
        if (typeof obj.type === "string" && ["rect", "circle", "i-text"].includes(obj.type)) {
          obj.strokeUniform = true;
        }
      });
    });
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      c.dispose();
    };
  }, [canvasRef, canvasParent, setCanvas, width, height]);
};
var useCanvasSetup_default = useCanvasSetup;
var useSelectionHandler = (canvas) => {
  useEffect(() => {
    if (!canvas) return;
    const handleSelection = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === "activeSelection") {
        activeObject.setControlsVisibility({
          mt: false,
          mb: false,
          ml: false,
          mr: false
        });
        activeObject.borderColor = "green";
        activeObject.borderDashArray = [2, 4];
        activeObject.padding = 4;
        activeObject.cornerColor = "lightblue";
        activeObject.cornerSize = 7;
        activeObject.cornerStrokeColor = "blue";
        canvas.requestRenderAll();
      }
    };
    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
    };
  }, [canvas]);
};
var useSelectionHandler_default = useSelectionHandler;
var useMultipleSeatCreator = (canvas, toolMode, setToolMode) => {
  const startPointRef = useRef(null);
  const highlightRectRef = useRef(null);
  useEffect(() => {
    if (!canvas) return;
    const handleMouseDown = (event) => {
      if (toolMode !== "multiple-seat") return;
      const pointer = canvas.getPointer(event.e);
      startPointRef.current = { x: pointer.x, y: pointer.y };
      const rect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 1,
        height: 1,
        fill: "rgba(0,0,255,0.1)",
        stroke: "blue",
        strokeDashArray: [4, 4],
        selectable: false,
        evented: false,
        excludeFromExport: true
      });
      highlightRectRef.current = rect;
      canvas.add(rect);
      canvas.bringToFront(rect);
    };
    const handleMouseMove = (event) => {
      if (toolMode !== "multiple-seat" || !startPointRef.current || !highlightRectRef.current)
        return;
      const pointer = canvas.getPointer(event.e);
      const rect = highlightRectRef.current;
      rect.set({
        width: Math.abs(pointer.x - startPointRef.current.x),
        height: Math.abs(pointer.y - startPointRef.current.y),
        left: Math.min(pointer.x, startPointRef.current.x),
        top: Math.min(pointer.y, startPointRef.current.y)
      });
      canvas.requestRenderAll();
      canvas.bringToFront(rect);
    };
    const handleMouseUp = (event) => {
      if (toolMode !== "multiple-seat" || !startPointRef.current) return;
      const endPoint = canvas.getPointer(event.e);
      const startPoint = startPointRef.current;
      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);
      const rows = Math.floor(height / 60);
      const cols = Math.floor(width / 60);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const left = startPoint.x + j * 60;
          const top = startPoint.y + i * 60;
          const seat = createSeat(left, top, canvas);
          canvas.add(seat);
        }
      }
      canvas.renderAll();
      if (highlightRectRef.current) {
        canvas.remove(highlightRectRef.current);
        highlightRectRef.current = null;
      }
      startPointRef.current = null;
      setToolMode("select");
    };
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvas, toolMode, setToolMode]);
};
var useMultipleSeatCreator_default = useMultipleSeatCreator;
var useObjectDeletion = (canvas, toolAction) => {
  useEffect(() => {
    if (!canvas) return;
    const deleteFunction = () => {
      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;
      if (activeObject.type === "activeSelection") {
        const activeSelection = activeObject;
        const objects = [...activeSelection.getObjects()];
        objects.forEach((obj) => canvas.remove(obj));
      } else {
        canvas.remove(activeObject);
      }
      canvas.discardActiveObject();
      canvas.renderAll();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Delete" || event.ctrlKey && event.key.toLowerCase() === "d") {
        deleteFunction();
      }
    };
    if (toolAction === "delete") {
      deleteFunction();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canvas, toolAction]);
};
var useObjectDeletion_default = useObjectDeletion;
var useObjectCreator = (canvas, toolMode, setToolMode) => {
  const startPointRef = useRef(null);
  const rectRef = useRef(null);
  const isDraggingRef = useRef(false);
  useEffect(() => {
    if (!canvas) return;
    const handleMouseDown = (event) => {
      const pointer = canvas.getPointer(event.e);
      if (toolMode === "one-seat") {
        const seat = createSeat(pointer.x, pointer.y, canvas);
        canvas.add(seat);
        canvas.renderAll();
      } else if (toolMode === "shape-square") {
        const rect = createRect(pointer.x, pointer.y);
        rectRef.current = rect;
        isDraggingRef.current = false;
        canvas.add(rect);
        canvas.setActiveObject(rect);
        startPointRef.current = { x: pointer.x, y: pointer.y };
      } else if (toolMode === "text") {
        const text = createText(pointer.x, pointer.y);
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();
      }
    };
    const handleMouseMove = (event) => {
      if (toolMode === "shape-square" && startPointRef.current && rectRef.current) {
        const pointer = canvas.getPointer(event.e);
        const width = Math.abs(pointer.x - startPointRef.current.x);
        const height = Math.abs(pointer.y - startPointRef.current.y);
        rectRef.current.set({
          width,
          height
        });
        isDraggingRef.current = true;
        canvas.renderAll();
      }
    };
    const handleMouseUp = () => {
      if (toolMode === "shape-square" && rectRef.current) {
        if (!isDraggingRef.current) {
          rectRef.current.set({ width: 100, height: 100 });
          canvas.renderAll();
        }
        startPointRef.current = null;
        rectRef.current = null;
        isDraggingRef.current = false;
      }
      setToolMode("select");
    };
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvas, toolMode, setToolMode]);
};
var useObjectCreator_default = useObjectCreator;
var useKeyboardShortcuts = (onSave) => {
  const { canvas, setLastClickedPoint, undo, redo } = useEventGuiStore();
  const { copySelectedObjects, cutSelectedObjects, pasteObjects } = useClipboardActions_default();
  useEffect(() => {
    if (!canvas) return;
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "c":
            e.preventDefault();
            copySelectedObjects();
            break;
          case "x":
            e.preventDefault();
            cutSelectedObjects();
            break;
          case "v":
            e.preventDefault();
            pasteObjects();
            break;
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case "y":
            e.preventDefault();
            redo();
            break;
          case "s":
            e.preventDefault();
            if (onSave) {
              const json = {
                type: "canvas",
                ...canvas.toJSON(["customType", "seatData", "zoneData"])
              };
              onSave(json);
            }
            break;
        }
      }
    };
    const handleMouseDown = (event) => {
      const pointer = canvas.getPointer(event.e);
      setLastClickedPoint({ x: pointer.x, y: pointer.y });
    };
    document.addEventListener("keydown", handleKeyDown);
    canvas.on("mouse:down", handleMouseDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      canvas.off("mouse:down", handleMouseDown);
    };
  }, [
    canvas,
    copySelectedObjects,
    cutSelectedObjects,
    pasteObjects,
    setLastClickedPoint,
    undo,
    redo,
    onSave
  ]);
};
var useKeyboardShortcuts_default = useKeyboardShortcuts;
var SNAP_THRESHOLD = 10;
function getSnapPoints(obj) {
  var _a, _b, _c, _d, _e, _f;
  const left = (_a = obj.left) != null ? _a : 0;
  const top = (_b = obj.top) != null ? _b : 0;
  const width = ((_c = obj.width) != null ? _c : 0) * ((_d = obj.scaleX) != null ? _d : 1);
  const height = ((_e = obj.height) != null ? _e : 0) * ((_f = obj.scaleY) != null ? _f : 1);
  return {
    left,
    right: left + width,
    top,
    bottom: top + height,
    centerX: left + width / 2,
    centerY: top + height / 2
  };
}
function useSmartSnap(canvas, snapEnabled) {
  const guideLines = useRef([]);
  useEffect(() => {
    if (!canvas || !snapEnabled) return;
    function clearGuides() {
      guideLines.current.forEach((line) => canvas.remove(line));
      guideLines.current = [];
    }
    const handleMoving = (e) => {
      var _a, _b;
      clearGuides();
      const moving = e.target;
      if (!moving) return;
      const movingPoints = getSnapPoints(moving);
      let snapX = (_a = moving.left) != null ? _a : 0;
      let snapY = (_b = moving.top) != null ? _b : 0;
      let snappedX = false;
      let snappedY = false;
      const others = canvas.getObjects().filter((obj) => obj !== moving && obj.selectable !== false);
      for (const obj of others) {
        const pts = getSnapPoints(obj);
        [pts.left, pts.centerX, pts.right].forEach((x) => {
          var _a2, _b2, _c, _d, _e, _f, _g;
          if (Math.abs(movingPoints.left - x) < SNAP_THRESHOLD) {
            snapX = x;
            snappedX = true;
            const line = new fabric.Line([x, 0, x, (_a2 = canvas.height) != null ? _a2 : 1e3], {
              stroke: "rgba(0,0,255,0.5)",
              selectable: false,
              evented: false,
              strokeDashArray: [4, 4],
              excludeFromExport: true
            });
            canvas.add(line);
            guideLines.current.push(line);
          }
          if (Math.abs(movingPoints.centerX - x) < SNAP_THRESHOLD) {
            snapX = x - ((_b2 = moving.width) != null ? _b2 : 0) * ((_c = moving.scaleX) != null ? _c : 1) / 2;
            snappedX = true;
            const line = new fabric.Line([x, 0, x, (_d = canvas.height) != null ? _d : 1e3], {
              stroke: "rgba(0,0,255,0.5)",
              selectable: false,
              evented: false,
              strokeDashArray: [4, 4],
              excludeFromExport: true
            });
            canvas.add(line);
            guideLines.current.push(line);
          }
          if (Math.abs(movingPoints.right - x) < SNAP_THRESHOLD) {
            snapX = x - ((_e = moving.width) != null ? _e : 0) * ((_f = moving.scaleX) != null ? _f : 1);
            snappedX = true;
            const line = new fabric.Line([x, 0, x, (_g = canvas.height) != null ? _g : 1e3], {
              stroke: "rgba(0,0,255,0.5)",
              selectable: false,
              evented: false,
              strokeDashArray: [4, 4],
              excludeFromExport: true
            });
            canvas.add(line);
            guideLines.current.push(line);
          }
        });
        [pts.top, pts.centerY, pts.bottom].forEach((y) => {
          var _a2, _b2, _c, _d, _e, _f, _g;
          if (Math.abs(movingPoints.top - y) < SNAP_THRESHOLD) {
            snapY = y;
            snappedY = true;
            const line = new fabric.Line([0, y, (_a2 = canvas.width) != null ? _a2 : 1e3, y], {
              stroke: "rgba(0,0,255,0.5)",
              selectable: false,
              evented: false,
              strokeDashArray: [4, 4],
              excludeFromExport: true
            });
            canvas.add(line);
            guideLines.current.push(line);
          }
          if (Math.abs(movingPoints.centerY - y) < SNAP_THRESHOLD) {
            snapY = y - ((_b2 = moving.height) != null ? _b2 : 0) * ((_c = moving.scaleY) != null ? _c : 1) / 2;
            snappedY = true;
            const line = new fabric.Line([0, y, (_d = canvas.width) != null ? _d : 1e3, y], {
              stroke: "rgba(0,0,255,0.5)",
              selectable: false,
              evented: false,
              strokeDashArray: [4, 4],
              excludeFromExport: true
            });
            canvas.add(line);
            guideLines.current.push(line);
          }
          if (Math.abs(movingPoints.bottom - y) < SNAP_THRESHOLD) {
            snapY = y - ((_e = moving.height) != null ? _e : 0) * ((_f = moving.scaleY) != null ? _f : 1);
            snappedY = true;
            const line = new fabric.Line([0, y, (_g = canvas.width) != null ? _g : 1e3, y], {
              stroke: "rgba(0,0,255,0.5)",
              selectable: false,
              evented: false,
              strokeDashArray: [4, 4],
              excludeFromExport: true
            });
            canvas.add(line);
            guideLines.current.push(line);
          }
        });
      }
      if (snappedX) moving.set({ left: snapX });
      if (snappedY) moving.set({ top: snapY });
      canvas.requestRenderAll();
    };
    const handleModified = () => {
      clearGuides();
      canvas.requestRenderAll();
    };
    canvas.on("object:moving", handleMoving);
    canvas.on("object:modified", handleModified);
    canvas.on("mouse:up", handleModified);
    return () => {
      canvas.off("object:moving", handleMoving);
      canvas.off("object:modified", handleModified);
      canvas.off("mouse:up", handleModified);
      clearGuides();
    };
  }, [canvas, snapEnabled]);
}
fabric.Circle.prototype.toObject = /* @__PURE__ */ function(toObject) {
  return function(propertiesToInclude = []) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u;
    return {
      ...toObject.call(this, propertiesToInclude),
      attributes: {
        number: (_c = (_b = (_a = this.attributes) == null ? void 0 : _a.number) != null ? _b : this.seatNumber) != null ? _c : "",
        price: (_f = (_e = (_d = this.attributes) == null ? void 0 : _d.price) != null ? _e : this.price) != null ? _f : "",
        category: (_i = (_h = (_g = this.attributes) == null ? void 0 : _g.category) != null ? _h : this.category) != null ? _i : "",
        status: (_l = (_k = (_j = this.attributes) == null ? void 0 : _j.status) != null ? _k : this.status) != null ? _l : "",
        currencySymbol: (_o = (_n = (_m = this.attributes) == null ? void 0 : _m.currencySymbol) != null ? _n : this.currencySymbol) != null ? _o : "",
        currencyCode: (_r = (_q = (_p = this.attributes) == null ? void 0 : _p.currencyCode) != null ? _q : this.currencyCode) != null ? _r : "",
        currencyCountry: (_u = (_t = (_s = this.attributes) == null ? void 0 : _s.currencyCountry) != null ? _t : this.currencyCountry) != null ? _u : ""
      }
    };
  };
}(fabric.Circle.prototype.toObject);
var origInitialize = fabric.Circle.prototype.initialize;
fabric.Circle.prototype.initialize = function(options) {
  origInitialize.call(this, options);
  if (options && options.attributes) {
    this.attributes = { ...options.attributes };
    this.seatNumber = options.attributes.number;
    this.price = options.attributes.price;
    this.category = options.attributes.category;
    this.status = options.attributes.status;
    this.currencySymbol = options.attributes.currencySymbol;
    this.currencyCode = options.attributes.currencyCode;
    this.currencyCountry = options.attributes.currencyCountry;
  }
  return this;
};
var defaultStyle = {
  width: 800,
  height: 600,
  backgroundColor: "#f8fafc",
  showSeatNumbers: true,
  seatNumberStyle: {
    fontSize: 14,
    fill: "#222",
    fontWeight: "bold",
    fontFamily: "Arial"
  },
  seatStyle: {
    fill: "transparent",
    stroke: "black",
    strokeWidth: 1,
    radius: 10
  }
};
var defaultLabels = {
  buyButton: "Buy Seat",
  cancelButton: "Cancel",
  seatNumber: "Seat Number",
  category: "Category",
  price: "Price",
  status: "Status"
};
var SeatPicker = ({
  className = "",
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
  labels = {}
}) => {
  const canvasRef = useRef(null);
  const canvasParent = useRef(null);
  const bgInputRef = useRef(null);
  const { canvas, setCanvas, toolMode, setToolMode, toolAction, snapEnabled } = useEventGuiStore();
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [bgOpacity] = useState(0.3);
  const mergedStyle = {
    ...defaultStyle,
    ...style,
    seatNumberStyle: {
      ...defaultStyle.seatNumberStyle,
      ...style.seatNumberStyle
    },
    seatStyle: {
      ...defaultStyle.seatStyle,
      ...style.seatStyle
    }
  };
  const mergedLabels = {
    ...defaultLabels,
    ...labels
  };
  const handleBgImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      var _a, _b;
      setBgImage((_a = e.target) == null ? void 0 : _a.result);
      if (canvas && canvas.getElement && canvas.getElement()) {
        fabric.Image.fromURL((_b = e.target) == null ? void 0 : _b.result, (img) => {
          img.set({ opacity: bgOpacity });
          const canvasRatio = canvas.width / canvas.height;
          const imgRatio = img.width / img.height;
          let scaleX, scaleY;
          if (imgRatio > canvasRatio) {
            scaleX = canvas.width / img.width;
            scaleY = scaleX;
          } else {
            scaleY = canvas.height / img.height;
            scaleX = scaleY;
          }
          const scaledWidth = img.width * scaleX;
          const scaledHeight = img.height * scaleY;
          const left = (canvas.width - scaledWidth) / 2;
          const top = (canvas.height - scaledHeight) / 2;
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX,
            scaleY,
            left,
            top
          });
        });
      }
    };
    reader.readAsDataURL(file);
  };
  const handleRemoveBgImage = () => {
    setBgImage(null);
    if (canvas && canvas.getElement && canvas.getElement()) {
      canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
    }
  };
  useEffect(() => {
    if (bgImage && canvas && canvas.getElement && canvas.getElement()) {
      fabric.Image.fromURL(bgImage, (img) => {
        img.set({ opacity: bgOpacity });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width / img.width,
          scaleY: canvas.height / img.height
        });
      });
    }
    if (!bgImage && canvas && canvas.getElement && canvas.getElement()) {
      canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
    }
  }, [bgImage, canvas, bgOpacity]);
  useCanvasSetup_default(
    canvasRef,
    canvasParent,
    setCanvas,
    mergedStyle.width,
    mergedStyle.height,
    mergedStyle.backgroundColor,
    !readOnly
  );
  useSelectionHandler_default(canvas);
  useMultipleSeatCreator_default(canvas, toolMode, setToolMode);
  useObjectDeletion_default(canvas, toolAction);
  useObjectCreator_default(canvas, toolMode, setToolMode);
  if (!readOnly) {
    useUndoRedo_default();
    useKeyboardShortcuts_default(onSave);
    useSmartSnap(canvas, snapEnabled);
  }
  useEffect(() => {
    if (!canvas || !layout) return;
    setBgImage(null);
    canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
    canvas.clear();
    let readOnlyMouseDownHandler = null;
    canvas.loadFromJSON(layout, () => {
      if (readOnly) {
        if (mergedStyle.showSeatNumbers) {
          canvas.getObjects("circle").forEach((seat) => {
            var _a, _b, _c, _d, _e, _f, _g;
            if (seat.labelObj) {
              canvas.remove(seat.labelObj);
              seat.labelObj = null;
            }
            const label = new fabric.Text(
              ((_b = (_a = seat.attributes) == null ? void 0 : _a.number) == null ? void 0 : _b.toString()) || ((_c = seat.seatNumber) == null ? void 0 : _c.toString()) || "",
              {
                left: ((_d = seat.left) != null ? _d : 0) + ((_e = seat.radius) != null ? _e : mergedStyle.seatStyle.radius),
                top: ((_f = seat.top) != null ? _f : 0) + ((_g = seat.radius) != null ? _g : mergedStyle.seatStyle.radius),
                ...mergedStyle.seatNumberStyle,
                originX: "center",
                originY: "center",
                selectable: false,
                evented: false
              }
            );
            seat.labelObj = label;
            canvas.add(label);
            canvas.bringToFront(label);
          });
        }
        canvas.getObjects().forEach((obj) => {
          obj.selectable = false;
          obj.evented = obj.type === "circle";
        });
        canvas.selection = false;
        readOnlyMouseDownHandler = (options) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u;
          if (!options.target || options.target.type !== "circle") return;
          const seat = options.target;
          const seatData = {
            number: (_c = (_b = (_a = seat.attributes) == null ? void 0 : _a.number) != null ? _b : seat.seatNumber) != null ? _c : "",
            price: (_f = (_e = (_d = seat.attributes) == null ? void 0 : _d.price) != null ? _e : seat.price) != null ? _f : "",
            category: (_i = (_h = (_g = seat.attributes) == null ? void 0 : _g.category) != null ? _h : seat.category) != null ? _i : "",
            status: (_l = (_k = (_j = seat.attributes) == null ? void 0 : _j.status) != null ? _k : seat.status) != null ? _l : "",
            currencySymbol: (_o = (_n = (_m = seat.attributes) == null ? void 0 : _m.currencySymbol) != null ? _n : seat.currencySymbol) != null ? _o : "",
            currencyCode: (_r = (_q = (_p = seat.attributes) == null ? void 0 : _p.currencyCode) != null ? _q : seat.currencyCode) != null ? _r : "",
            currencyCountry: (_u = (_t = (_s = seat.attributes) == null ? void 0 : _s.currencyCountry) != null ? _t : seat.currencyCountry) != null ? _u : ""
          };
          if (onSeatClick) {
            onSeatClick(seatData);
          } else {
            setSelectedSeat(seatData);
          }
        };
        canvas.on("mouse:down", readOnlyMouseDownHandler);
      } else {
        if (readOnlyMouseDownHandler) {
          canvas.off("mouse:down", readOnlyMouseDownHandler);
        }
        canvas.selection = true;
        canvas.getObjects().forEach((obj) => {
          obj.selectable = true;
          obj.evented = true;
        });
        console.log(
          "Edit mode objects:",
          canvas.getObjects().map((obj) => ({
            type: obj.type,
            selectable: obj.selectable,
            evented: obj.evented
          }))
        );
      }
      canvas.renderAll();
    });
    return () => {
      if (readOnlyMouseDownHandler) {
        canvas.off("mouse:down", readOnlyMouseDownHandler);
      }
    };
  }, [canvas, layout, readOnly, mergedStyle, onSeatClick]);
  useEffect(() => {
    if (!canvas || readOnly) return;
    const handleCanvasChange = () => {
      if (onChange) {
        const json = {
          type: "canvas",
          ...canvas.toJSON(["customType", "seatData", "zoneData"])
        };
        onChange(json);
      }
    };
    const events = [
      "object:modified",
      "object:added",
      "object:removed",
      "object:moving",
      "object:scaling",
      "object:rotating",
      "object:skewing",
      "path:created",
      "selection:created",
      "selection:updated",
      "selection:cleared"
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
  const handleSeatAction = (action) => {
    if (selectedSeat) {
      if (onSeatAction) {
        onSeatAction(action, selectedSeat);
      }
      setSelectedSeat(null);
    }
  };
  const handleSave = () => {
    if (!canvas || !onSave) return;
    const currentBg = canvas.backgroundImage;
    canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas), {
      dirty: false
    });
    const json = {
      type: "canvas",
      ...canvas.toJSON(["customType", "seatData", "zoneData"])
    };
    if (currentBg) {
      canvas.setBackgroundImage(currentBg, canvas.renderAll.bind(canvas));
    }
    onSave(json);
  };
  const defaultSeatDetails = /* @__PURE__ */ jsx(
    DefaultSeatModal,
    {
      selectedSeat,
      setSelectedSeat,
      mergedLabels,
      handleSeatAction
    }
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `relative flex h-full w-full flex-col bg-gray-200 ${className}`,
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            accept: "image/*",
            style: { display: "none" },
            ref: bgInputRef,
            onChange: (e) => {
              if (e.target.files && e.target.files[0]) {
                handleBgImageUpload(e.target.files[0]);
              }
            }
          }
        ),
        !readOnly && (renderToolbar ? renderToolbar({
          onSave: handleSave,
          onBgLayout: () => {
            var _a;
            if (bgImage) {
              handleRemoveBgImage();
            } else {
              (_a = bgInputRef.current) == null ? void 0 : _a.click();
            }
          }
        }) : /* @__PURE__ */ jsx(
          toolbar_default,
          {
            onSave: handleSave,
            onBgLayout: () => {
              var _a;
              if (bgImage) {
                handleRemoveBgImage();
              } else {
                (_a = bgInputRef.current) == null ? void 0 : _a.click();
              }
            }
          }
        )),
        /* @__PURE__ */ jsxs("div", { className: "flex h-0 w-full flex-1 overflow-hidden pt-12", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "m-auto flex flex-1 items-center justify-center overflow-auto bg-gray-100",
              ref: canvasParent,
              style: {
                width: "100%",
                height: "100%",
                maxWidth: mergedStyle.width,
                maxHeight: mergedStyle.height
              },
              children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef })
            }
          ),
          !readOnly && (renderSidebar ? renderSidebar() : /* @__PURE__ */ jsx(sidebar_default, {}))
        ] }),
        renderSeatDetails ? renderSeatDetails({
          seat: selectedSeat,
          onClose: () => setSelectedSeat(null),
          onAction: handleSeatAction
        }) : defaultSeatDetails
      ]
    }
  );
};
var components_default = SeatPicker;
var SeatLayoutRenderer = ({
  layout,
  style = { width: 800, height: 600, backgroundColor: "#f8fafc" }
}) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const c = new fabric.Canvas(canvasRef.current, {
      width: style.width,
      height: style.height,
      backgroundColor: style.backgroundColor,
      selection: false
    });
    setCanvas(c);
    return () => {
      c.dispose();
    };
  }, [style]);
  useEffect(() => {
    if (!canvas || !layout) return;
    canvas.clear();
    canvas.loadFromJSON(layout, () => {
      canvas.getObjects("circle").forEach((seat) => {
        var _a, _b, _c, _d, _e, _f, _g;
        if (seat.labelObj) {
          canvas.remove(seat.labelObj);
          seat.labelObj = null;
        }
        const label = new fabric.Text(
          ((_b = (_a = seat.attributes) == null ? void 0 : _a.number) == null ? void 0 : _b.toString()) || ((_c = seat.seatNumber) == null ? void 0 : _c.toString()) || "",
          {
            left: ((_d = seat.left) != null ? _d : 0) + ((_e = seat.radius) != null ? _e : 0),
            top: ((_f = seat.top) != null ? _f : 0) + ((_g = seat.radius) != null ? _g : 0),
            fontSize: 14,
            fill: "#222",
            originX: "center",
            originY: "center",
            selectable: false,
            evented: false,
            fontWeight: "bold"
          }
        );
        seat.labelObj = label;
        canvas.add(label);
        canvas.bringToFront(label);
      });
      canvas.getObjects().forEach((obj) => {
        obj.selectable = false;
        obj.evented = obj.type === "circle";
      });
      canvas.selection = false;
      canvas.on("mouse:down", (options) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u;
        if (!options.target || options.target.type !== "circle") return;
        const seat = options.target;
        setSelectedSeat({
          number: (_c = (_b = (_a = seat.attributes) == null ? void 0 : _a.number) != null ? _b : seat.seatNumber) != null ? _c : "",
          price: (_f = (_e = (_d = seat.attributes) == null ? void 0 : _d.price) != null ? _e : seat.price) != null ? _f : "",
          category: (_i = (_h = (_g = seat.attributes) == null ? void 0 : _g.category) != null ? _h : seat.category) != null ? _i : "",
          status: (_l = (_k = (_j = seat.attributes) == null ? void 0 : _j.status) != null ? _k : seat.status) != null ? _l : "",
          currencySymbol: (_o = (_n = (_m = seat.attributes) == null ? void 0 : _m.currencySymbol) != null ? _n : seat.currencySymbol) != null ? _o : "",
          currencyCode: (_r = (_q = (_p = seat.attributes) == null ? void 0 : _p.currencyCode) != null ? _q : seat.currencyCode) != null ? _r : "",
          currencyCountry: (_u = (_t = (_s = seat.attributes) == null ? void 0 : _s.currencyCountry) != null ? _t : seat.currencyCountry) != null ? _u : ""
        });
      });
      canvas.renderAll();
    });
  }, [canvas, layout]);
  const handleBuy = () => {
    setSelectedSeat(null);
  };
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-white p-4 shadow", children: [
    /* @__PURE__ */ jsx("canvas", { ref: canvasRef }),
    /* @__PURE__ */ jsx(
      Modal_default,
      {
        open: !!selectedSeat,
        onClose: () => setSelectedSeat(null),
        title: "Seat Details",
        children: selectedSeat && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-600", children: "Seat Number" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: selectedSeat.number })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-600", children: "Category" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: selectedSeat.category })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-600", children: "Price" }),
              /* @__PURE__ */ jsxs("p", { className: "text-lg font-semibold", children: [
                selectedSeat.currencySymbol,
                selectedSeat.price,
                " ",
                /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500", children: [
                  "(",
                  selectedSeat.currencyCode,
                  ")"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-600", children: "Status" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: selectedSeat.status })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleBuy,
                className: "flex-1 rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400",
                children: "Buy Seat"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setSelectedSeat(null),
                className: "flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400",
                children: "Cancel"
              }
            )
          ] })
        ] })
      }
    )
  ] });
};
var SeatLayoutRenderer_default = SeatLayoutRenderer;

export { SeatLayoutRenderer_default as SeatLayoutRenderer, components_default as SeatPicker };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map