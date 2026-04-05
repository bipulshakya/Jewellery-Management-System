import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, ToastProvider, useAuth } from './store/useStore';
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
import Login from './pages/Login';

function RequireAuth() {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-bg-primary">
        <p className="text-sm text-text-tertiary">Checking session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function RequireRole({ roles, children }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<RequireAuth />}>
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
                <Route
                  path="settings"
                  element={(
                    <RequireRole roles={['admin']}>
                      <Settings />
                    </RequireRole>
                  )}
                />
                <Route path="about" element={<About />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
