import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './routes/Login';
import Dashboard from './routes/Dashboard';
import Logout from './routes/Logout';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <main className="content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/logout" element={<Logout />} />
              <Route
                path="/"
                element={<Navigate to="/dashboard" />}
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
