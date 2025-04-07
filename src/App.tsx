import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EventProvider } from './context/EventContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Create from './pages/Create';
import Preview from './pages/Preview';

function App() {
  return (
    <Router>
      <EventProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/preview" element={<Preview />} />
          </Routes>
        </Layout>
      </EventProvider>
    </Router>
  );
}

export default App; 