import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-black text-indigo-600 tracking-tight">PawsOut</Link>
        <div className="hidden md:flex gap-4 text-sm font-bold text-gray-600">
          {user?.role !== 'SITTER' && <Link to="/explore" className="hover:text-indigo-600 transition">Find Sitters</Link>}
          <Link to="/" className="hover:text-indigo-600 transition">How It Works</Link>
          {user?.role === 'OWNER' && <Link to="/my-bookings" className="hover:text-indigo-600 transition">My Bookings</Link>}
        </div>
      </div>
      
      {/* Desktop Menu Controls */}
      <div className="hidden md:flex items-center gap-4 text-sm font-bold">
        {!user ? (
          <>
            <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition">Log In</Link>
            <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Sign Up</Link>
          </>
        ) : (
          <div className="flex items-center gap-4">
            {user.role === 'OWNER' && <Link to="/my-pets" className="text-gray-600 hover:text-indigo-600 transition">My Pets</Link>}
            {user.role === 'SITTER' && <Link to="/sitter/dashboard" className="text-gray-600 hover:text-indigo-600 transition">Dashboard</Link>}
            
            <div className="h-8 w-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black">
              {user.name.charAt(0)}
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition">Sign Out</button>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle Button */}
      <div className="md:hidden flex items-center">
        <button onClick={toggleMobileMenu} className="text-gray-600 hover:text-indigo-600 transition focus:outline-none">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-[65px] left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden flex flex-col p-4 gap-4 text-sm font-bold z-50">
          {user?.role !== 'SITTER' && (
            <Link to="/explore" className="text-gray-600 hover:text-indigo-600 transition" onClick={() => setIsMobileMenuOpen(false)}>Find Sitters</Link>
          )}
          <Link to="/" className="text-gray-600 hover:text-indigo-600 transition" onClick={() => setIsMobileMenuOpen(false)}>How It Works</Link>
          {user?.role === 'OWNER' && (
            <Link to="/my-bookings" className="text-gray-600 hover:text-indigo-600 transition" onClick={() => setIsMobileMenuOpen(false)}>My Bookings</Link>
          )}

          <div className="border-t border-gray-100 my-2"></div>

          {!user ? (
            <div className="flex flex-col gap-3">
              <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-center hover:bg-indigo-700 transition" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {user.role === 'OWNER' && <Link to="/my-pets" className="text-gray-600 hover:text-indigo-600 transition" onClick={() => setIsMobileMenuOpen(false)}>My Pets</Link>}
              {user.role === 'SITTER' && <Link to="/sitter/dashboard" className="text-gray-600 hover:text-indigo-600 transition" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black">
                  {user.name.charAt(0)}
                </div>
                <span className="text-gray-800">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="text-left text-gray-500 hover:text-red-600 transition">Sign Out</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
