import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Expenses from './components/Dashboard/Expenses';
import PrivateRoute from './pages/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import Categories from './components/Dashboard/Categories';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import Reports from './components/Dashboard/Reports';
import NotFound from './pages/NotFound';
import AIChat from './components/AI/AIChat';
import './styles/main.css';

/**
 * Main App Component
 * 
 * This is the root component that sets up:
 * 1. Browser routing with React Router
 * 2. Authentication context provider
 * 3. Route definitions for the entire application
 * 
 * Route Structure:
 * - / (Landing page)
 * - /login (Authentication)
 * - /signup (User registration)
 * - /dashboard/* (Protected routes requiring authentication)
 */

function App() {
  return (
    <Router>
      {/* AuthProvider wraps the entire app to provide authentication context */}
      <AuthProvider>
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

           {/* Protected routes - require authentication */}
           <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}>

            {/* Nested routes within dashboard */}
            <Route index element={<DashboardOverview />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="categories" element={<Categories />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* 404 - Catch all route */}
          <Route path="*" element={<NotFound />} />

        </Routes>
        {/* AI chat widget — visible on all pages when logged in */}
        <AIChat />
      </AuthProvider>
    </Router>
  );
}

export default App;
