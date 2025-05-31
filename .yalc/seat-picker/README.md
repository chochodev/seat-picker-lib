# [Seat Picker](https://seat-picker-docs.vercel.app/)

> 📚 [Full Documentation & Live Demo](https://seat-picker-docs.vercel.app/)

A flexible and customizable seating arrangement GUI component for React applications. This library provides an interactive canvas for creating and managing seat layouts, perfect for event venues, theaters, restaurants, and more.

---

## ✨ Features

### Canvas Editing & Layout

- **Interactive Canvas:** Drag, drop, and arrange seats, shapes, and text.
- **Multi-Select & Grouping:** Select multiple objects to move, align, or edit as a group.
- **Grid Arrangement:** Instantly arrange selected seats into a grid with adjustable rows, columns, and spacing.
- **Customizable Properties:** Edit seat number, color, size, shape, and more from the sidebar.
- **Shape & Text Tools:** Add rectangles, circles, and text labels to your layout.
- **Undo/Redo:** Easily revert or reapply changes with keyboard shortcuts or toolbar buttons.
- **Delete, Copy, Cut, Paste:** Full clipboard support for objects and groups.
- **Lock/Unlock Selection:** Prevent accidental changes by locking selected objects.
- **Zoom & Pan:** Zoom in/out (80%–120%) and pan to focus on any part of your layout.
- **Snap to Grid:** Enable smart snapping for precise alignment.
- **Background Image:** Upload a background image (e.g., venue map) and adjust its opacity.

### Seat & Zone Management

- **Seat Attributes:** Assign seat numbers, categories, prices, and status (available, sold, etc.).
- **Zone Management:** Group seats into zones for pricing or sectioning.
- **Bulk Editing:** Edit properties for multiple selected seats at once.

### Export, Import, and Sharing

- **Export Layout:** Save your seat map as a JSON file for backup or sharing.
- **Import Layout:** Load a previously saved layout to continue editing.
- **Download:** Download the current layout instantly from the toolbar.

### Customer-Facing Features

- **Read-Only Viewer:** Customers can view seat layouts without editing.
- **Drag & Drop Upload:** Customers can upload a seat layout JSON to view and interact.
- **Seat Details Modal:** Clicking a seat opens a modal with all details and purchase options.
- **Purchase Integration:** Hook into seat actions (buy, reserve, etc.) with your own logic.
- **No Edit Mode:** Customers cannot move, edit, or delete seats.

### Developer Experience

- **TypeScript Support:** Full typings for all components and props.
- **Customizable Styling:** Easily override styles with your own CSS or Tailwind classes.
- **Composable Components:** Use only what you need (e.g., just the renderer for read-only views).

---

## 🚀 Getting Started

### Installation

```bash
npm install seat-picker
# or
yarn add seat-picker
```

---

## 🛠️ Usage (Admin/Editor)

```tsx
import { SeatPicker } from 'seat-picker';

function App() {
  const handleChange = (layout) => {
    console.log('Layout updated:', layout);
  };

  const handleSave = (layout) => {
    console.log('Saving layout:', layout);
    // Save to your backend or file system
  };

  return (
    <SeatPicker
      onChange={handleChange}
      onSave={handleSave}
      style={{
        width: 800,
        height: 600,
        backgroundColor: '#f8fafc',
        showSeatNumbers: true,
        seatNumberStyle: {
          fontSize: 14,
          fill: '#222',
          fontWeight: 'bold',
        },
        seatStyle: {
          fill: 'transparent',
          stroke: 'black',
          strokeWidth: 1,
          radius: 10,
        },
      }}
      labels={{
        buyButton: 'Buy Seat',
        cancelButton: 'Cancel',
        seatNumber: 'Seat Number',
        category: 'Category',
        price: 'Price',
        status: 'Status',
      }}
    />
  );
}
```

### Toolbar Actions

- **Open/Save/Download:** Import/export layouts as JSON.
- **Select/Move:** Use the pointer tool to select and move objects.
- **Add Seat/Shape/Text:** Quickly add new elements to your layout.
- **Grid Tool:** Arrange selected seats in a grid.
- **Undo/Redo:** Step backward or forward through your changes.
- **Clipboard:** Cut, copy, paste, and delete selected objects.
- **Zoom:** Zoom in/out (80%–120%) and keep the layout centered.
- **Lock/Unlock:** Lock selection to prevent changes.

### Sidebar Actions

- **No Selection:** See helpful tips and keyboard shortcuts.
- **Single Selection:** Edit all properties of the selected object.
- **Multiple Selection:** Edit properties in bulk and use the grid arrangement tool.

### Keyboard Shortcuts

- **Ctrl+Z:** Undo
- **Ctrl+Y:** Redo
- **Del:** Delete selected
- **Shift+Click:** Multi-select
- **Ctrl+K:** Open command palette

---

## 👥 Customer-Facing Seat Viewer

A dedicated, safe page for customers to view and purchase seats. This page is read-only and does not allow editing.

### How to Use

1. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
2. **Visit the customer page:**
   - Go to [http://localhost:5173/seats](http://localhost:5173/seats)
3. **Upload a seat layout:**
   - Drag and drop your exported seat JSON file onto the upload area, or click to browse and select the file.
   - Only JSON files exported from the admin/editor are supported.
4. **View and purchase seats:**
   - The seat layout will be displayed on a canvas.
   - Click any seat to view its details in a modal.
   - Use the **Buy** or **Cancel** buttons in the modal (customize the buy logic as needed).
   - Seats and other objects are not editable or selectable by customers.

### Customer Features

- **Drag & Drop Upload:** Easily upload seat layouts by dragging your JSON file onto the upload area.
- **Modal Details:** Clicking a seat opens a modal with seat number, category, price, status, and purchase options.
- **Read-Only:** Customers cannot move, edit, or select seats—only view and purchase.

### 🖼️ Rendering a Saved Layout (Read-Only)

You can render a saved seat layout in read-only mode using the provided `SeatPicker` component with the `readOnly` prop set to `true`. This is ideal for customer-facing pages or embeddable widgets where you want to display a seat map and allow seat selection/purchase, but prevent editing or uploading.

### Example


```tsx
import { SeatPicker } from 'seat-picker';

function CustomerView() {
  const [layout, setLayout] = useState(null);

  const handleSeatAction = (action, seat) => {
    console.log('Action:', action, 'on seat:', seat);
    // Implement your buy functionality here
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-4 text-2xl font-bold">Customer Seat Viewer</h1>

      {/* Upload area for layout JSON */}
      <div className="mb-6">
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
          {/* Your file upload UI here */}
        </div>
      </div>

      {layout ? (
        <SeatPicker
          layout={layout}
          readOnly
          style={{
            width: 800,
            height: 600,
            backgroundColor: '#f8fafc',
            showSeatNumbers: true,
            seatNumberStyle: {
              fontSize: 14,
              fill: '#222',
              fontWeight: 'bold',
            },
            seatStyle: {
              fill: 'transparent',
              stroke: 'black',
              strokeWidth: 1,
              radius: 10,
            },
          }}
          labels={{
            buyButton: 'Buy Seat',
            cancelButton: 'Cancel',
            seatNumber: 'Seat Number',
            category: 'Category',
            price: 'Price',
            status: 'Status',
          }}
          onSeatAction={handleSeatAction}
        />
      ) : (
        <div className="rounded-lg border bg-white p-4 shadow">
          <div className="flex h-[600px] items-center justify-center text-gray-500">
            Please upload a seat layout file
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## ⚙️ Props Reference & Customization

### SeatPicker

| Prop                | Type                                         | Default | Description                                                      |
| ------------------- | -------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `width`             | `number`                                     | 800     | Canvas width in pixels                                           |
| `height`            | `number`                                     | 600     | Canvas height in pixels                                          |
| `layout`            | `object`                                     | —       | (Optional) Layout JSON to load (for editing an existing layout)  |
| `initialSeats`      | `Seat[]`                                     | `[]`    | (Deprecated, use `layout`) Initial seats to render               |
| `initialZones`      | `Zone[]`                                     | `[]`    | (Deprecated, use `layout`) Initial zones for grouping seats      |
| `onChange`          | `(layout: object) => void`                   | —       | Callback when the layout changes (add, move, edit, delete, etc.) |
| `onSave`            | `(layout: object) => void`                   | —       | Callback when the user clicks the Save button                    |
| `onZoneChange`      | `(zones: Zone[]) => void`                    | —       | Callback when zones change                                       |
| `className`         | `string`                                     | —       | Additional CSS class name for the root container                 |
| `style`             | `object`                                     | —       | Additional inline styles or style overrides (see below)          |
| `labels`            | `object`                                     | —       | Override default button/label text (see below)                   |
| `readOnly`          | `boolean`                                    | `false` | If true, disables all editing and only allows viewing            |
| `renderToolbar`     | `(props) => ReactNode`                       | —       | Custom render function for the toolbar                           |
| `renderSidebar`     | `() => ReactNode`                            | —       | Custom render function for the sidebar                           |
| `renderSeatDetails` | `({ seat, onClose, onAction }) => ReactNode` | —       | Custom render function for the seat details modal                |
| `onSeatClick`       | `(seat: SeatData) => void`                   | —       | Callback when a seat is clicked (read-only mode)                 |
| `onSeatAction`      | `(action: string, seat: SeatData) => void`   | —       | Callback for seat actions (e.g., buy, reserve)                   |

#### Example: Customizing Style and Labels

```tsx
<SeatPicker
  width={1000}
  height={700}
  style={{
    backgroundColor: '#fffbe6',
    seatNumberStyle: { fontSize: 16, fill: '#333' },
    seatStyle: { fill: '#e0e7ff', stroke: '#6366f1', radius: 12 },
  }}
  labels={{
    buyButton: 'Purchase',
    cancelButton: 'Back',
    seatNumber: 'No.',
    category: 'Section',
    price: 'Cost',
    status: 'Availability',
  }}
/>
```

#### Example: Custom Toolbar

```tsx
<SeatPicker
  renderToolbar={({ onSave, onBgLayout }) => (
    <div>
      <button onClick={onSave}>Custom Save</button>
      <button onClick={onBgLayout}>Background</button>
      {/* ...add more custom controls */}
    </div>
  )}
/>
```

#### Example: Custom Sidebar

```tsx
<SeatPicker
  renderSidebar={() => (
    <div>
      <h3>Custom Sidebar</h3>
      {/* Add your own controls or info */}
    </div>
  )}
/>
```

#### Example: Custom Seat Details Modal

```tsx
<SeatPicker
  renderSeatDetails={({ seat, onClose, onAction }) => (
    <div>
      <h2>Seat {seat.number}</h2>
      <p>Price: {seat.price}</p>
      <button onClick={() => onAction('buy', seat)}>Buy</button>
      <button onClick={onClose}>Close</button>
    </div>
  )}
/>
```

---

### SeatLayoutRenderer

| Prop                | Type                                         | Default | Description                                   |
| ------------------- | -------------------------------------------- | ------- | --------------------------------------------- |
| `layout`            | object                                       | —       | The seat layout JSON exported from the editor |
| `width`             | number                                       | 800     | Canvas width in pixels                        |
| `height`            | number                                       | 600     | Canvas height in pixels                       |
| `labels`            | object                                       | —       | Override default button/label text            |
| `onSeatClick`       | `(seat: SeatData) => void`                   | —       | Callback when a seat is clicked (read-only)   |
| `onSeatAction`      | `(action: string, seat: SeatData) => void`   | —       | Callback for seat actions (e.g., buy)         |
| `renderSeatDetails` | `({ seat, onClose, onAction }) => ReactNode` | —       | Custom seat modal                             |

#### Example: Read-Only Renderer with Custom Modal

```tsx
<SeatLayoutRenderer
  layout={seatLayoutJson}
  width={900}
  height={700}
  labels={{ buyButton: 'Book Now' }}
  renderSeatDetails={({ seat, onClose, onAction }) => (
    <div>
      <h2>VIP Seat {seat.number}</h2>
      <button onClick={() => onAction('buy', seat)}>Book</button>
      <button onClick={onClose}>Close</button>
    </div>
  )}
/>
```

---

### Customization Tips

- **Styling:**  
  Use the `style` prop to override canvas, seat, and label styles. You can use Tailwind, CSS-in-JS, or plain CSS.
- **Labels:**  
  Pass a `labels` object to override any button or field text for localization or branding.
- **Component Composition:**  
  Use the `renderToolbar`, `renderSidebar`, and `renderSeatDetails` props to inject your own React components for a fully custom UI.
- **Callbacks:**  
  Use `onChange`, `onSave`, `onSeatClick`, and `onSeatAction` to hook into all user actions and integrate with your backend or analytics.

---

## 🧑‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © Emmanuel Michael
