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
- **Reusable SeatLayoutRenderer component for programmatic read-only rendering**

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

## Customer-Facing Seat Viewer (with Upload)

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

You can render a saved seat layout in read-only mode using the provided `SeatLayoutRenderer` component. This is ideal for customer-facing pages or embeddable widgets where you want to display a seat map and allow seat selection/purchase, but prevent editing or uploading.

### Example

```tsx
import { SeatLayoutRenderer } from 'seat-picker';

// seatLayoutJson is the JSON object exported from the editor
function CustomerView({ seatLayoutJson }) {
  return (
    <SeatLayoutRenderer layout={seatLayoutJson} width={800} height={600} />
  );
}
```

- The `layout` prop is required and should be the JSON object exported from the admin/editor.
- The `width` and `height` props are optional (default: 800x600).
- The component is fully read-only: seats and objects are not editable or selectable, but clicking a seat opens a modal with details and purchase options.

### Features

- **Read-only:** Seats and objects are not editable or selectable.
- **Seat details modal:** Clicking a seat opens a modal with details and purchase options.
- **No upload UI:** Use this component when you want to render a layout programmatically.

## Props (SeatPicker)

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

## Props (SeatLayoutRenderer)

| Prop   | Type   | Default | Description                                   |
| ------ | ------ | ------- | --------------------------------------------- |
| layout | object | —       | The seat layout JSON exported from the editor |
| width  | number | 800     | Canvas width in pixels                        |
| height | number | 600     | Canvas height in pixels                       |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Emmanuel Michael
