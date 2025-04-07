import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EventProvider } from './context/EventContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Create from './pages/Create';
import Preview from './pages/Preview';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import UserProfile from './pages/UserProfile';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <EventProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create" element={<Create />} />
              <Route path="/preview" element={<Preview />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Layout>
        </EventProvider>
      </Router>
    </AuthProvider>
  );
};

export default App; 