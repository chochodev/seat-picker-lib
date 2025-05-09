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

## Installation

```bash
npm install @your-npm-username/seat-picker
# or
yarn add @your-npm-username/seat-picker
```

## Usage

```tsx
import { SeatPicker } from '@your-npm-username/seat-picker';

function App() {
  const handleChange = (seats) => {
    console.log('Seats updated:', seats);
  };

  return (
    <SeatPicker
      width={800}
      height={600}
      onChange={handleChange}
      initialSeats={[
        {
          id: '1',
          left: 100,
          top: 100,
          radius: 20,
          fill: '#ffffff',
          stroke: '#000000',
          text: 'A1',
          textSize: 14,
          textColor: '#000000',
        },
      ]}
    />
  );
}
```

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

MIT © [Your Name]
