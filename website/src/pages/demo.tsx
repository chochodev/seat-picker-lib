import React from 'react';
import Layout from '@theme/Layout';
import { SeatPicker } from '../../../src/components';

export default function Demo(): JSX.Element {
  return (
    <Layout title="Demo" description="Try out the SeatPicker component">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold">SeatPicker Demo</h1>

        <div className="rounded-lg border bg-white p-4 shadow">
          <SeatPicker
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
            onChange={(layout) => console.log('Layout updated:', layout)}
            onSave={(layout) => console.log('Saving layout:', layout)}
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Features Demonstrated</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Interactive seat arrangement</li>
            <li>Add, move, and delete seats</li>
            <li>Customize seat properties</li>
            <li>Grid arrangement</li>
            <li>Undo/Redo functionality</li>
            <li>Save and load layouts</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
