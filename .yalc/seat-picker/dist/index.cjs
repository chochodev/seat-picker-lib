'use strict';

var React = require('react');
var zustand = require('zustand');
var fabric = require('fabric');
var uuid = require('uuid');
var lu = require('react-icons/lu');
var ri = require('react-icons/ri');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

// src/components/index.tsx
var useEventGuiStore = zustand.create((set, get) => ({
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
  zones: [{ id: uuid.v4(), name: "Ground floor", isChecked: true }],
  // ::::::::::::::::::: Add zone
  addZone: (name) => set((state) => ({
    zones: [...state.zones, { id: uuid.v4(), name, isChecked: true }]
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
          if (obj instanceof fabric.fabric.Circle) {
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
          if (obj instanceof fabric.fabric.Circle) {
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
    const clonedObjects = activeObjects.map((obj) => fabric.fabric.util.object.clone(obj));
    setClipboard(clonedObjects);
  };
  const cutSelectedObjects = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;
    setToolAction("cut");
    const clonedObjects = activeObjects.map((obj) => fabric.fabric.util.object.clone(obj));
    setClipboard(clonedObjects);
    canvas.remove(...activeObjects);
    canvas.discardActiveObject();
    canvas.renderAll();
  };
  const pasteObjects = () => {
    if (!canvas || !clipboard || !lastClickedPoint) return;
    const pastedObjects = clipboard.map((obj) => fabric.fabric.util.object.clone(obj));
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
  const handleObjectModified = React.useCallback(() => {
    if (canvas) {
      const jsonState = JSON.stringify(canvas.toJSON(["id", "borderColor", "borderDashArray", "cornerColor", "cornerSize", "cornerStrokeColor", "transparentCorners", "rx", "ry"]));
      addToUndoStack(jsonState);
    }
  }, [canvas, addToUndoStack]);
  React.useEffect(() => {
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
    { icon: lu.LuFile, tooltip: "New File", onClick: () => {
    }, state: false },
    {
      icon: lu.LuFolderOpen,
      tooltip: "Open File",
      onClick: () => {
      },
      state: false
    },
    { icon: lu.LuSave, tooltip: "Save File", onClick: () => {
    }, state: false },
    {
      icon: lu.LuMousePointer,
      tooltip: "Select",
      onClick: () => {
        setToolMode("select");
      },
      state: toolMode === "select"
    },
    { icon: lu.LuGrid2X2, tooltip: "Grid View", onClick: () => {
    }, state: false },
    { icon: lu.LuLayoutDashboard, tooltip: "Layout View", onClick: () => {
    }, state: false },
    {
      icon: ri.RiText,
      tooltip: "Add Text",
      onClick: () => {
        setToolMode("text");
      },
      state: toolMode === "text"
    },
    {
      icon: ri.RiShapeLine,
      tooltip: "Add Square",
      onClick: () => {
        setToolMode("shape-square");
      },
      state: toolMode === "shape-square"
    },
    {
      icon: lu.LuPlus,
      tooltip: "Add Seat",
      onClick: () => {
        setToolMode("one-seat");
      },
      state: toolMode === "one-seat"
    },
    {
      icon: ri.RiApps2AddLine,
      tooltip: "Add Rows",
      onClick: toggleMultipleSeatMode,
      state: toolMode === "multiple-seat"
    },
    { icon: lu.LuUndo, tooltip: "Undo", onClick: undo, state: false },
    { icon: lu.LuRedo, tooltip: "Redo", onClick: redo, state: false },
    {
      icon: lu.LuScissors,
      tooltip: "Cut",
      onClick: cutSelectedObjects,
      state: toolAction === "cut"
    },
    {
      icon: lu.LuCopy,
      tooltip: "Copy",
      onClick: copySelectedObjects,
      state: toolAction === "copy"
    },
    {
      icon: lu.LuClipboardCheck,
      tooltip: "Paste",
      onClick: pasteObjects,
      state: toolAction === "paste"
    },
    {
      icon: lu.LuTrash2,
      tooltip: "Delete",
      onClick: () => {
        setToolAction("delete");
      },
      state: false
      // toolAction === 'delete'
    }
  ];
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "sticky top-0 left-0 z-[200] flex items-center gap-1 w-full bg-white px-[1rem] py-[0.5rem] shadow", children: [
    buttonGroups.map((item, index) => /* @__PURE__ */ jsxRuntime.jsxs(React__default.default.Fragment, { children: [
      [6, 10, 12].includes(index) && /* @__PURE__ */ jsxRuntime.jsx(Separator, {}, `seperator-${index}`),
      3 === index && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1" }, `space-${index}`),
      /* @__PURE__ */ jsxRuntime.jsx(
        Button,
        {
          icon: /* @__PURE__ */ jsxRuntime.jsx(item.icon, { className: "h-4 w-4" }),
          tooltip: item.tooltip,
          onClick: item.onClick,
          state: item.state
        },
        `button-${index}`
      )
    ] }, index)),
    /* @__PURE__ */ jsxRuntime.jsx(Separator, {}),
    /* @__PURE__ */ jsxRuntime.jsx(
      Button,
      {
        icon: /* @__PURE__ */ jsxRuntime.jsx(lu.LuZoomOut, { className: "h-4 w-4" }),
        tooltip: "Zoom Out",
        onClick: () => setZoomLevel(zoomLevel - 10)
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-center w-12 h-8 text-sm font-medium", children: [
      zoomLevel,
      "%"
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      Button,
      {
        icon: /* @__PURE__ */ jsxRuntime.jsx(lu.LuZoomIn, { className: "h-4 w-4" }),
        tooltip: "Zoom In",
        onClick: () => setZoomLevel(zoomLevel + 10)
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1" }),
    /* @__PURE__ */ jsxRuntime.jsx(Button, { icon: /* @__PURE__ */ jsxRuntime.jsx(lu.LuQrCode, { className: "h-4 w-4" }), tooltip: "QR Code" })
  ] });
};
var toolbar_default = Toolbar;
var Button = ({ icon, tooltip, ...props }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        className: `p-2 rounded-md hover:bg-gray-200/60 ${props.state ? "ring-1 ring-gray-400 shadow-sm shadow-gray-400" : ""} active:bg-gray-200 ease-250 `,
        onMouseEnter: () => setShowTooltip(true),
        onMouseLeave: () => setShowTooltip(false),
        ...props,
        children: icon
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: `absolute left-1/2 transform -translate-x-1/2 ${showTooltip ? "top-[calc(100%+0.5rem)] opacity-100" : "top-[100%] opacity-0"} px-2 py-1 bg-gray-200 text-gray-900 text-[0.625rem] rounded whitespace-nowrap shadow-md ease-250`,
        children: tooltip
      }
    )
  ] });
};
var Separator = () => /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-px h-6 bg-gray-300 mx-[1rem] " });
var Select = ({ options, value, onChange, placeholder = "Select an option" }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef(null);
  const [dropdownPosition, setDropdownPosition] = React.useState("bottom");
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
  React.useEffect(() => {
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
  React.useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
    }
  }, [isOpen]);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { ref: selectRef, className: "relative", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500",
        onClick: handleToggle,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "block truncate", children: selectedOption ? selectedOption.label : placeholder }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "pointer-events-none", children: /* @__PURE__ */ jsxRuntime.jsx("svg", { className: "w-5 h-5 text-gray-400", viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M7 7l3-3 3 3m0 6l-3 3-3-3", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: `absolute z-10 w-full mt-1 bg-white border-solid border border-gray-300 shadow-lg rounded-[8px] overflow-hidden ${dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"} ${isOpen ? "opacity-100 user-select-auto visible" : "select-none user-select-none invisible opacity-0"} ease-250`, children: /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "overflow-auto text-base max-h-60 focus:outline-none sm:text-sm", children: options.map((option) => /* @__PURE__ */ jsxRuntime.jsxs(
      "li",
      {
        className: `cursor-pointer select-none relative py-2 pl-3 pr-9 ${value === option.value ? "bg-gray-100 text-gray-600" : "text-gray-900 hover:bg-gray-50"}`,
        onClick: () => handleOptionClick(option.value),
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "block truncate", children: option.label }),
          value === option.value && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600", children: /* @__PURE__ */ jsxRuntime.jsx("svg", { className: "w-5 h-5", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsxRuntime.jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }) })
        ]
      },
      option.value
    )) }) })
  ] });
};
var select_default = Select;
var useObjectProperties = (canvas, selectedObject) => {
  const [properties, setProperties] = React.useState({
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
  React.useEffect(() => {
    if (!selectedObject) return;
    setProperties({
      angle: selectedObject.angle || 0,
      radius: selectedObject.radius * selectedObject.scaleX || 10,
      width: selectedObject.width || 100,
      height: selectedObject.height || 100,
      // ::::::::::: fill
      fill: selectedObject.fill ? String(selectedObject.fill).toUpperCase() === "BLACK" ? "#000000" : String(selectedObject.fill) : "transparent",
      // ::::::::::: stroke
      stroke: selectedObject.stroke ? Number(selectedObject.stroke) === 1 ? "#000000" : String(selectedObject.stroke) : "#000000",
      text: selectedObject.text || "",
      fontSize: selectedObject.fontSize || 20,
      fontWeight: selectedObject.fontWeight || "normal",
      fontFamily: selectedObject.fontFamily || "sans-serif",
      left: selectedObject.left || 0,
      top: selectedObject.top || 0
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
      const updatedProperties = {};
      for (const [key, value] of Object.entries(updates)) {
        if (selectedObject[key] !== value) {
          updatedProperties[key] = value;
        }
      }
      if ("stroke" in updatedProperties && updatedProperties.stroke !== void 0) {
        updatedProperties.stroke = String(updatedProperties.stroke);
      }
      selectedObject.set(updatedProperties);
      if (selectedObject.type === "i-text") {
        selectedObject.set({
          scaleX: 1,
          scaleY: 1
        });
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
var CommonProperties = ({ properties, updateObject }) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
  /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Angle (\xB0)" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center mt-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-2 py-1 bg-gray-200 rounded-l-md", onClick: () => updateObject({ angle: toFloat(properties.angle) - 1 }), children: "-" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "number",
          value: toFloat(properties.angle),
          onChange: (e) => updateObject({ angle: Number(e.target.value) }),
          className: "w-full px-2 py-1 text-center border-t border-b shadow-sm"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-2 py-1 bg-gray-200 rounded-r-md", onClick: () => updateObject({ angle: toFloat(properties.angle) + 1 }), children: "+" })
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Position X" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center mt-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-2 py-1 bg-gray-200 rounded-l-md", onClick: () => updateObject({ left: toFloat(properties.left) - 1 }), children: "-" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "number",
          value: toFloat(properties.left),
          onChange: (e) => updateObject({ left: Number(e.target.value) }),
          className: "w-full px-2 py-1 text-center border-t border-b shadow-sm"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-2 py-1 bg-gray-200 rounded-r-md", onClick: () => updateObject({ left: toFloat(properties.left) + 1 }), children: "+" })
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Position Y" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center mt-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-2 py-1 bg-gray-200 rounded-l-md", onClick: () => updateObject({ top: toFloat(properties.top) - 1 }), children: "-" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "number",
          value: toFloat(properties.top),
          onChange: (e) => updateObject({ top: Number(e.target.value) }),
          className: "w-full px-2 py-1 text-center border-t border-b shadow-sm"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-2 py-1 bg-gray-200 rounded-r-md", onClick: () => updateObject({ top: toFloat(properties.top) + 1 }), children: "+" })
    ] })
  ] })
] });
var commonProperties_default = CommonProperties;
var CircleProperties = ({ properties, updateObject }) => /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Radius" }),
  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center mt-1", children: [
    /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-2 py-1 bg-gray-200 rounded-l-md", onClick: () => updateObject({ radius: toFloat(properties.radius) - 1 }), children: "-" }),
    /* @__PURE__ */ jsxRuntime.jsx(
      "input",
      {
        type: "number",
        value: toFloat(properties.radius),
        onChange: (e) => updateObject({ radius: Number(e.target.value) }),
        className: "w-full px-2 py-1 text-center border-t border-b shadow-sm"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-2 py-1 bg-gray-200 rounded-r-md", onClick: () => updateObject({ radius: toFloat(properties.radius) + 1 }), children: "+" })
  ] })
] });
var circleProperties_default = CircleProperties;
var RectangleProperties = ({
  properties,
  updateObject
}) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
  /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Width" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center mt-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-2 py-1 bg-gray-200 rounded-l-md", onClick: () => updateObject({ width: toFloat(properties.width) - 1 }), children: "-" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "number",
          value: toFloat(properties.width),
          onChange: (e) => updateObject({ width: Number(e.target.value) }),
          className: "w-full px-2 py-1 text-center border-t border-b shadow-sm"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-2 py-1 bg-gray-200 rounded-r-md", onClick: () => updateObject({ width: toFloat(properties.width) + 1 }), children: "+" })
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Height" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center  mt-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-2 py-1 bg-gray-200 rounded-l-md", onClick: () => updateObject({ height: toFloat(properties.height) - 1 }), children: "-" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "number",
          value: toFloat(properties.height),
          onChange: (e) => updateObject({ height: Number(e.target.value) }),
          className: "w-full px-2 py-1 text-center border-t border-b shadow-sm"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-2 py-1 bg-gray-200 rounded-r-md", onClick: () => updateObject({ height: toFloat(properties.height) + 1 }), children: "+" })
    ] })
  ] })
] });
var rectangleProperties_default = RectangleProperties;
var fontWeightOptions = [
  { value: "normal", label: "Normal" },
  { value: "bold", label: "Bold" }
];
var fontFamilyOptions = [
  { value: "sans-serif", label: "Sans-serif" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
  { value: "poppins", label: "Poppins" }
];
var TextProperties = ({ properties, updateObject, Select: Select2 }) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
  /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Text" }),
    /* @__PURE__ */ jsxRuntime.jsx(
      "input",
      {
        type: "text",
        value: properties.text,
        onChange: (e) => updateObject({ text: e.target.value }),
        className: "mt-1 px-2 py-1 w-full border rounded-md"
      }
    )
  ] }),
  /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Font Size" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center mt-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-2 py-1 bg-gray-200 rounded-l-md", onClick: () => updateObject({ fontSize: toFloat(properties.fontSize) - 1 }), children: "-" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "number",
          value: toFloat(properties.fontSize),
          onChange: (e) => updateObject({ fontSize: Number(e.target.value) }),
          className: "w-full px-2 py-1 text-center border-t border-b shadow-sm"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-2 py-1 bg-gray-200 rounded-r-md", onClick: () => updateObject({ fontSize: toFloat(properties.fontSize) + 1 }), children: "+" })
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Font Weight" }),
    /* @__PURE__ */ jsxRuntime.jsx(
      Select2,
      {
        options: fontWeightOptions,
        value: properties.fontWeight,
        onChange: (value) => updateObject({ fontWeight: value })
      }
    )
  ] }),
  /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Font Family" }),
    /* @__PURE__ */ jsxRuntime.jsx(
      Select2,
      {
        options: fontFamilyOptions,
        value: properties.fontFamily,
        onChange: (value) => updateObject({ fontFamily: value })
      }
    )
  ] })
] });
var textProperties_default = TextProperties;
var ColorProperties = ({ properties, updateObject, objectType }) => {
  var _a, _b, _c, _d;
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Fill Color" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center mt-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "color",
            value: (properties == null ? void 0 : properties.fill) === "transparent" ? "#ffffff" : ((_a = properties.fill) == null ? void 0 : _a.toString()) || "#ffffff",
            onChange: (e) => {
              updateObject({ fill: e.target.value });
              updateObject({ stroke: properties.stroke });
            },
            className: "w-8 h-8 rounded-md border shadow-sm"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "text",
            value: properties.fill === "transparent" ? "transparent" : (((_b = properties.fill) == null ? void 0 : _b.toString()) || "").toUpperCase(),
            onChange: (e) => updateObject({ fill: e.target.value }),
            className: "ml-2 px-2 py-1 w-full border rounded-md shadow-sm"
          }
        )
      ] })
    ] }),
    objectType !== "i-text" && /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Border Color" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center mt-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "color",
            value: (properties == null ? void 0 : properties.stroke) === "transparent" ? "#ffffff" : ((_c = properties.stroke) == null ? void 0 : _c.toString()) || "#000000",
            onChange: (e) => updateObject({ stroke: e.target.value }),
            className: "w-8 h-8 rounded-md border shadow-sm"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "text",
            value: properties.stroke === "transparent" ? "transparent" : (((_d = properties.stroke) == null ? void 0 : _d.toString()) || "").toUpperCase(),
            onChange: (e) => updateObject({ stroke: e.target.value }),
            className: "ml-2 px-2 py-1 w-full border rounded-md shadow-sm"
          }
        )
      ] })
    ] })
  ] });
};
var colorProperties_default = ColorProperties;
var Sidebar = () => {
  const { canvas } = useEventGuiStore();
  const [selectedObject, setSelectedObject] = React.useState(null);
  const [objectType, setObjectType] = React.useState(null);
  const { properties, setProperties } = useObjectProperties(
    canvas,
    selectedObject
  );
  const { updateObject } = useObjectUpdater(canvas, setProperties);
  React.useEffect(() => {
    if (!canvas) return;
    const updateSelectedObject = () => {
      const activeObject = canvas.getActiveObject();
      setSelectedObject(activeObject || null);
      setObjectType(activeObject == null ? void 0 : activeObject.type);
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "w-[20rem] min-h-screen bg-gray-50 p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white rounded-md shadow", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-200 rounded-t-md", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold", children: "Zones" }),
        /* @__PURE__ */ jsxRuntime.jsx("button", { className: "text-gray-600 hover:text-gray-800", children: /* @__PURE__ */ jsxRuntime.jsx(lu.LuPlus, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-2 flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "checkbox",
            id: "ground-floor",
            className: "rounded text-blue-600"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("label", { htmlFor: "ground-floor", children: "Ground floor" })
      ] })
    ] }),
    selectedObject && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white rounded-md shadow p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "font-semibold", children: "Properties" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        commonProperties_default,
        {
          properties,
          updateObject
        }
      ),
      objectType === "circle" && /* @__PURE__ */ jsxRuntime.jsx(
        circleProperties_default,
        {
          properties,
          updateObject
        }
      ),
      objectType === "rect" && /* @__PURE__ */ jsxRuntime.jsx(
        rectangleProperties_default,
        {
          properties,
          updateObject
        }
      ),
      objectType === "i-text" && /* @__PURE__ */ jsxRuntime.jsx(
        textProperties_default,
        {
          properties,
          updateObject,
          Select: select_default
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        colorProperties_default,
        {
          properties,
          updateObject,
          objectType
        }
      )
    ] })
  ] });
};
var sidebar_default = Sidebar;
var CustomRect = class extends fabric.fabric.Rect {
  constructor(options) {
    super(options);
    this.id = options.id || uuid.v4();
  }
  toObject(propertiesToInclude = []) {
    return fabric.fabric.util.object.extend(super.toObject(propertiesToInclude), {
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
var CustomCircle = class extends fabric.fabric.Circle {
  constructor(options) {
    super(options);
    this.id = options.id || uuid.v4();
  }
  toObject(propertiesToInclude = []) {
    return fabric.fabric.util.object.extend(super.toObject(propertiesToInclude), {
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
var CustomText = class extends fabric.fabric.IText {
  constructor(options) {
    super(options.text, options);
    this.id = options.id || uuid.v4();
  }
  toObject(propertiesToInclude = []) {
    return fabric.fabric.util.object.extend(super.toObject(propertiesToInclude), {
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
    fill: "transparent",
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
    id: uuid.v4()
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
    id: uuid.v4()
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
    id: uuid.v4()
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
  React.useEffect(() => {
    if (!canvasRef.current || !canvasParent.current) return;
    const newCanvas = new fabric.fabric.Canvas(canvasRef.current);
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
      var _a, _b, _c, _d, _e, _f;
      const obj = event.target;
      const { width: canvasWidth, height: canvasHeight } = newCanvas;
      if (obj) {
        const objWidth = ((_a = obj.width) != null ? _a : 0) * ((_b = obj.scaleX) != null ? _b : 1);
        const objHeight = ((_c = obj.height) != null ? _c : 0) * ((_d = obj.scaleY) != null ? _d : 1);
        obj.left = Math.max(0, Math.min((_e = obj.left) != null ? _e : 0, (canvasWidth != null ? canvasWidth : 0) - objWidth));
        obj.top = Math.max(0, Math.min((_f = obj.top) != null ? _f : 0, (canvasHeight != null ? canvasHeight : 0) - objHeight));
      }
    });
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      newCanvas.dispose();
    };
  }, [canvasRef, canvasParent, setCanvas]);
};
var useCanvasSetup_default = useCanvasSetup;
var useSelectionHandler = (canvas) => {
  React.useEffect(() => {
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
  const startPointRef = React.useRef(null);
  React.useEffect(() => {
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
  React.useEffect(() => {
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
  const startPointRef = React.useRef(null);
  React.useEffect(() => {
    if (!canvas) return;
    const handleMouseDown = (event) => {
      const pointer = canvas.getPointer(event.e);
      if (toolMode === "one-seat") {
        const seat = createSeat(pointer.x, pointer.y);
        canvas.add(seat);
        canvas.renderAll();
      } else if (toolMode === "shape-square") {
        const rect = createRect(pointer.x, pointer.y);
        rect.set({ width: 0, height: 0 });
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
      if (toolMode === "shape-square" && startPointRef.current) {
        const pointer = canvas.getPointer(event.e);
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === "rect") {
          const width = Math.abs(pointer.x - startPointRef.current.x);
          const height = Math.abs(pointer.y - startPointRef.current.y);
          activeObject.set({
            width,
            height
          });
          canvas.renderAll();
        }
      }
    };
    const handleMouseUp = () => {
      if (toolMode === "shape-square") {
        startPointRef.current = null;
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
  React.useEffect(() => {
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
  const canvasRef = React.useRef(null);
  const canvasParent = React.useRef(null);
  const { canvas, setCanvas, toolMode, setToolMode, toolAction } = useEventGuiStore();
  useCanvasSetup_default(canvasRef, canvasParent, setCanvas);
  useSelectionHandler_default(canvas);
  useMultipleSeatCreator_default(canvas, toolMode, setToolMode);
  useObjectDeletion_default(canvas, toolAction);
  useObjectCreator_default(canvas, toolMode, setToolMode);
  useUndoRedo_default();
  useKeyboardShortcuts_default();
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `relative size-full bg-gray-200 ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsx(toolbar_default, {}),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between w-full", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          className: "w-full max-w-[45rem] mx-auto bg-gray-100",
          ref: canvasParent,
          children: /* @__PURE__ */ jsxRuntime.jsx("canvas", { ref: canvasRef })
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(sidebar_default, {})
    ] })
  ] });
};
var components_default = SeatCanvas;

exports.SeatPicker = components_default;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map