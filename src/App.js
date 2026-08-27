import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Expenses from './components/Dashboard/Expenses';
import PrivateRoute from './components/Layout/PrivateRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import Categories from './components/Dashboard/Categories';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import Goals from './components/Dashboard/Goals';
import Settings from './components/Dashboard/Settings';
import Reports from './components/Dashboard/Reports';
import NotFound from './pages/NotFound';
import AIChat from './components/AI/AIChat';
import { DateRangeProvider } from './context/DateRangeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import './styles/main.css';

function AuthenticatedAIChat() {
  const { currentUser } = useAuth();
  const location = useLocation();
  return currentUser && location.pathname.startsWith('/dashboard') ? <AIChat /> : null;
}

function App() {
  return (
    <Router>
      {/* AuthProvider wraps the entire app to provide authentication context */}
      <AuthProvider>
      <CurrencyProvider>
      <DateRangeProvider>
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
            <Route path="goals" element={<Goals />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* 404 - Catch all route */}
          <Route path="*" element={<NotFound />} />

        </Routes>
        {/* AI chat widget — only mounted when logged in */}
        <AuthenticatedAIChat />
      </DateRangeProvider>
      </CurrencyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
