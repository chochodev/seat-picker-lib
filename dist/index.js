import React, { useRef, useEffect, useCallback, useState } from 'react';
import { create } from 'zustand';
import { fabric } from 'fabric';
import { v4 } from 'uuid';
import { LuFile, LuFolderOpen, LuSave, LuMousePointer, LuGrid2X2, LuLayoutDashboard, LuPlus, LuUndo, LuRedo, LuScissors, LuCopy, LuClipboardCheck, LuTrash2, LuZoomOut, LuZoomIn, LuQrCode } from 'react-icons/lu';
import { RiText, RiShapeLine, RiApps2AddLine } from 'react-icons/ri';
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
    seats: state.seats.map((seat) => seat.id === id ? { ...seat, ...updates } : seat)
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
    zones: state.zones.map((zone) => zone.id === id ? { ...zone, ...updates } : zone)
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
        const currentState = JSON.stringify(canvas.toJSON(["id", "borderColor", "borderDashArray", "cornerColor", "cornerSize", "cornerStrokeColor", "transparentCorners", "rx", "ry"]));
        set({
          undoStack: [...undoStack, currentState],
          redoStack: redoStack.slice(1)
        });
      });
      set({ loading: false });
    }
  }
}));
var useClipboardActions = () => {
  const { canvas, clipboard, setClipboard, lastClickedPoint, setToolAction } = useEventGuiStore();
  const copySelectedObjects = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;
    setToolAction("copy");
    const clonedObjects = activeObjects.map((obj) => fabric.util.object.clone(obj));
    setClipboard(clonedObjects);
  };
  const cutSelectedObjects = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;
    setToolAction("cut");
    const clonedObjects = activeObjects.map((obj) => fabric.util.object.clone(obj));
    setClipboard(clonedObjects);
    canvas.remove(...activeObjects);
    canvas.discardActiveObject();
    canvas.renderAll();
  };
  const pasteObjects = () => {
    if (!canvas || !clipboard || !lastClickedPoint) return;
    const pastedObjects = clipboard.map((obj) => fabric.util.object.clone(obj));
    const boundingBox = getBoundingBox(pastedObjects);
    setToolAction("paste");
    pastedObjects.forEach((obj) => {
      const offsetX = lastClickedPoint.x - boundingBox.left;
      const offsetY = lastClickedPoint.y - boundingBox.top;
      obj.set({
        left: (obj.left || 0) + offsetX,
        top: (obj.top || 0) + offsetY
      });
      canvas.add(obj);
    });
    canvas.renderAll();
  };
  const getBoundingBox = (objects) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    objects.forEach((obj) => {
      const objBoundingRect = obj.getBoundingRect();
      minX = Math.min(minX, objBoundingRect.left);
      minY = Math.min(minY, objBoundingRect.top);
      maxX = Math.max(maxX, objBoundingRect.left + objBoundingRect.width);
      maxY = Math.max(maxY, objBoundingRect.top + objBoundingRect.height);
    });
    return { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
  };
  return { copySelectedObjects, cutSelectedObjects, pasteObjects };
};
var useClipboardActions_default = useClipboardActions;
var useUndoRedo = () => {
  const { canvas, addToUndoStack, undo, redo, undoStack } = useEventGuiStore();
  const handleObjectModified = useCallback(() => {
    if (canvas) {
      const jsonState = JSON.stringify(canvas.toJSON(["id", "borderColor", "borderDashArray", "cornerColor", "cornerSize", "cornerStrokeColor", "transparentCorners", "rx", "ry"]));
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
var Toolbar = () => {
  const {
    zoomLevel,
    setZoomLevel,
    toolMode,
    setToolMode,
    toolAction,
    setToolAction
  } = useEventGuiStore();
  const { copySelectedObjects, cutSelectedObjects, pasteObjects } = useClipboardActions_default();
  const { undo, redo } = useUndoRedo_default();
  const toggleMultipleSeatMode = () => {
    setToolMode(toolMode === "multiple-seat" ? "select" : "multiple-seat");
  };
  const buttonGroups = [
    { icon: LuFile, tooltip: "New File", onClick: () => {
    }, state: false },
    {
      icon: LuFolderOpen,
      tooltip: "Open File",
      onClick: () => {
      },
      state: false
    },
    { icon: LuSave, tooltip: "Save File", onClick: () => {
    }, state: false },
    {
      icon: LuMousePointer,
      tooltip: "Select",
      onClick: () => {
        setToolMode("select");
      },
      state: toolMode === "select"
    },
    { icon: LuGrid2X2, tooltip: "Grid View", onClick: () => {
    }, state: false },
    {
      icon: LuLayoutDashboard,
      tooltip: "Layout View",
      onClick: () => {
      },
      state: false
    },
    {
      icon: RiText,
      tooltip: "Add Text",
      onClick: () => {
        setToolMode("text");
      },
      state: toolMode === "text"
    },
    {
      icon: RiShapeLine,
      tooltip: "Add Square",
      onClick: () => {
        setToolMode("shape-square");
      },
      state: toolMode === "shape-square"
    },
    {
      icon: LuPlus,
      tooltip: "Add Seat",
      onClick: () => {
        setToolMode("one-seat");
      },
      state: toolMode === "one-seat"
    },
    {
      icon: RiApps2AddLine,
      tooltip: "Add Rows",
      onClick: toggleMultipleSeatMode,
      state: toolMode === "multiple-seat"
    },
    { icon: LuUndo, tooltip: "Undo", onClick: undo, state: false },
    { icon: LuRedo, tooltip: "Redo", onClick: redo, state: false },
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
      onClick: () => {
        setToolAction("delete");
      },
      state: false
      // toolAction === 'delete'
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "sticky top-0 left-0 z-[200] flex items-center gap-1 w-full bg-white px-[1rem] py-[0.5rem] shadow", children: [
    buttonGroups.map((item, index) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
      [6, 10, 12].includes(index) && /* @__PURE__ */ jsx(Separator, {}, `seperator-${index}`),
      3 === index && /* @__PURE__ */ jsx("div", { className: "flex-1" }, `space-${index}`),
      /* @__PURE__ */ jsx(
        Button,
        {
          icon: /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4" }),
          tooltip: item.tooltip,
          onClick: item.onClick,
          state: item.state
        },
        `button-${index}`
      )
    ] }, index)),
    /* @__PURE__ */ jsx(Separator, {}),
    /* @__PURE__ */ jsx(
      Button,
      {
        icon: /* @__PURE__ */ jsx(LuZoomOut, { className: "h-4 w-4" }),
        tooltip: "Zoom Out",
        onClick: () => setZoomLevel(zoomLevel - 10)
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center w-12 h-8 text-sm font-medium", children: [
      zoomLevel,
      "%"
    ] }),
    /* @__PURE__ */ jsx(
      Button,
      {
        icon: /* @__PURE__ */ jsx(LuZoomIn, { className: "h-4 w-4" }),
        tooltip: "Zoom In",
        onClick: () => setZoomLevel(zoomLevel + 10)
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex-1" }),
    /* @__PURE__ */ jsx(Button, { icon: /* @__PURE__ */ jsx(LuQrCode, { className: "h-4 w-4" }), tooltip: "QR Code" })
  ] });
};
var toolbar_default = Toolbar;
var Button = ({ icon, tooltip, state, ...props }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        className: `p-2 rounded-md hover:bg-gray-200/60 ${state ? "ring-1 ring-gray-400 shadow-sm shadow-gray-400" : ""} active:bg-gray-200 ease-250 `,
        onMouseEnter: () => setShowTooltip(true),
        onMouseLeave: () => setShowTooltip(false),
        ...props,
        children: icon
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `absolute left-1/2 transform -translate-x-1/2 ${showTooltip ? "top-[calc(100%+0.5rem)] opacity-100" : "top-[100%] opacity-0"} px-2 py-1 bg-gray-200 text-gray-900 text-[0.625rem] rounded whitespace-nowrap shadow-md ease-250`,
        children: tooltip
      }
    )
  ] });
};
var Separator = () => /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-gray-300 mx-[1rem] " });
var Select = ({ options, value, onChange, placeholder = "Select an option" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
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
        className: "flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500",
        onClick: handleToggle,
        children: [
          /* @__PURE__ */ jsx("span", { className: "block truncate", children: selectedOption ? selectedOption.label : placeholder }),
          /* @__PURE__ */ jsx("span", { className: "pointer-events-none", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-gray-400", viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M7 7l3-3 3 3m0 6l-3 3-3-3", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: `absolute z-10 w-full mt-1 bg-white border-solid border border-gray-300 shadow-lg rounded-[8px] overflow-hidden ${dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"} ${isOpen ? "opacity-100 user-select-auto visible" : "select-none user-select-none invisible opacity-0"} ease-250`, children: /* @__PURE__ */ jsx("ul", { className: "overflow-auto text-base max-h-60 focus:outline-none sm:text-sm", children: options.map((option) => /* @__PURE__ */ jsxs(
      "li",
      {
        className: `cursor-pointer select-none relative py-2 pl-3 pr-9 ${value === option.value ? "bg-gray-100 text-gray-600" : "text-gray-900 hover:bg-gray-50"}`,
        onClick: () => handleOptionClick(option.value),
        children: [
          /* @__PURE__ */ jsx("span", { className: "block truncate", children: option.label }),
          value === option.value && /* @__PURE__ */ jsx("span", { className: "absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }) })
        ]
      },
      option.value
    )) }) })
  ] });
};
var select_default = Select;
var useObjectProperties = (canvas, selectedObject) => {
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
  useEffect(() => {
    var _a, _b, _c, _d, _e, _f;
    if (!selectedObject) return;
    setProperties({
      angle: selectedObject.angle || 0,
      radius: selectedObject.radius * selectedObject.scaleX || 10,
      width: ((_a = selectedObject.width) != null ? _a : 100) * ((_b = selectedObject.scaleX) != null ? _b : 1),
      height: ((_c = selectedObject.height) != null ? _c : 100) * ((_d = selectedObject.scaleY) != null ? _d : 1),
      // ::::::::::: fill
      fill: selectedObject.fill ? String(selectedObject.fill).toUpperCase() === "BLACK" ? "#000000" : String(selectedObject.fill) : "transparent",
      // ::::::::::: stroke
      stroke: selectedObject.stroke ? Number(selectedObject.stroke) === 1 ? "#000000" : String(selectedObject.stroke) : "#000000",
      text: selectedObject.text || "",
      fontSize: selectedObject.fontSize || 20,
      fontWeight: selectedObject.fontWeight || "normal",
      fontFamily: selectedObject.fontFamily || "sans-serif",
      left: selectedObject.left || 0,
      top: selectedObject.top || 0,
      rx: (_e = selectedObject.rx) != null ? _e : 0,
      ry: (_f = selectedObject.ry) != null ? _f : 0,
      seatNumber: selectedObject.seatNumber || "",
      category: selectedObject.category || "",
      price: selectedObject.price || void 0,
      status: selectedObject.status || "available"
    });
  }, [selectedObject]);
  return { properties, setProperties };
};

// src/components/sidebar/hooks/useObjectUpdater.ts
var useObjectUpdater = (canvas, setProperties) => {
  const updateObject = (updates) => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;
    activeObjects.forEach((selectedObject) => {
      var _a, _b;
      const updatedProperties = {};
      for (const [key, value] of Object.entries(updates)) {
        if (selectedObject[key] !== value) {
          updatedProperties[key] = value;
        }
      }
      if ("stroke" in updatedProperties && updatedProperties.stroke !== void 0) {
        updatedProperties.stroke = String(updatedProperties.stroke);
      }
      if ("width" in updates && updates.width !== void 0) {
        selectedObject.set({ width: updates.width, scaleX: 1 });
        delete updatedProperties.width;
      }
      if ("height" in updates && updates.height !== void 0) {
        selectedObject.set({ height: updates.height, scaleY: 1 });
        delete updatedProperties.height;
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
          const newCenter = {
            x: ((_a = selectedObject.left) != null ? _a : 0) + dx,
            y: ((_b = selectedObject.top) != null ? _b : 0) + dy
          };
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
        /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Position X" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid",
              onClick: () => updateObject({ left: toFloat(properties.left) - 1 }),
              children: "-"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: toFloat(properties.left),
              onChange: (e) => updateObject({ left: Number(e.target.value) }),
              className: "border-solid w-16 px-1 py-0.5 text-center border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid",
              onClick: () => updateObject({ left: toFloat(properties.left) + 1 }),
              children: "+"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Position Y" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid",
              onClick: () => updateObject({ top: toFloat(properties.top) - 1 }),
              children: "-"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: toFloat(properties.top),
              onChange: (e) => updateObject({ top: Number(e.target.value) }),
              className: "border-solid w-16 px-1 py-0.5 text-center border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid",
              onClick: () => updateObject({ top: toFloat(properties.top) + 1 }),
              children: "+"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Width" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid",
              onClick: () => {
                var _a2;
                return updateObject({ width: toFloat((_a2 = properties.width) != null ? _a2 : 0) - 1 });
              },
              children: "-"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: toFloat((_a = properties.width) != null ? _a : 0),
              onChange: (e) => updateObject({ width: Number(e.target.value) }),
              className: "border-solid w-16 px-1 py-0.5 text-center border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid",
              onClick: () => {
                var _a2;
                return updateObject({ width: toFloat((_a2 = properties.width) != null ? _a2 : 0) + 1 });
              },
              children: "+"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Height" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid",
              onClick: () => {
                var _a2;
                return updateObject({ height: toFloat((_a2 = properties.height) != null ? _a2 : 0) - 1 });
              },
              children: "-"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: toFloat((_b = properties.height) != null ? _b : 0),
              onChange: (e) => updateObject({ height: Number(e.target.value) }),
              className: "border-solid w-16 px-1 py-0.5 text-center border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid",
              onClick: () => {
                var _a2;
                return updateObject({ height: toFloat((_a2 = properties.height) != null ? _a2 : 0) + 1 });
              },
              children: "+"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Angle" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid",
            onClick: () => updateObject({ angle: toFloat(properties.angle) - 1 }),
            children: "-"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: toFloat(properties.angle),
            onChange: (e) => updateObject({ angle: Number(e.target.value) }),
            className: "border-solid w-16 px-1 py-0.5 text-center border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid",
            onClick: () => updateObject({ angle: toFloat(properties.angle) + 1 }),
            children: "+"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 ml-1", children: angleOptions.map(({ value, label }) => /* @__PURE__ */ jsx(
          "button",
          {
            className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200 border-solid",
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
}) => /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
  /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Seat Number" }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        value: properties.seatNumber || "",
        onChange: (e) => updateObject({ seatNumber: e.target.value }),
        className: "mt-1 px-2 py-1 w-full border rounded-md"
      }
    )
  ] }),
  /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Category" }),
    /* @__PURE__ */ jsx(
      Select2,
      {
        options: categoryOptions,
        value: properties.category || "standard",
        onChange: (value) => updateObject({ category: value })
      }
    )
  ] }),
  /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Price" }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "number",
        value: properties.price || 0,
        onChange: (e) => updateObject({ price: Number(e.target.value) }),
        className: "mt-1 px-2 py-1 w-full border rounded-md"
      }
    )
  ] }),
  /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Status" }),
    /* @__PURE__ */ jsx(
      Select2,
      {
        options: statusOptions,
        value: properties.status || "available",
        onChange: (value) => updateObject({ status: value })
      }
    )
  ] })
] });
var CircleProperties = ({
  properties,
  updateObject,
  Select: Select2
}) => {
  const [activeTab, setActiveTab] = React.useState(
    "basic"
  );
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-gray-200", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: `px-3 py-1.5 text-sm font-medium ${activeTab === "basic" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`,
          onClick: () => setActiveTab("basic"),
          children: "Properties"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: `px-3 py-1.5 text-sm font-medium ${activeTab === "attributes" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`,
          onClick: () => setActiveTab("attributes"),
          children: "Attributes"
        }
      )
    ] }),
    activeTab === "basic" ? /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Radius" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded border border-gray-200 border-solid text-xs transition-colors",
              onClick: () => updateObject({ radius: toFloat(properties.radius) - 1 }),
              children: "-"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: toFloat(properties.radius),
              onChange: (e) => updateObject({ radius: Number(e.target.value) }),
              className: "w-12 px-1 py-0.5 text-center border border-gray-200 border-solid rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded border border-gray-200 border-solid text-xs transition-colors",
              onClick: () => updateObject({ radius: toFloat(properties.radius) + 1 }),
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mb-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `w-6 h-6 flex items-center justify-center rounded border border-gray-200 border-solid ${properties.radius === 0 ? "bg-gray-200" : "bg-white"} transition-colors`,
              onClick: () => updateObject({ radius: 0 }),
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
              className: `w-6 h-6 flex items-center justify-center rounded border border-gray-200 border-solid ${properties.radius === 4 ? "bg-gray-200" : "bg-white"} transition-colors text-xs`,
              onClick: () => updateObject({ radius: 4 }),
              title: "Small",
              children: "sm"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `w-6 h-6 flex items-center justify-center rounded border border-gray-200 border-solid ${properties.radius === 10 ? "bg-gray-200" : "bg-white"} transition-colors text-xs`,
              onClick: () => updateObject({ radius: 10 }),
              title: "Medium",
              children: "md"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `w-6 h-6 flex items-center justify-center rounded border border-gray-200 border-solid ${properties.radius === 20 ? "bg-gray-200" : "bg-white"} transition-colors text-xs`,
              onClick: () => updateObject({ radius: 20 }),
              title: "Large",
              children: "lg"
            }
          )
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsx(
      SeatAttributes,
      {
        properties,
        updateObject,
        Select: Select2
      }
    )
  ] });
};
var circleProperties_default = CircleProperties;
var strokeWidthOptions = [
  { value: 0, label: "None" },
  { value: 1, label: "Thin" },
  { value: 2, label: "Medium" },
  { value: 3, label: "Thick" },
  { value: 4, label: "Extra Thick" }
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
    /* @__PURE__ */ jsxs("div", { className: "flex items-center mt-2", children: [
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
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Stroke Width" }),
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
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Border Radius" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded border border-gray-200 border-solid text-xs transition-colors",
              onClick: () => {
                var _a2, _b2;
                return updateObject({
                  rx: toFloat((_a2 = properties.rx) != null ? _a2 : 0) - 1,
                  ry: toFloat((_b2 = properties.ry) != null ? _b2 : 0) - 1
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
              className: "w-12 px-1 py-0.5 text-center border border-gray-200 border-solid rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded border border-gray-200 border-solid text-xs transition-colors",
              onClick: () => {
                var _a2, _b2;
                return updateObject({
                  rx: toFloat((_a2 = properties.rx) != null ? _a2 : 0) + 1,
                  ry: toFloat((_b2 = properties.ry) != null ? _b2 : 0) + 1
                });
              },
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mb-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `w-6 h-6 flex items-center justify-center rounded border border-gray-200 border-solid ${((_c = properties.rx) != null ? _c : 0) === 0 ? "bg-gray-200" : "bg-white"} transition-colors`,
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
              className: `w-6 h-6 flex items-center justify-center rounded border border-gray-200 border-solid ${((_d = properties.rx) != null ? _d : 0) === 4 ? "bg-gray-200" : "bg-white"} transition-colors text-xs`,
              onClick: () => updateObject({ rx: 4, ry: 4 }),
              title: "Small",
              children: "sm"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `w-6 h-6 flex items-center justify-center rounded border border-gray-200 border-solid ${((_e = properties.rx) != null ? _e : 0) === 10 ? "bg-gray-200" : "bg-white"} transition-colors text-xs`,
              onClick: () => updateObject({ rx: 10, ry: 10 }),
              title: "Medium",
              children: "md"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `w-6 h-6 flex items-center justify-center rounded border border-gray-200 border-solid ${((_f = properties.rx) != null ? _f : 0) === 20 ? "bg-gray-200" : "bg-white"} transition-colors text-xs`,
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
          className: "mt-1 px-2 py-1 w-full border rounded-md"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Font Size" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center mt-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "px-2 py-1 bg-gray-200 rounded-l-md",
            onClick: () => updateObject({ fontSize: toFloat(properties.fontSize) - 1 }),
            children: "-"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: toFloat(properties.fontSize),
            onChange: (e) => updateObject({ fontSize: Number(e.target.value) }),
            className: "w-full px-2 py-1 text-center border-t border-b shadow-sm"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "px-2 py-1 bg-gray-200 rounded-r-md",
            onClick: () => updateObject({ fontSize: toFloat(properties.fontSize) + 1 }),
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
  var _a, _b, _c, _d;
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
      /* @__PURE__ */ jsxs("div", { className: "flex items-center mt-1", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "color",
            value: typeof properties.fill === "string" && /^#([0-9A-Fa-f]{6})$/.test(properties.fill) ? "#ffffff" : ((_a = properties.fill) == null ? void 0 : _a.toString()) || "#ffffff",
            onChange: (e) => handleFillChange(e.target.value),
            className: "w-8 h-8 rounded-md border shadow-sm"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: typeof properties.fill === "string" && /^#([0-9A-Fa-f]{6})$/.test(properties.fill) ? "transparent" : (((_b = properties.fill) == null ? void 0 : _b.toString()) || "").toUpperCase(),
            onChange: (e) => handleFillChange(e.target.value),
            className: "ml-2 px-2 py-1 w-full border rounded-md shadow-sm"
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
              className: "w-3 h-3 rounded border-gray-300"
            }
          ),
          /* @__PURE__ */ jsx("span", { children: "Sync with fill" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center mt-1", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "color",
            value: (properties == null ? void 0 : properties.stroke) === "transparent" ? "#ffffff" : ((_c = properties.stroke) == null ? void 0 : _c.toString()) || "#000000",
            onChange: (e) => updateObject({ stroke: e.target.value }),
            disabled: syncColors,
            className: `w-8 h-8 rounded-md border shadow-sm ${syncColors ? "opacity-50" : ""}`
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: properties.stroke === "transparent" ? "transparent" : (((_d = properties.stroke) == null ? void 0 : _d.toString()) || "").toUpperCase(),
            onChange: (e) => updateObject({ stroke: e.target.value }),
            disabled: syncColors,
            className: `ml-2 px-2 py-1 w-full border rounded-md shadow-sm ${syncColors ? "opacity-50" : ""}`
          }
        )
      ] })
    ] })
  ] });
};
var colorProperties_default = ColorProperties;
var statusOptions2 = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" }
];
var categoryOptions2 = [
  { value: "standard", label: "Standard" },
  { value: "vip", label: "VIP" },
  { value: "premium", label: "Premium" }
];
var SeatAttributes2 = ({
  properties,
  updateObject,
  Select: Select2
}) => /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
  /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Seat Number" }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        value: properties.seatNumber || "",
        onChange: (e) => updateObject({ seatNumber: e.target.value }),
        className: "mt-1 px-2 py-1 w-full border rounded-md"
      }
    )
  ] }),
  /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Category" }),
    /* @__PURE__ */ jsx(
      Select2,
      {
        options: categoryOptions2,
        value: properties.category || "standard",
        onChange: (value) => updateObject({ category: value })
      }
    )
  ] }),
  /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Price" }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "number",
        value: properties.price || 0,
        onChange: (e) => updateObject({ price: Number(e.target.value) }),
        className: "mt-1 px-2 py-1 w-full border rounded-md"
      }
    )
  ] }),
  /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Status" }),
    /* @__PURE__ */ jsx(
      Select2,
      {
        options: statusOptions2,
        value: properties.status || "available",
        onChange: (value) => updateObject({ status: value })
      }
    )
  ] })
] });
var seatAttributes_default = SeatAttributes2;
var Sidebar = () => {
  const { canvas } = useEventGuiStore();
  const [selectedObject, setSelectedObject] = useState(null);
  const [objectType, setObjectType] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const { properties, setProperties } = useObjectProperties(
    canvas,
    selectedObject
  );
  const { updateObject } = useObjectUpdater(canvas, setProperties);
  useEffect(() => {
    if (!canvas) return;
    const updateSelectedObject = () => {
      const activeObject = canvas.getActiveObject();
      setSelectedObject(activeObject || null);
      setObjectType(activeObject == null ? void 0 : activeObject.type);
      if (activeObject) {
        setProperties((prev) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
          return {
            ...prev,
            angle: (_a = activeObject.angle) != null ? _a : prev.angle,
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
      canvas.on(event, updateSelectedObject);
    });
    canvas.on("selection:cleared", () => {
      setSelectedObject(null);
      setObjectType(null);
    });
    return () => {
      eventsToListen.forEach((event) => {
        canvas.off(event, updateSelectedObject);
      });
      canvas.off("selection:cleared");
    };
  }, [canvas]);
  return /* @__PURE__ */ jsxs("div", { className: "w-[20rem] min-h-screen bg-gray-50 p-4 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-md shadow", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-200 rounded-t-md", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Zones" }),
        /* @__PURE__ */ jsx("button", { className: "text-gray-600 hover:text-gray-800", children: /* @__PURE__ */ jsx(LuPlus, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-2 flex items-center space-x-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            id: "ground-floor",
            className: "rounded text-gray-600"
          }
        ),
        /* @__PURE__ */ jsx("label", { htmlFor: "ground-floor", children: "Ground floor" })
      ] })
    ] }),
    selectedObject && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-md shadow p-4 space-y-4", children: [
      objectType === "circle" && /* @__PURE__ */ jsxs("div", { className: "flex items-center border-solid gap-2 border-0 border-b border-gray-200 mb-4", children: [
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
      objectType === "circle" && activeTab === "attributes" ? /* @__PURE__ */ jsx(
        seatAttributes_default,
        {
          properties,
          updateObject,
          Select: select_default
        }
      ) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Properties" }),
        /* @__PURE__ */ jsx(
          commonProperties_default,
          {
            properties,
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
var CustomRect = class extends fabric.Rect {
  constructor(options) {
    super(options);
    this.id = options.id || v4();
  }
  toObject(propertiesToInclude = []) {
    return fabric.util.object.extend(super.toObject(propertiesToInclude), {
      id: this.id,
      borderColor: this.borderColor,
      borderDashArray: this.borderDashArray,
      cornerColor: this.cornerColor,
      cornerSize: this.cornerSize,
      cornerStrokeColor: this.cornerStrokeColor,
      transparentCorners: this.transparentCorners,
      rx: this.rx,
      ry: this.ry
    });
  }
};
var CustomCircle = class extends fabric.Circle {
  constructor(options) {
    super(options);
    this.id = options.id || v4();
  }
  toObject(propertiesToInclude = []) {
    return fabric.util.object.extend(super.toObject(propertiesToInclude), {
      id: this.id,
      borderColor: this.borderColor,
      borderDashArray: this.borderDashArray,
      cornerColor: this.cornerColor,
      cornerSize: this.cornerSize,
      cornerStrokeColor: this.cornerStrokeColor,
      transparentCorners: this.transparentCorners,
      rx: this.radius,
      ry: this.radius
    });
  }
};
var CustomText = class extends fabric.IText {
  constructor(options) {
    super(options.text, options);
    this.id = options.id || v4();
  }
  toObject(propertiesToInclude = []) {
    return fabric.util.object.extend(super.toObject(propertiesToInclude), {
      id: this.id,
      borderColor: this.borderColor,
      borderDashArray: this.borderDashArray,
      cornerColor: this.cornerColor,
      cornerSize: this.cornerSize,
      cornerStrokeColor: this.cornerStrokeColor,
      transparentCorners: this.transparentCorners
    });
  }
};
var createRect = (left, top) => {
  const rect = new CustomRect({
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
var createSeat = (left, top) => {
  const seat = new CustomCircle({
    left,
    top,
    fill: "transparent",
    stroke: 1,
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
    strokeUniform: true
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
  const textObject = new CustomText({
    left,
    top,
    text,
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

// src/hooks/useCanvasSetup.ts
var useCanvasSetup = (canvasRef, canvasParent, setCanvas) => {
  useEffect(() => {
    if (!canvasRef.current || !canvasParent.current) return;
    const newCanvas = new fabric.Canvas(canvasRef.current);
    setCanvas(newCanvas);
    const resizeCanvas = () => {
      if (canvasParent.current) {
        const parent = canvasParent.current;
        if (parent) {
          const { width, height } = parent.getBoundingClientRect();
          newCanvas.setDimensions({ width, height }, { cssOnly: false });
        }
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    const seat = createSeat(100, 100);
    seat.angle = 45;
    newCanvas.on("object:moving", (event) => {
      var _a, _b;
      const obj = event.target;
      const { width: canvasWidth, height: canvasHeight } = newCanvas;
      if (obj) {
        obj.setCoords();
        const rect = obj.getBoundingRect();
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
          obj.left = ((_a = obj.left) != null ? _a : 0) + dx;
          obj.top = ((_b = obj.top) != null ? _b : 0) + dy;
          obj.setCoords();
        }
      }
    });
    newCanvas.on("selection:created", (event) => {
      const objs = event.selected || (event.target ? [event.target] : []);
      objs.forEach((obj) => {
        if (["rect", "circle", "i-text"].includes(obj.type)) {
          obj.strokeUniform = true;
        }
      });
    });
    newCanvas.on("after:render", () => {
      newCanvas.getObjects().forEach((obj) => {
        if (["rect", "circle", "i-text"].includes(obj.type)) {
          obj.strokeUniform = true;
        }
      });
    });
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      newCanvas.dispose();
    };
  }, [canvasRef, canvasParent, setCanvas]);
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
  useEffect(() => {
    if (!canvas) return;
    const handleMouseDown = (event) => {
      if (toolMode !== "multiple-seat") return;
      const pointer = canvas.getPointer(event.e);
      startPointRef.current = { x: pointer.x, y: pointer.y };
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
          const seat = createSeat(left, top);
          canvas.add(seat);
        }
      }
      canvas.renderAll();
      startPointRef.current = null;
      setToolMode("select");
    };
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:up", handleMouseUp);
    return () => {
      canvas.off("mouse:down", handleMouseDown);
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
        const seat = createSeat(pointer.x, pointer.y);
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
var useKeyboardShortcuts = () => {
  const { canvas, setLastClickedPoint } = useEventGuiStore();
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
  }, [canvas, copySelectedObjects, cutSelectedObjects, pasteObjects, setLastClickedPoint]);
};
var useKeyboardShortcuts_default = useKeyboardShortcuts;
var SeatCanvas = ({ className }) => {
  const canvasRef = useRef(null);
  const canvasParent = useRef(null);
  const { canvas, setCanvas, toolMode, setToolMode, toolAction } = useEventGuiStore();
  useCanvasSetup_default(canvasRef, canvasParent, setCanvas);
  useSelectionHandler_default(canvas);
  useMultipleSeatCreator_default(canvas, toolMode, setToolMode);
  useObjectDeletion_default(canvas, toolAction);
  useObjectCreator_default(canvas, toolMode, setToolMode);
  useUndoRedo_default();
  useKeyboardShortcuts_default();
  return /* @__PURE__ */ jsxs("div", { className: `relative size-full bg-gray-200 ${className}`, children: [
    /* @__PURE__ */ jsx(toolbar_default, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between w-full", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-full max-w-[45rem] mx-auto bg-gray-100",
          ref: canvasParent,
          children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef })
        }
      ),
      /* @__PURE__ */ jsx(sidebar_default, {})
    ] })
  ] });
};
var components_default = SeatCanvas;

export { components_default as SeatPicker };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map