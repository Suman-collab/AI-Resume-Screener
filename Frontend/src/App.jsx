import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getAuthHomePath } from './utils/authRoutes';

// Public Pages
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import JobListings from './pages/public/JobListings';
import JobDetails from './pages/public/JobDetails';
import TermsOfService from './pages/public/TermsOfService';
import PrivacyPolicy from './pages/public/PrivacyPolicy';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import ApplyJob from './pages/user/ApplyJob';
import ResumeAnalyzer from './pages/user/ResumeAnalyzer';
import MyApplications from './pages/user/MyApplications';
import ScoreReport from './pages/user/ScoreReport';
import AskDoubt from './pages/user/AskDoubt';

// HR Pages
import HRDashboard from './pages/hr/HRDashboard';
import CreateJob from './pages/hr/CreateJob';
import ManageJobs from './pages/hr/ManageJobs';
import ApplicantsList from './pages/hr/ApplicantsList';
import ResumeRanking from './pages/hr/ResumeRanking';

const PublicRoute = ({ children }) => {
  const { loading, isAuthenticated, isGuest, user } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated && !isGuest) {
    return <Navigate to={getAuthHomePath(user)} replace />;
  }

  return children;
};

const RootRedirect = () => {
  const { loading, isAuthenticated, isGuest, user } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isGuest) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getAuthHomePath(user)} replace />;
};

const ProtectedRoute = ({ children, role, allowGuest = false }) => {
  const { loading, isAuthenticated, isHR, isGuest, user } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'hr' && !isHR) {
    return <Navigate to={getAuthHomePath(user)} replace />;
  }

  if (role === 'user' && isHR) {
    return <Navigate to="/hr/dashboard" replace />;
  }

  if (role === 'user' && isGuest && !allowGuest) {
    return <Navigate to="/user/analyze-resume" replace />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const fullScreenPaths = ['/user/ask-doubt', '/user/analyze-resume'];
  const isFullScreenWorkspace = fullScreenPaths.includes(location.pathname);

  return (
    <div className="relative z-10">
      <Navbar />
      <main
        className={`page-shell ${
          isFullScreenWorkspace
            ? 'min-h-screen px-0 py-0'
            : 'container mx-auto px-3 py-2 sm:px-4 sm:py-3 lg:px-5'
        }`}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route
            path="/login"
            element={(
              <PublicRoute>
                <Login />
              </PublicRoute>
            )}
          />
          <Route
            path="/signup"
            element={(
              <PublicRoute>
                <Signup />
              </PublicRoute>
            )}
          />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/jobs/:jobId" element={<JobDetails />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* User Dashboard Routes */}
          <Route
            path="/user/dashboard"
            element={(
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/user/apply/:jobId"
            element={(
              <ProtectedRoute role="user">
                <ApplyJob />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/user/analyze-resume"
            element={(
              <ProtectedRoute role="user" allowGuest>
                <ResumeAnalyzer />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/user/ask-doubt"
            element={(
              <ProtectedRoute role="user">
                <AskDoubt />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/user/applications"
            element={(
              <ProtectedRoute role="user">
                <MyApplications />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/user/score/:applicationId"
            element={(
              <ProtectedRoute role="user">
                <ScoreReport />
              </ProtectedRoute>
            )}
          />

          {/* HR Dashboard Routes */}
          <Route
            path="/hr/dashboard"
            element={(
              <ProtectedRoute role="hr">
                <HRDashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/hr/create-job"
            element={(
              <ProtectedRoute role="hr">
                <CreateJob />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/hr/manage-jobs"
            element={(
              <ProtectedRoute role="hr">
                <ManageJobs />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/hr/applicants/:jobId"
            element={(
              <ProtectedRoute role="hr">
                <ApplicantsList />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/hr/ranking/:jobId"
            element={(
              <ProtectedRoute role="hr">
                <ResumeRanking />
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="app-shell min-h-screen text-slate-900">
        <div className="app-shell__glow app-shell__glow--one" />
        <div className="app-shell__glow app-shell__glow--two" />
        <div className="app-shell__grid" />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
