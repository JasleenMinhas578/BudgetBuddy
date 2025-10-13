import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import './styles/main.css';

function App() {
  return (
    <Router>
      {/* AuthProvider wraps the entire app to provide authentication context */}
      
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/" element={<Landing />} />
        </Routes>
      
    </Router>
  );
}

export default App;
