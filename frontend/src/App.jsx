// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Page (Jisme ab login popup in-built hai)
import FrontPage from './pages/public/FrontPage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import DailySalesEntry from './pages/staff/DailySalesEntry';
import FinancialEntry from './pages/staff/FinancialEntry';
import InvertoryLog from './pages/staff/InventoryLog';
import ComplimentaryEntry from './pages/staff/ComplimentaryEntry';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'; 
import AiAssistant from './pages/admin/AiAssistant';
import StockTracker from './pages/admin/StockTracker';
import CreateUser from './pages/admin/CreateUser';

// Guard: Agar token nahi hai toh Front Page (/) pe bhej do
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // Ab agar koi bina login ke andar jana chahega, toh wapas main website (/) par bhejenge
  if (!token) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 💡 DEFAULT ROUTE: Ab seedha Front Page Khulega */}
        <Route path="/" element={<FrontPage />} />
        
        {/* Staff Routes (Protected) */}
        <Route path="/staff/dashboard" element={
          <ProtectedRoute><StaffDashboard /></ProtectedRoute>
        } />
        <Route path="/staff/daily-sales" element={
          <ProtectedRoute><DailySalesEntry /></ProtectedRoute>
        } />
        <Route path="/staff/financial-entry" element={
          <ProtectedRoute><FinancialEntry /></ProtectedRoute>
        } />
        <Route path="/staff/inventory-log" element={
          <ProtectedRoute><InvertoryLog /></ProtectedRoute>
        } />
        <Route path="/staff/complimentary-entry" element={
          <ProtectedRoute><ComplimentaryEntry /></ProtectedRoute>
        } />

        {/* Admin Routes (Protected) */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/ai-assistant" element={
          <ProtectedRoute><AiAssistant /></ProtectedRoute>
        } />
        <Route path="/admin/stock-tracking" element={
          <ProtectedRoute><StockTracker /></ProtectedRoute>
        } />
        <Route path="/admin/create-user" element={
          <ProtectedRoute><CreateUser /></ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;