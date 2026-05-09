import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerApplications from './pages/customer/CustomerApplications';
import ApplyService from './pages/customer/ApplyService';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';

// Dummy components for missing routes to prevent errors
const DummyPage = ({ title }: { title: string }) => <div className="p-8"><h1>{title}</h1><p>Under construction based on real-time data.</p></div>;

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'customer' ? '/customer/dashboard' : '/admin/dashboard'} replace />;
  }
  return <>{children}</>;
};

const AuthRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user) {
    return <Navigate to={user.role === 'customer' ? '/customer/dashboard' : '/admin/dashboard'} replace />;
  }
  return <Login />;
};

const MainRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthRedirect />} />
        
        <Route path="/customer/*" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MainLayout>
              <Routes>
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="applications" element={<CustomerApplications />} />
                <Route path="apply/:id" element={<ApplyService />} />
                <Route path="*" element={<Navigate to="/customer/dashboard" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <MainLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="applications" element={<AdminApplications />} />
                <Route path="services" element={<DummyPage title="Manage Services" />} />
                <Route path="staff" element={<DummyPage title="Staff Management" />} />
                <Route path="settings" element={<DummyPage title="Settings" />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
