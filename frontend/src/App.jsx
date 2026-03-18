import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AuditPage from './pages/AuditPage';
import RoadmapPage from './pages/RoadmapPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import EnterprisePage from './pages/EnterprisePage';
import Layout from './components/Layout';
import './index.css';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="enterprise" element={<EnterprisePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
