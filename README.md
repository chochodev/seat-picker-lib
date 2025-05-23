# Seat Picker

A flexible and customizable seating arrangement GUI component for React applications. This library provides an interactive canvas for creating and managing seat layouts, perfect for event venues, theaters, restaurants, and more.

## Features

- Interactive canvas for seat placement and management
- Support for different seat types and layouts
- Customizable seat appearance and properties
- Zone management for grouping seats
- Copy, paste, and delete functionality
- Zoom and pan controls
- TypeScript support
- Fully customizable styling
- **Customer-facing seat viewer with drag & drop upload and purchase modal**

## Installation

```bash
npm install seat-picker
# or
yarn add seat-picker
```

## Usage (Admin/Editor)

```tsx
import { SeatPicker } from 'seat-picker';

function App() {
  const handleChange = (seats) => {
    console.log('Seats updated:', seats);
  };

  return (
    <SeatPicker
      width={800}
      height={600}
      onChange={handleChange}
      initialSeats={[]}
    />
  );
}
```

## Exporting and Importing Seat Layouts

- Use the toolbar in the editor to **export** your seat layout as a JSON file.
- You can later **import** this file to restore or edit the layout.

## Customer-Facing Seat Viewer

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

### Features

- **Drag & Drop Upload:** Easily upload seat layouts by dragging your JSON file onto the upload area.
- **Modal Details:** Clicking a seat opens a modal with seat number, category, price, status, and purchase options.
- **Read-Only:** Customers cannot move, edit, or select seats—only view and purchase.

## Rendering a Saved Layout (Read-Only)

You can render a saved seat layout in read-only mode using the provided `CustomerSeatCanvas` component. This is ideal for customer-facing pages where you want to display a seat map and allow seat selection/purchase, but prevent editing.

### Example

```tsx
import CustomerSeatCanvas from './pages/CustomerSeatCanvas';

// Optionally, you can pass a JSON layout directly (see below)
function CustomerView() {
  return <CustomerSeatCanvas />;
}
```

- By default, the component allows users to upload a seat layout JSON file via drag & drop or file picker.
- If you want to render a layout programmatically (without upload), you can extend the component to accept a `layout` prop and load it automatically.

### Features

- **Read-only:** Seats and objects are not editable or selectable.
- **Seat details modal:** Clicking a seat opens a modal with details and purchase options.
- **Drag & drop or file picker:** Users can upload a layout file exported from the admin/editor.

## Props

| Prop         | Type                    | Default   | Description                      |
| ------------ | ----------------------- | --------- | -------------------------------- |
| width        | number                  | 800       | Canvas width in pixels           |
| height       | number                  | 600       | Canvas height in pixels          |
| initialSeats | Seat[]                  | []        | Initial seats to render          |
| initialZones | Zone[]                  | []        | Initial zones for grouping seats |
| onChange     | (seats: Seat[]) => void | undefined | Callback when seats change       |
| onZoneChange | (zones: Zone[]) => void | undefined | Callback when zones change       |
| className    | string                  | undefined | Additional CSS class name        |
| style        | React.CSSProperties     | undefined | Additional inline styles         |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Emmanuel Michael
