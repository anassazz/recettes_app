import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-red-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
          <ChefHat size={24} />
          <span>404 Recettes</span>
        </Link>

        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <div className="flex items-center space-x-2">
                <User size={20} />
                <span>{currentUser.name}</span>
              </div>
              
              {isAdmin() && (
                <Link to="/admin" className="hover:text-red-200 transition-colors">
                  Admin
                </Link>
              )}
              
              <Link to="/dashboard" className="hover:text-red-200 transition-colors">
                Dashboard
              </Link>
              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 hover:text-red-200 transition-colors"
              >
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-red-200 transition-colors">
                Connexion
              </Link>
              <Link to="/register" className="hover:text-red-200 transition-colors">
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;