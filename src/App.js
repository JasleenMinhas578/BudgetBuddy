import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './components/Auth/Signup';
import { AuthProvider } from './context/AuthContext';
import './styles/main.css';

function App() {
  return (
    <Router>
      {/* AuthProvider wraps the entire app to provide authentication context */}
      <AuthProvider>
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
