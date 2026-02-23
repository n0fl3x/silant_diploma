import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./routes/login";
import Dashboard from "./routes/Dashboard";
import Logout from "./routes/Logout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import MachineSearch from "./components/MachineSearch";


function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="app">
                    <main className="content">
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/logout" element={<Logout />} />
                            <Route path="/machine-search" element={<MachineSearch />} />
                            <Route path="/" element={<Navigate to="/dashboard" />} />
                        </Routes>
                    </main>
                </div>
            </AuthProvider>
        </Router>
    )
};

export default App;
