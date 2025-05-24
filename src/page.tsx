import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SeatPicker from '@/components';
import CustomerSeatCanvas from './pages/CustomerSeatCanvas';
import { CanvasObject } from './types/data.types';

export default function Home() {
  const handleChange = (json: CanvasObject) => {
    // console.log('onChange', json);
  };

  const handleSave = (json: CanvasObject) => {
    // console.log('onSave', json);
  };

  return (
    <Router>
      <Routes>
        <Route
          index
          element={
            <main className="min-h-screen w-full flex-col items-center ">
              <SeatPicker
                onChange={handleChange}
                onSave={handleSave}
                className="w-full"
              />
            </main>
          }
        />
        <Route path="/seats" element={<CustomerSeatCanvas />} />
      </Routes>
    </Router>
  );
}
