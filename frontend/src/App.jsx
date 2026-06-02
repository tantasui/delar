import { Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import DiscoverPage from './pages/DiscoverPage'
import ProductDetailPage from './pages/ProductDetailPage'
import DashboardPage from './pages/DashboardPage'
import LibraryPage from './pages/LibraryPage'
import CreatorProfilePage from './pages/CreatorProfilePage'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/discover" replace />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/creator/:address" element={<CreatorProfilePage />} />
      </Routes>
    </>
  )
}
