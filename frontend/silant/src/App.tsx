import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Logout from './pages/Logout';
import MachineSearch from './pages/MachineSearch';
import ProtectedRoute from './components/ProtectedRoute';
import MachineListPage from './pages/MachineListPage';
import MachineDetailPage from './pages/MachineDetailPage';
import MachineEditPage from './pages/MachineEditPage';
import MachineCreatePage from './pages/MachineCreatePage';
import DictionaryListPage from './pages/DictionaryListPage';
import DictionaryEntryDetail from './pages/DictEntryDetailPage';
import CreateDictionaryEntryPage from './pages/DictEntryCreatePage';
import EditDictionaryEntryPage from './pages/DictEntryEditPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
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
                path="/machine-edit/:id"
                element={
                  <ProtectedRoute requiredGroups={['manager', 'superadmin']}>
                    <MachineEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/machine-create"
                element={
                  <ProtectedRoute requiredGroups={['manager', 'superadmin']}>
                    <MachineCreatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dictionary"
                element={
                  <ProtectedRoute requiredGroups={['manager', 'superadmin']}>
                    <DictionaryListPage />
                  </ProtectedRoute>
                }
              />
              < Route
                path='/dictionary/:id'
                element={
                  <ProtectedRoute requiredGroups={['manager', 'superadmin']}>
                    <DictionaryEntryDetail />
                  </ProtectedRoute>
                }
              />
              < Route
                path='/dictionary-create'
                element={
                  <ProtectedRoute requiredGroups={['manager', 'superadmin']}>
                    <CreateDictionaryEntryPage />
                  </ProtectedRoute>
                }
              />
              < Route
                path='/dictionary-edit/:id'
                element={
                  <ProtectedRoute requiredGroups={['manager', 'superadmin']}>
                    <EditDictionaryEntryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={<Navigate to="/machine-search" />}
              />
              <Route
                path="*"
                element={<div>Страница не найдена</div>}
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
