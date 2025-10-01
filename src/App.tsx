import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login, Dashboard, Sales, Inventory } from './pages';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente para proteger rutas privadas
interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Componente para redirigir si ya está autenticado
function PublicRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
        {/* Ruta pública - Login */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Rutas privadas */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/sales" 
          element={
            <PrivateRoute>
              <Sales />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/inventory" 
          element={
            <PrivateRoute>
              <Inventory />
            </PrivateRoute>
          } 
        />
        
        {/* Ruta raíz */}
        <Route 
          path="/" 
          element={
            isAuthenticated 
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          } 
        />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App
