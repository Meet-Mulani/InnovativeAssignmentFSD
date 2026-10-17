import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';


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


const ProtectedRoute = ({ children, allowedRoles }) => { // children here means url, allowedRoles means if a user has the role to see that url 
  const { user, loading } = useContext(AuthContext); //loading mentions if the app is checking the database

  if (loading) return <div className="p-20 text-center">Loading PawsOut...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/explore" replace />; {/*replace helps to reduce loop user tpypes My-bookings but it is redirected to login now if he clicks to back he again gone to my-bookings redirected to login page again*/ }
  {/* However replace just change the history of mybooking with login */ }
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

          {/* Active Care Route (Owner and Sitter) */}
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