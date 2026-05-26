import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Register from './Register';
import Sidebar from './Sidebar';
import TasksView from './TasksView';
import UsersView from './UsersView';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user.username);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else if (storedUser || storedToken) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }

    const handleLogoutEvent = () => handleLogout();
    window.addEventListener('logout', handleLogoutEvent);
    return () => window.removeEventListener('logout', handleLogoutEvent);
  }, []);

  const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser('');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    if (authPage === 'register') {
      return (
        <Register
          onRegisterSuccess={() => setAuthPage('login')}
          onSwitchToLogin={() => setAuthPage('login')}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthPage('register')}
      />
    );
  }

  return (
    <div className="flex">
      <Sidebar currentUser={currentUser} onLogout={handleLogout} />
      <main className="flex-1 ml-64 p-6">
        <Routes>
          <Route path="/tasks" element={<TasksView />} />
          <Route path="/users" element={<UsersView />} />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
