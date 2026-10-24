import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ReportPage from './pages/ReportPage.jsx'
import MapPage from './pages/MapPage.jsx'
import SightingDetailPage from './pages/SightingDetailPage.jsx'

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/report" element={<ReportPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/sightings/:id" element={<SightingDetailPage />} />
                <Route path="*" element={<Navigate to="/report" replace />} />
            </Route>
        </Routes>
    )
}

