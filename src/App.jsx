import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './components/Auth/Login'
import Dashboard from './components/Dashboard/Dashboard'
import TenderList from './components/Tenders/TenderList'
import TenderDetail from './components/Tenders/TenderDetail'
import Analytics from './components/Analytics/Analytics'
import Profile from './components/Profile/Profile'
import Layout from './components/Layout/Layout'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tenders" element={<TenderList />} />
        <Route path="/tenders/:id" element={<TenderDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App