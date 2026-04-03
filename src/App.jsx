import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './store/useStore';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Orders from './pages/Orders';
import Purchases from './pages/Purchases';
import Repairs from './pages/Repairs';
import Accounting from './pages/Accounting';
import Settings from './pages/Settings';
import About from './pages/About';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="pos" element={<POS />} />
            <Route path="customers" element={<Customers />} />
            <Route path="reports" element={<Reports />} />
            <Route path="orders" element={<Orders />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="repairs" element={<Repairs />} />
            <Route path="accounting" element={<Accounting />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
