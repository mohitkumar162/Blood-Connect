import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DonorMap from './pages/DonorMap'
import Donors from './pages/Donors'
import NewRequest from './pages/NewRequest'
import RequestDetail from './pages/RequestDetail'
import Requests from './pages/Requests'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'

function PrivateRoute({ children, roles }) {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="map" element={<DonorMap />} />
          <Route path="donors" element={<Donors />} />
          <Route path="requests" element={<Requests />} />
          <Route path="requests/new" element={<PrivateRoute><NewRequest /></PrivateRoute>} />
          <Route path="requests/:id" element={<RequestDetail />} />
          <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="admin" element={<PrivateRoute roles={['ADMIN']}><AdminPanel /></PrivateRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
