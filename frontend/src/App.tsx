import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pairing from './pages/Pairing';
import Profile from './pages/Profile';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-pink-600 animate-pulse">Загрузка...</div>
      </div>
    );
  }

  return (
    <Router>
      <AnimatedBackground />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/pairing" element={user && !user.pairedWithId ? <Pairing /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/" element={user ? (user.pairedWithId ? <Dashboard /> : <Navigate to="/pairing" />) : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
