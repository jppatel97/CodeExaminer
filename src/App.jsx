import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherRegister from './pages/TeacherRegister';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CreateExam from './pages/CreateExam';
import EditExam from './pages/EditExam';
import ExamDetails from './pages/ExamDetails';
import ExamResults from './pages/ExamResults';
import ExamSubmissions from './pages/ExamSubmissions';
import TakeExam from './pages/TakeExam';
import CodeEditorPage from './pages/CodeEditorPage';
import RoomSelection from './components/RoomSelection';
import PrivateRoute from './components/PrivateRoute';

function AppContent() {
  const location = useLocation();
  
  // Don't show header on exam pages and editor page
  const hideHeaderPaths = ['/take-exam', '/editor', '/room-selection'];
  const shouldShowHeader = !hideHeaderPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowHeader && <Header />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/teacher-register" element={<TeacherRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Room Selection Route */}
        <Route path="/room-selection" element={<RoomSelection />} />
        
        {/* Collaborative Editor Route */}
        <Route path="/editor" element={<CodeEditorPage />} />
        
        {/* Protected Teacher Routes */}
        <Route 
          path="/teacher" 
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/create-exam" 
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <CreateExam />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/edit-exam/:examId" 
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <EditExam />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/exam-submissions/:examId" 
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <ExamSubmissions />
            </PrivateRoute>
          } 
        />

        {/* Protected Student Routes */}
        <Route 
          path="/student" 
          element={
            <PrivateRoute allowedRoles={['student']}>
              <StudentDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/take-exam/:examId" 
          element={
            <PrivateRoute allowedRoles={['student']}>
              <TakeExam />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/exam-results/:examId" 
          element={
            <PrivateRoute allowedRoles={['student']}>
              <ExamResults />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/exam-details/:examId" 
          element={
            <PrivateRoute allowedRoles={['student']}>
              <ExamDetails />
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App; 