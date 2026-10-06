import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Pages imported from previous phases
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { SitterDetails } from './pages/SitterDetails';
import { MyPets } from './pages/MyPets';
import { PetDossier } from './pages/PetDossier';
import { BookingCheckout } from './pages/BookingCheckout';
import { ActiveCareHub } from './pages/ActiveCareHub';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Navbar } from './components/Navbar';
import { SitterDashboard } from './pages/sitter/SitterDashboard';
import { SitterAvailability } from './pages/sitter/SitterAvailability';
import { SitterCredentials } from './pages/sitter/SitterCredentials';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-20 text-center">Loading PawsOut...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/explore" replace />;

  return children;
};

export const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar />

      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/sitters/:id" element={<SitterDetails />} />

          {/* Protected Owner Routes */}
          <Route 
            path="/my-pets" 
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <MyPets />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-pets/:id" 
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <PetDossier />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book/:id" 
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <BookingCheckout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Protected Sitter Routes */}
          <Route 
            path="/sitter/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['SITTER']}>
                <SitterDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sitter/availability" 
            element={
              <ProtectedRoute allowedRoles={['SITTER']}>
                <SitterAvailability />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sitter/credentials" 
            element={
              <ProtectedRoute allowedRoles={['SITTER']}>
                <SitterCredentials />
              </ProtectedRoute>
            } 
          />

          {/* Shared Active Care Route (Owner & Sitter) */}
          <Route 
            path="/bookings/:id" 
            element={
              <ProtectedRoute allowedRoles={['OWNER', 'SITTER']}>
                <ActiveCareHub />
              </ProtectedRoute>
            } 
          />

        </Routes>
      </main>
    </div>
  );
};