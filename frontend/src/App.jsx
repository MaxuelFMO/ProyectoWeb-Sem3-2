import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Administrador from './page/administrador';
import Personas from './page/personas';
import Bienes from './page/bienes';
import Historial from './page/historial';

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Administrador />} />
            <Route path="personas" element={<Personas />} />
            <Route path="bienes" element={<Bienes />} />
            <Route path="historial" element={<Historial />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
