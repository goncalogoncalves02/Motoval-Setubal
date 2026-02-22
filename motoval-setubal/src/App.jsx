import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import SchedulePage from './pages/SchedulePage';
import OfertasPage from './pages/OfertasPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <HelmetProvider>
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="contacto" element={<ContactPage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="horario" element={<SchedulePage />} />
            <Route path="ofertas" element={<OfertasPage />} />
          </Route>
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
