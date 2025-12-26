// WebSite/src/App.jsx
// Main application component with routing and layout

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { PageLoading } from './components/common/Loading';
import Layout from './components/Layout';

// Lazy load components for better performance
const LandingPage = lazy(() => import('./LandingPage'));
const Login = lazy(() => import('./login/login'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ResumeAnalyzer = lazy(() => import('./components/ResumeAnalyzer'));
const InterviewPractice = lazy(() => import('./components/InterviewPractice'));
const JobSearch = lazy(() => import('./components/JobSearch'));
const QuestionBank = lazy(() => import('./components/QuestionBank'));
const UserProfile = lazy(() => import('./components/UserProfile'));

// Static pages
const AboutUs = lazy(() => import('./footer/AboutUs'));
const Features = lazy(() => import('./footer/Features'));
const Pricing = lazy(() => import('./footer/Pricing'));
const Contact = lazy(() => import('./footer/Contact'));
const PrivacyPolicy = lazy(() => import('./footer/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./footer/TermsOfService'));

function App() {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading screen while checking auth
  if (loading) {
    return <PageLoading />;
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
        } />
        
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } />

        {/* Static Pages */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Protected Routes - Require Authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout>
              <UserProfile />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/resume-analyzer" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout>
              <ResumeAnalyzer />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/interview-practice" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout>
              <InterviewPractice />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/job-search" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout>
              <JobSearch />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/question-bank" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout>
              <QuestionBank />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Fallback - Redirect to home or dashboard */}
        <Route path="*" element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />
        } />
      </Routes>
    </Suspense>
  );
}

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default App;