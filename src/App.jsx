import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext';
import { AgentProvider } from './contexts/AgentContext';
import RouteTracker from './RouteTracker';
import Dashboard from './Dashboard';
import DashboardHome from './DashboardHome';
import ProblemList from './ProblemList';
import RecommendationPage from './RecommendationPage';
import UserAnalytics from './UserAnalytics';
import AIInterview from './AIInterview';
import AIInterviewSelect from './AIInterviewSelect';
import InfoAIInterview from './InfoAIInterview';
import Login from './Login';
import MySubmissions from './MySubmissions';
import InterviewEvaluation from './InterviewEvaluation';
import ScraperPage from './ScraperPage';
import ScrapperPage from './ScrapperPage';
import LandingPage from './LandingPage';
import ProfilePage from './ProfilePage';
import PublicProfile from './PublicProfile';
import ProjectDetails from './ProjectDetails';
import NotificationCenter from './NotificationCenter';
import Chat from './Chat';
import DSASheets from './DSASheets';
import SheetDetail from './SheetDetail';
import ResumeOptimiser from './ResumeOptimiser';
import JobListing from './JobListing';
import JobApplier from './JobApplier';
import ResumeOptimizerPreview from './previews/ResumeOptimizerPreview';
import DSAPracticePreview from './previews/DSAPracticePreview';

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

// Standalone Tools
import ToolsSandbox from './tools/ToolsSandbox';
import ToolsSQLEditor from './tools/ToolsSQLEditor';
import ToolsGitPlayground from './tools/ToolsGitPlayground';
import ToolsMLSandbox from './tools/ToolsMLSandbox';

// Company Sheets
import GoogleSheet from './companywisesheet/google/GoogleSheet';
import AmazonSheet from './companywisesheet/amazon/AmazonSheet';
import AppleSheet from './companywisesheet/apple/AppleSheet';
import FacebookSheet from './companywisesheet/facebook/FacebookSheet';
import MicrosoftSheet from './companywisesheet/microsoft/MicrosoftSheet';
import NetflixSheet from './companywisesheet/netflix/NetflixSheet';
import UberSheet from './companywisesheet/uber/UberSheet';
import TwitterSheet from './companywisesheet/twitter/TwitterSheet';
import AdobeSheet from './companywisesheet/adobe/AdobeSheet';
import AirbnbSheet from './companywisesheet/airbnb/AirbnbSheet';
import SalesforceSheet from './companywisesheet/salesforce/SalesforceSheet';
import OracleSheet from './companywisesheet/oracle/OracleSheet';
import TeslaSheet from './companywisesheet/tesla/TeslaSheet';
import SpotifySheet from './companywisesheet/spotify/SpotifySheet';
import LinkedInSheet from './companywisesheet/linkedin/LinkedInSheet';
import SnapchatSheet from './companywisesheet/snapchat/SnapchatSheet';
import PalantirSheet from './companywisesheet/palantir/PalantirSheet';
import CoinbaseSheet from './companywisesheet/coinbase/CoinbaseSheet';
import GoldmanSachsSheet from './companywisesheet/goldmansachs/GoldmanSachsSheet';
import JPMorganSheet from './companywisesheet/jpmorgan/JPMorganSheet';

// Components
import SocialShare from './components/SocialShare';
import NotificationPopupManager from './components/NotificationPopupManager';
import NetworkStatusBanner from './components/NetworkStatusBanner';
import TermsAndConditions from './TermsAndConditions';
import FloatingOrb from './components/FloatingOrb';
import NotFound from './NotFound';
import OfflinePage from './components/OfflinePage';
import MaintenancePage from './components/MaintenancePage';
import useMaintenanceMode from './hooks/useMaintenanceMode';
import useIsAdmin from './hooks/useIsAdmin';
import { Toaster } from 'sonner';
import { useLocation } from 'react-router-dom';

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

/**
 * MaintenanceGate
 * — Admins (isAdmin: true OR hardcoded UID) NEVER see any maintenance page.
 * — Checks global maintenance first, then per-page maintenance for the current route.
 * — Must render inside BrowserRouter + AuthProvider.
 */
function MaintenanceGate() {
  const { isActive, message, estimatedEnd, progressPercent, pageMaintenance } = useMaintenanceMode();
  const { isAdmin } = useIsAdmin();
  const location = useLocation();

  // Admins bypass ALL maintenance — strict rule
  if (isAdmin) return null;

  // 1. Global maintenance — entire site is locked
  if (isActive) {
    return <MaintenancePage message={message} estimatedEnd={estimatedEnd} progressPercent={progressPercent} />;
  }

  // 2. Per-page maintenance — check if the current pathname matches any locked page
  const currentPath = location.pathname;
  const pageConfig = pageMaintenance?.[currentPath];
  if (pageConfig?.isActive) {
    return (
      <MaintenancePage
        message={pageConfig.message || `This page (${currentPath}) is temporarily under maintenance.`}
        estimatedEnd={pageConfig.estimatedEnd || null}
        progressPercent={pageConfig.progressPercent ?? 65}
      />
    );
  }

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <AgentProvider>
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          theme="dark" 
          position="bottom-right" 
          richColors 
          closeButton 
          toastOptions={{ 
            style: { fontFamily: "'Inter', sans-serif", border: '1px solid rgba(255,255,255,0.1)' },
            className: 'my-toast-class'
          }} 
        />
        {/* Global route-change tracker — renders nothing, fires analytics on every navigation */}
        <RouteTracker />
        <NotificationPopupManager />
        <NetworkStatusBanner />
        {/* Full-screen offline overlay — appears when internet connection is lost */}
        <OfflinePage />
        {/* Full-screen maintenance overlay — toggled via Firestore config/app.maintenanceMode */}
        <MaintenanceGate />
        <div className="app-root">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/infoaiinterview" element={<InfoAIInterview />} />
            <Route path="/dsaquestion" element={<ProblemList />} />
            <Route path="/recommendation" element={<RecommendationPage />} />
            <Route path="/analytics" element={<UserAnalytics />} />
            <Route path="/aiinterviewselect" element={<AIInterviewSelect />} />
            <Route path="/dsaquestion/:page" element={<ProblemList />} />
            <Route path="/solvingpage/:id" element={<Dashboard />} />
            <Route path="/aiinterview/:id?" element={<AIInterview />} />
            <Route path="/submissions" element={<MySubmissions />} />
            <Route path="/scraper" element={<ScraperPage />} />
            <Route path="/scrapper" element={<ScrapperPage />} />
            <Route path="/evaluation/:interviewId" element={<InterviewEvaluation />} />
            <Route path="/sheets" element={<DSASheets />} />
            <Route path="/sheets/:sheetId" element={<SheetDetail />} />
            <Route path="/resume-optimizer-preview" element={<ResumeOptimizerPreview />} />
          <Route path="/dsa-practice-preview" element={<DSAPracticePreview />} />
            <Route path="/resumeoptimiser" element={<ResumeOptimiser />} />
            <Route path="/joblisting" element={<JobListing />} />
            <Route path="/jobapplier" element={<JobApplier />} />
            
            {/* Company Wise Sheets */}
            <Route path="/company/google/:page?" element={<GoogleSheet />} />
            <Route path="/company/amazon/:page?" element={<AmazonSheet />} />
            <Route path="/company/apple/:page?" element={<AppleSheet />} />
            <Route path="/company/facebook/:page?" element={<FacebookSheet />} />
            <Route path="/company/microsoft/:page?" element={<MicrosoftSheet />} />
            <Route path="/company/netflix/:page?" element={<NetflixSheet />} />
            <Route path="/company/uber/:page?" element={<UberSheet />} />
            <Route path="/company/twitter/:page?" element={<TwitterSheet />} />
            <Route path="/company/adobe/:page?" element={<AdobeSheet />} />
            <Route path="/company/salesforce/:page?" element={<SalesforceSheet />} />
            <Route path="/company/oracle/:page?" element={<OracleSheet />} />
            <Route path="/company/tesla/:page?" element={<TeslaSheet />} />
            <Route path="/company/spotify/:page?" element={<SpotifySheet />} />
            <Route path="/company/linkedin/:page?" element={<LinkedInSheet />} />
            <Route path="/company/snapchat/:page?" element={<SnapchatSheet />} />
            <Route path="/company/palantir/:page?" element={<PalantirSheet />} />
            <Route path="/company/coinbase/:page?" element={<CoinbaseSheet />} />
            <Route path="/company/goldmansachs/:page?" element={<GoldmanSachsSheet />} />
            <Route path="/company/jpmorgan/:page?" element={<JPMorganSheet />} />

            {/* Standalone Tools Routes */}
            <Route path="/tools/codesandbox" element={<ToolsSandbox />} />
            <Route path="/tools/sql-editor" element={<ToolsSQLEditor />} />
            <Route path="/tools/git-playground" element={<ToolsGitPlayground />} />
            <Route path="/tools/ml-sandbox" element={<ToolsMLSandbox />} />

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
            
            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SocialShare />
          <FloatingOrb />
        </div>
      </AuthProvider>
    </BrowserRouter>
    </AgentProvider>
    <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
