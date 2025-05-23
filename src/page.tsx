import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SeatPicker from '@/components';
import CustomerSeatCanvas from './pages/CustomerSeatCanvas';

export default function Home() {
  return (
    <Router>
      <Routes>
        {/* ...other routes */}
        <Route
          index
          element={
            <main className="min-h-screen w-full flex-col items-center ">
              <SeatPicker className="w-full" />
            </main>
          }
        />
        <Route path="/seats" element={<CustomerSeatCanvas />} />
      </Routes>
    </Router>
  );
}
