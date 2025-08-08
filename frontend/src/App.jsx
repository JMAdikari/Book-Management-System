import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import BookCatalog from './components/BookCatalog';
import BookSearch from './components/BookSearch';
import BookDetails from './components/BookDetailsModal';
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/catalog" 
            element={
              <ProtectedRoute>
                <BookCatalog />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/search" 
            element={
              <ProtectedRoute>
                <BookSearch />
              </ProtectedRoute>
            } 
          />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div>Welcome to the Dashboard!</div>
            </ProtectedRoute>
          } />
          <Route 
            path="/book/:id" 
            element={
              <ProtectedRoute>
                <BookDetails />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App