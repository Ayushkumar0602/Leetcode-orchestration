import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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

// Course Features
import Courses from './Courses';
import CourseDetail from './CourseDetail';
import LearnCourse from './LearnCourse';
import LearnCourseLecture from './LearnCourseLecture';
import { TelemetryProvider } from './contexts/TelemetryContext';

// System Design Features
import SystemDesignReviseHLD from './SystemDesignReviseHLD';
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

// Components
import SocialShare from './components/SocialShare';
import NotificationPopupManager from './components/NotificationPopupManager';
import TermsAndConditions from './TermsAndConditions';
import FloatingOrb from './components/FloatingOrb';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutes
      gcTime:    1000 * 60 * 10,    // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        {/* Global route-change tracker — renders nothing, fires analytics on every navigation */}
        <RouteTracker />
        <NotificationPopupManager />
        <div className="app-root">
          <Routes>
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
            <Route path="/revise/systemdesign/hld/:topicId" element={<SystemDesignReviseHLD />} />

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
            
            {/* Course Routes */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route path="/learn/:slug" element={<LearnCourse />} />
            <Route path="/learn/:slug/lecture" element={
              <TelemetryProvider>
                <LearnCourseLecture />
              </TelemetryProvider>
            } />
            
            <Route path="/" element={<LandingPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminPortal />
              </AdminRoute>
            } />
          </Routes>
          <SocialShare />
          <FloatingOrb />
        </div>
      </AuthProvider>
    </BrowserRouter>
    <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
