
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Department from "./components/Department";
import Teachers from "./components/Teachers";
import Courses from "./components/Courses";
import Room from "./components/Room";
import TimeSlots from "./components/TimeSlots";
import Dashboard from "./components/Dashboard";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

// Import the new components
import AcademicSessions from "./components/AcademicSessions";
import ClassSections from "./components/ClassSections";
import TeacherAssignments from "./components/TeacherAssignments";
import Students from "./components/Students";
import ScheduleViewer from "./components/ScheduleViewer";

// Import the NEW components we created
import Programs from "./components/ProgramList";
import CourseOfferings from "./components/CourseOfferingList";
import ScheduleExceptions from "./components/ScheduleExceptionList";
import GeneratedSchedules from "./components/GeneratedScheduleList";
import MasterTimetableView from "./components/MasterTimetableView";
import BulkImport from "./components/BulkImport";
import DataEntryHub from "./components/DataEntryHub";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Enhanced authentication check
  const checkAuthStatus = () => {
    try {
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      
      console.log('🔐 Auth check - storedUser:', !!storedUser, 'accessToken:', !!accessToken);
      
      if (storedUser && accessToken) {
        const userData = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUser(userData);
        console.log('✅ User authenticated from localStorage:', userData.username);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.log('❌ No authentication data found');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle successful login
  const handleLogin = (userData, tokens = null) => {
    console.log('🔑 Login successful:', userData.username);
    setIsAuthenticated(true);
    setUser(userData);
    
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Store tokens if provided (for JWT auth)
    if (tokens) {
      if (tokens.access) localStorage.setItem('accessToken', tokens.access);
      if (tokens.refresh) localStorage.setItem('refreshToken', tokens.refresh);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call logout endpoint to clear server session
      await fetch('http://localhost:8000/api/auth/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with client-side logout even if API call fails
    } finally {
      // Clear client-side storage
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Update user data (for profile updates, etc.)
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    console.log(children)
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Public Route component (redirect to dashboard if already authenticated)
  const PublicRoute = ({ children }) => {
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  // Loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Show Navbar only when authenticated */}
      {isAuthenticated && (
        <Navbar 
          user={user} 
          onLogout={handleLogout}
          onUpdateUser={updateUser}
        />
      )}
      
      <main className={isAuthenticated ? "min-h-screen bg-gray-50" : ""}>
        <Routes>
          {/* Default route - redirect based on auth status */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/login" replace />
            } 
          />

          {/* Public routes - only accessible when NOT logged in */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginForm onLogin={handleLogin} />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterForm onLogin={handleLogin} />
              </PublicRoute>
            } 
          />

          {/* Protected routes - only accessible when logged in */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard user={user} />
              </ProtectedRoute>
            } 
          />

          {/* Data Entry Hub - Beautiful form interface */}
          <Route 
            path="/data-entry" 
            element={
              <ProtectedRoute>
                <DataEntryHub user={user} />
              </ProtectedRoute>
            } 
          />
          
          {/* Core Academic Routes */}
          <Route 
            path="/sessions" 
            element={
              <ProtectedRoute>
                <AcademicSessions user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sections" 
            element={
              <ProtectedRoute>
                <ClassSections user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assignments" 
            element={
              <ProtectedRoute>
                <TeacherAssignments user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students" 
            element={
              <ProtectedRoute>
                <Students user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/schedule" 
            element={
              <ProtectedRoute>
                <ScheduleViewer user={user} />
              </ProtectedRoute>
            } 
          />

          {/* NEW: Master Timetable Route - Complete Overview */}
          <Route 
            path="/master-timetable" 
            element={
              <ProtectedRoute>
                <MasterTimetableView user={user} />
              </ProtectedRoute>
            } 
          />

          {/* Management Routes */}
          <Route 
            path="/departments" 
            element={
              <ProtectedRoute>
                <Department user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teachers" 
            element={
              <ProtectedRoute>
                <Teachers user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses" 
            element={
              <ProtectedRoute>
                <Courses user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rooms" 
            element={
              <ProtectedRoute>
                <Room user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/time-slots" 
            element={
              <ProtectedRoute>
                <TimeSlots user={user} />
              </ProtectedRoute>
            } 
          />

          {/* NEW: Academic Programs Route */}
          <Route 
            path="/programs" 
            element={
              <ProtectedRoute>
                <Programs user={user} />
              </ProtectedRoute>
            } 
          />

          {/* NEW: Course Offerings Route */}
          <Route 
            path="/course-offerings" 
            element={
              <ProtectedRoute>
                <CourseOfferings user={user} />
              </ProtectedRoute>
            } 
          />

          {/* NEW: Schedule Management Routes */}
          <Route 
            path="/generated-schedules" 
            element={
              <ProtectedRoute>
                <GeneratedSchedules user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/schedule-exceptions" 
            element={
              <ProtectedRoute>
                <ScheduleExceptions user={user} />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route - redirect appropriately */}
          <Route 
            path="*" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } 
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;
