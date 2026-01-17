import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Feed from './components/Feed';
import AnimatedBackground from './components/AnimatedBackground';
import { authService } from './services/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="app">
        <AnimatedBackground />
        <div className="loading-screen">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <AnimatedBackground />
      {isAuthenticated ? (
        <Feed onLogout={handleLogout} currentUser={currentUser} />
      ) : showRegister ? (
        <Register
          onRegister={handleLogin}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      ) : (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setShowRegister(true)}
        />
      )}
    </div>
  );
}

export default App;
