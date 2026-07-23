import { BrowserRouter, Navigate, Routes, Route, useLocation, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import SchedulePage from './pages/SchedulePage';
import OfertasPage from './pages/OfertasPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './contexts/AuthContext';

function LegacyPneusRedirect() {
  const { slug } = useParams();
  const { search } = useLocation();
  const destination = slug ? `/pneus/${slug}` : '/pneus';

  return <Navigate to={`${destination}${search}`} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="contacto" element={<ContactPage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="horario" element={<SchedulePage />} />
            <Route path="pneus" element={<OfertasPage />} />
            <Route path="pneus/:slug" element={<ProductDetailPage />} />
            <Route path="ofertas" element={<LegacyPneusRedirect />} />
            <Route path="ofertas/:slug" element={<LegacyPneusRedirect />} />
          </Route>
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
