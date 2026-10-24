import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ReportPage from './pages/ReportPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/report" element={<ReportPage />} />
        <Route path="*" element={<Navigate to="/report" replace />} />
      </Route>
    </Routes>
  )
}
