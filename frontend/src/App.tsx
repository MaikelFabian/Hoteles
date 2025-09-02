import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { ErrorBoundary } from './components/common';

// Páginas
import Dashboard from './pages/Dashboard';
import HotelesPage from './pages/hoteles/HotelesPage';
import HabitacionesPage from './pages/habitaciones/HabitacionesPage';
import HuespedesPage from './pages/huespedes/HuespedesPage';
import ReservasPage from './pages/reservas/ReservasPage';
import ConfiguracionPage from './pages/ConfiguracionPage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hoteles" element={<HotelesPage />} />
            <Route path="/habitaciones" element={<HabitacionesPage />} />
            <Route path="/huespedes" element={<HuespedesPage />} />
            <Route path="/reservas" element={<ReservasPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
