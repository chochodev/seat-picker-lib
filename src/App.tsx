import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import SeatPicker from '@/components';
import CustomerSeatCanvas from './pages/CustomerSeatCanvas';
import { CanvasObject } from './types/data.types';
import DemoPage from './pages/demo';
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
        <Route path="/" element={<Navigate to="/dev" replace />} />
        <Route
          path="/dev"
          element={
            <main className="h-screen w-full ">
              <SeatPicker
                onChange={handleChange}
                onSave={handleSave}
                className="w-full"
              />
            </main>
          }
        />
        <Route path="/seats" element={<CustomerSeatCanvas />} />
        <Route path="/demo" element={<DemoPage />} />
      </Routes>
    </Router>
  );
}
