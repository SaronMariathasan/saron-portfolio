import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import AdminSignIn from '../pages/AdminSignIn'
import AdminSignUp from '../pages/AdminSignUp'
import AdminDashboard from '../pages/AdminDashboard'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken')
  return token ? children : <Navigate to="/admin/signin" replace />
}

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="signin" element={<AdminSignIn />} />
      <Route path="signup" element={<AdminSignUp />} />
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
