import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Logout from './pages/Logout';
import MachineSearch from './pages/MachineSearch';
import ProtectedRoute from './components/ProtectedRoute';
import MachineListPage from './pages/MachineListPage';
import MachineDetailPage from './pages/MachineDetailPage';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="content">
          <Routes>
            <Route
              path="/login"
              element={<Login />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/logout"
              element={
                <ProtectedRoute>
                  <Logout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/machine-search"
              element={<MachineSearch />}
            />
            <Route
              path="/machine-list"
              element={
                <ProtectedRoute>
                  <MachineListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/machine-detail/:id"
              element={
                <ProtectedRoute>
                  <MachineDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={<Navigate to="/machine-search" />} />
            <Route
              path="*"
              element={<div>Страница не найдена</div>}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
