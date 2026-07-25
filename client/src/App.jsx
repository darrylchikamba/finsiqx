import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Transactions from './pages/Transactions';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import Subscriptions from './pages/Subscriptions';
import Simulator from './pages/Simulator';
import AICoach from './pages/AICoach';
import SAOverview from './pages/SAOverview';
import TaxSnapshot from './pages/TaxSnapshot';
import Profile from './pages/Profile';

const Layout = ({ children }) => (
  <div style={{ display: 'flex' }}>
    <Navbar />
    <div style={{ marginLeft: '240px', flex: 1, minHeight: '100vh', padding: '2rem' }}>
      {children}
    </div>
  </div>
);

const App = () => {
  const location = useLocation();
  
  return (
    <div key={location.pathname} style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
        <Route path="/budget" element={<ProtectedRoute><Layout><Budget /></Layout></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><Layout><Goals /></Layout></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute><Layout><Subscriptions /></Layout></ProtectedRoute>} />
        <Route path="/simulator" element={<ProtectedRoute><Layout><Simulator /></Layout></ProtectedRoute>} />
        <Route path="/mali" element={<ProtectedRoute><Layout><AICoach /></Layout></ProtectedRoute>} />
        <Route path="/sa-overview" element={<ProtectedRoute><Layout><SAOverview /></Layout></ProtectedRoute>} />
        <Route path="/tax-snapshot" element={<ProtectedRoute><Layout><TaxSnapshot /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default App;
