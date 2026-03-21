import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RouteTracker from './RouteTracker';
import Dashboard from './Dashboard';
import DashboardHome from './DashboardHome';
import ProblemList from './ProblemList';
import AIInterview from './AIInterview';
import AIInterviewSelect from './AIInterviewSelect';
import InfoAIInterview from './InfoAIInterview';
import Login from './Login';
import MySubmissions from './MySubmissions';
import InterviewEvaluation from './InterviewEvaluation';
import ScraperPage from './ScraperPage';
import LandingPage from './LandingPage';
import ProfilePage from './ProfilePage';
import PublicProfile from './PublicProfile';
import ProjectDetails from './ProjectDetails';
import NotificationCenter from './NotificationCenter';
import Chat from './Chat';

// System Design Features
import SystemDesign from './SystemDesign';
import SystemDesignHLD from './SystemDesignHLD';
import SystemDesignLLD from './SystemDesignLLD';
import AISystemDesignInterview from './AISystemDesignInterview';
import SystemDesignInterview from './SystemDesignInterview';

// Admin Features
import AdminPortal from './admin/AdminPortal';
import AdminRoute from './components/AdminRoute';

// Blog Features
import BlogList from './BlogList';
import BlogPost from './BlogPost';

// Portfolio Feature
import PortfolioLanding from './PortfolioLanding';

// Courses Feature
import CoursesPage from './courses/CoursesPage';
import CourseDetail from './courses/CourseDetail';
import LectureDashboard from './courses/LectureDashboard';

// Components
import SocialShare from './components/SocialShare';
import NotificationPopupManager from './components/NotificationPopupManager';
import TermsAndConditions from './TermsAndConditions';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global route-change tracker — renders nothing, fires analytics on every navigation */}
        <RouteTracker />
        <NotificationPopupManager />
        <div className="app-root">
          <Routes>
            {/* Courses Routes - Moved to top for priority */}
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/courses/:courseId/lecture" element={<LectureDashboard />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/infoaiinterview" element={<InfoAIInterview />} />
            <Route path="/dsaquestion" element={<ProblemList />} />
            <Route path="/aiinterviewselect" element={<AIInterviewSelect />} />
            <Route path="/dsaquestion/:page" element={<ProblemList />} />
            <Route path="/solvingpage/:id" element={<Dashboard />} />
            <Route path="/aiinterview/:id?" element={<AIInterview />} />
            <Route path="/submissions" element={<MySubmissions />} />
            <Route path="/scraper" element={<ScraperPage />} />
            <Route path="/evaluation/:interviewId" element={<InterviewEvaluation />} />

            {/* System Design Routes */}
            <Route path="/systemdesign" element={<SystemDesign />} />
            <Route path="/systemdesign/hld" element={<SystemDesignHLD />} />
            <Route path="/systemdesign/lld" element={<SystemDesignLLD />} />
            <Route path="/aisystemdesigninterview/:id" element={<AISystemDesignInterview />} />
            <Route path="/systemdesigninterview/:id" element={<SystemDesignInterview />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/portfolio" element={<PortfolioLanding />} />
            <Route path="/public/:uid" element={<PublicProfile />} />
            <Route path="/public/:uid/project/:projId" element={<ProjectDetails />} />
            <Route path="/chat" element={<Chat />} />

            {/* Blog Routes */}
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            {/* Terms Route */}
            <Route path="/terms" element={<TermsAndConditions />} />
            
            <Route path="/" element={<LandingPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminPortal />
              </AdminRoute>
            } />
          </Routes>
          <SocialShare />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
