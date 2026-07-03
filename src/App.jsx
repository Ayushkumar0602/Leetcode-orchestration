import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext';
import { AgentProvider } from './contexts/AgentContext';
import RouteTracker from './RouteTracker';
const Dashboard = lazy(() => import('./Dashboard'));
import DashboardHome from './DashboardHome';
const ProblemList = lazy(() => import('./ProblemList'));
const RecommendationPage = lazy(() => import('./RecommendationPage'));
const UserAnalytics = lazy(() => import('./UserAnalytics'));
const AIInterview = lazy(() => import('./AIInterview'));
const AIInterviewSelect = lazy(() => import('./AIInterviewSelect'));
const CompanyInterviewSelect = lazy(() => import('./CompanyInterviewSelect'));
const InfoAIInterview = lazy(() => import('./InfoAIInterview'));
import Login from './Login';
const MySubmissions = lazy(() => import('./MySubmissions'));
const InterviewEvaluation = lazy(() => import('./InterviewEvaluation'));
const ScraperPage = lazy(() => import('./ScraperPage'));
const ScrapperPage = lazy(() => import('./ScrapperPage'));
import LandingPage from './LandingPage';
const ProfilePage = lazy(() => import('./ProfilePage'));
const PublicProfile = lazy(() => import('./PublicProfile'));
const ProjectDetails = lazy(() => import('./ProjectDetails'));
const NotificationCenter = lazy(() => import('./NotificationCenter'));
const Chat = lazy(() => import('./Chat'));
const DSASheets = lazy(() => import('./DSASheets'));
const SheetDetail = lazy(() => import('./SheetDetail'));
const ResumeOptimiser = lazy(() => import('./ResumeOptimiser'));
const JobListing = lazy(() => import('./JobListing'));
const JobApplier = lazy(() => import('./JobApplier'));
const ResumeOptimizerPreview = lazy(() => import('./previews/ResumeOptimizerPreview'));
const DSAPracticePreview = lazy(() => import('./previews/DSAPracticePreview'));
const Resolve = lazy(() => import('./Resolve'));
const RoleBasedQuestionSelect = lazy(() => import('./RoleBasedQuestionSelect'));
const RolePageLoader = lazy(() => import('./role-based-question/RolePageLoader'));

// Holistic Interview Experience
const HolisticInterviewSetup = lazy(() => import('./components/interview-journey/HolisticInterviewSetup'));
const JourneyDashboard = lazy(() => import('./components/interview-journey/JourneyDashboard'));
const OASetup = lazy(() => import('./components/interview-journey/rounds/OASetup'));
const OARound = lazy(() => import('./components/interview-journey/rounds/OARound'));
const OAResults = lazy(() => import('./components/interview-journey/rounds/OAResults'));
const HireVueSetup = lazy(() => import('./components/interview-journey/rounds/HireVueSetup'));
const HireVueRound = lazy(() => import('./components/interview-journey/rounds/HireVueRound'));
const HireVueResults = lazy(() => import('./components/interview-journey/rounds/HireVueResults'));
const TR1Setup = lazy(() => import('./components/interview-journey/rounds/TR1Setup'));
const TR1Round = lazy(() => import('./components/interview-journey/rounds/TR1Round'));
const TR1Results = lazy(() => import('./components/interview-journey/rounds/TR1Results'));
// Course Features
const Courses = lazy(() => import('./Courses'));
const CourseDetail = lazy(() => import('./CourseDetail'));
const LearnCourse = lazy(() => import('./LearnCourse'));
const LearnCourseLecture = lazy(() => import('./LearnCourseLecture'));
const BooksPage = lazy(() => import('./BooksPage'));
import { TelemetryProvider } from './contexts/TelemetryContext';


// System Design Features
const SystemDesignReviseHLD = lazy(() => import('./SystemDesignReviseHLD'));
const SystemDesign = lazy(() => import('./SystemDesign'));
const SystemDesignHLD = lazy(() => import('./SystemDesignHLD'));
const SystemDesignLLD = lazy(() => import('./SystemDesignLLD'));
const AISystemDesignInterview = lazy(() => import('./AISystemDesignInterview'));
const SystemDesignInterview = lazy(() => import('./SystemDesignInterview'));
const SystemDesignBookChapter = lazy(() => import('./books/systemdesign/SystemDesignBookChapter'));
const MySQLBookChapter = lazy(() => import('./books/mysql/MySQLBookChapter'));
const DockerBookChapter = lazy(() => import('./books/docker/DockerBookChapter'));
const MLBookChapter = lazy(() => import('./books/ml/MLBookChapter'));
const NetworkingBookChapter = lazy(() => import('./books/networking/NetworkingBookChapter'));


// Admin Features
const AdminPortal = lazy(() => import('./admin/AdminPortal'));
const AdminRoute = lazy(() => import('./components/AdminRoute'));

// Blog Features
const BlogList = lazy(() => import('./BlogList'));
const BlogPost = lazy(() => import('./BlogPost'));

// Portfolio Feature
const PortfolioLanding = lazy(() => import('./PortfolioLanding'));

// Standalone Tools
const ToolsSandbox = lazy(() => import('./tools/ToolsSandbox'));
const ToolsSQLEditor = lazy(() => import('./tools/ToolsSQLEditor'));
const ToolsGitPlayground = lazy(() => import('./tools/ToolsGitPlayground'));
const ToolsMLSandbox = lazy(() => import('./tools/ToolsMLSandbox'));
const ToolsAPITester = lazy(() => import('./tools/ToolsAPITester'));
const ToolsJWTDecoder = lazy(() => import('./tools/ToolsJWTDecoder'));
const ToolsRegexTester = lazy(() => import('./tools/ToolsRegexTester'));
const ToolsJSONFormatter = lazy(() => import('./tools/ToolsJSONFormatter'));
const ToolsBase64 = lazy(() => import('./tools/ToolsBase64'));
const ToolsDataConverter = lazy(() => import('./tools/ToolsDataConverter'));
const ToolsGraphQL = lazy(() => import('./tools/ToolsGraphQL'));
const ToolsAPISniper = lazy(() => import('./tools/ToolsAPISniper'));
const ToolsWebhook = lazy(() => import('./tools/ToolsWebhook'));
const ToolsCORSTester = lazy(() => import('./tools/ToolsCORSTester'));
const ToolsCSPGenerator = lazy(() => import('./tools/ToolsCSPGenerator'));
const ToolsPortChecker = lazy(() => import('./tools/ToolsPortChecker'));
const ToolsMetaPreview = lazy(() => import('./tools/ToolsMetaPreview'));
const ToolsCodeScreenshot = lazy(() => import('./tools/ToolsCodeScreenshot'));
const ToolsDockerCompose = lazy(() => import('./tools/ToolsDockerCompose'));
const ToolsK8sValidator = lazy(() => import('./tools/ToolsK8sValidator'));
const ToolsNginxConfig = lazy(() => import('./tools/ToolsNginxConfig'));
const ToolsLayout = lazy(() => import('./components/ToolsLayout'));
// DSA Notes
const Introduction = lazy(() => import('./dsa/notes/Introduction'));
const BigONotation = lazy(() => import('./dsa/notes/BigONotation'));


// Company Sheets
const GoogleSheet = lazy(() => import('./companywisesheet/google/GoogleSheet'));
const AmazonSheet = lazy(() => import('./companywisesheet/amazon/AmazonSheet'));
const AppleSheet = lazy(() => import('./companywisesheet/apple/AppleSheet'));
const FacebookSheet = lazy(() => import('./companywisesheet/facebook/FacebookSheet'));
const MicrosoftSheet = lazy(() => import('./companywisesheet/microsoft/MicrosoftSheet'));
const NetflixSheet = lazy(() => import('./companywisesheet/netflix/NetflixSheet'));
const UberSheet = lazy(() => import('./companywisesheet/uber/UberSheet'));
const TwitterSheet = lazy(() => import('./companywisesheet/twitter/TwitterSheet'));
const AdobeSheet = lazy(() => import('./companywisesheet/adobe/AdobeSheet'));
const AirbnbSheet = lazy(() => import('./companywisesheet/airbnb/AirbnbSheet'));
const SalesforceSheet = lazy(() => import('./companywisesheet/salesforce/SalesforceSheet'));
const OracleSheet = lazy(() => import('./companywisesheet/oracle/OracleSheet'));
const TeslaSheet = lazy(() => import('./companywisesheet/tesla/TeslaSheet'));
const SpotifySheet = lazy(() => import('./companywisesheet/spotify/SpotifySheet'));
const LinkedInSheet = lazy(() => import('./companywisesheet/linkedin/LinkedInSheet'));
const SnapchatSheet = lazy(() => import('./companywisesheet/snapchat/SnapchatSheet'));
const PalantirSheet = lazy(() => import('./companywisesheet/palantir/PalantirSheet'));
const CoinbaseSheet = lazy(() => import('./companywisesheet/coinbase/CoinbaseSheet'));
const GoldmanSachsSheet = lazy(() => import('./companywisesheet/goldmansachs/GoldmanSachsSheet'));
const JPMorganSheet = lazy(() => import('./companywisesheet/jpmorgan/JPMorganSheet'));

const Top50Interview = lazy(() => import('./Top50Interview'));
const StriverSDESheet = lazy(() => import('./StriverSDESheet'));
const Toughest70Interview = lazy(() => import('./softskills/Toughest70Interview'));
const SoftSkills = lazy(() => import('./softskills/SoftSkills'));

// Top 50 Company Interview Sheets
const GoogleTop50 = lazy(() => import('./top-50/GoogleTop50'));
const AmazonTop50 = lazy(() => import('./top-50/AmazonTop50'));
const AppleTop50 = lazy(() => import('./top-50/AppleTop50'));
const MetaTop50 = lazy(() => import('./top-50/MetaTop50'));
const MicrosoftTop50 = lazy(() => import('./top-50/MicrosoftTop50'));
const NetflixTop50 = lazy(() => import('./top-50/NetflixTop50'));
const UberTop50 = lazy(() => import('./top-50/UberTop50'));
const TwitterTop50 = lazy(() => import('./top-50/TwitterTop50'));
const AdobeTop50 = lazy(() => import('./top-50/AdobeTop50'));
const AirbnbTop50 = lazy(() => import('./top-50/AirbnbTop50'));
const SalesforceTop50 = lazy(() => import('./top-50/SalesforceTop50'));
const OracleTop50 = lazy(() => import('./top-50/OracleTop50'));
const TeslaTop50 = lazy(() => import('./top-50/TeslaTop50'));
const SpotifyTop50 = lazy(() => import('./top-50/SpotifyTop50'));
const LinkedInTop50 = lazy(() => import('./top-50/LinkedInTop50'));
const SnapchatTop50 = lazy(() => import('./top-50/SnapchatTop50'));
const PalantirTop50 = lazy(() => import('./top-50/PalantirTop50'));
const CoinbaseTop50 = lazy(() => import('./top-50/CoinbaseTop50'));
const GoldmanSachsTop50 = lazy(() => import('./top-50/GoldmanSachsTop50'));
const JPMorganTop50 = lazy(() => import('./top-50/JPMorganTop50'));

// Topic Wise Interview Questions
const ArraysAndHashing = lazy(() => import('./topicwise/ArraysAndHashing'));
const TwoPointers = lazy(() => import('./topicwise/TwoPointers'));
const SlidingWindow = lazy(() => import('./topicwise/SlidingWindow'));
const Stack = lazy(() => import('./topicwise/Stack'));
const BinarySearch = lazy(() => import('./topicwise/BinarySearch'));
const LinkedList = lazy(() => import('./topicwise/LinkedList'));
const Trees = lazy(() => import('./topicwise/Trees'));
const Backtracking = lazy(() => import('./topicwise/Backtracking'));
const HeapPriorityQueue = lazy(() => import('./topicwise/HeapPriorityQueue'));
const Tries = lazy(() => import('./topicwise/Tries'));
const Graphs = lazy(() => import('./topicwise/Graphs'));
const DP1D = lazy(() => import('./topicwise/DP1D'));
const DP2D = lazy(() => import('./topicwise/DP2D'));
const Greedy = lazy(() => import('./topicwise/Greedy'));
const Intervals = lazy(() => import('./topicwise/Intervals'));
const MathGeometry = lazy(() => import('./topicwise/MathGeometry'));
const BitManipulation = lazy(() => import('./topicwise/BitManipulation'));

// Components
import SocialShare from './components/SocialShare';
import NotificationPopupManager from './components/NotificationPopupManager';
import NetworkStatusBanner from './components/NetworkStatusBanner';
const TermsAndConditions = lazy(() => import('./TermsAndConditions'));
import FloatingOrb from './components/FloatingOrb';
const NotFound = lazy(() => import('./NotFound'));
import OfflinePage from './components/OfflinePage';
import MaintenancePage from './components/MaintenancePage';
const FAQ = lazy(() => import('./FAQ'));
import useMaintenanceMode from './hooks/useMaintenanceMode';
import useIsAdmin from './hooks/useIsAdmin';
import { Toaster } from 'sonner';
import { useLocation } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutes
      gcTime: 1000 * 60 * 10,    // 10 minutes
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
              <Suspense fallback={<RolePageLoader />}><Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Login />} />
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/infoaiinterview" element={<InfoAIInterview />} />
                <Route path="/dsaquestion" element={<ProblemList />} />
                <Route path="/recommendation" element={<RecommendationPage />} />
                <Route path="/analytics" element={<UserAnalytics />} />
                <Route path="/aiinterviewselect" element={<AIInterviewSelect />} />
                <Route path="/companyinterviewselect" element={<CompanyInterviewSelect />} />
                <Route path="/role-based-question" element={<RoleBasedQuestionSelect />} />
                <Route path="/roles/:category/:role" element={<RolePageLoader />} />
                <Route path="/resolve" element={<Resolve />} />

                {/* Holistic Interview Experience */}
                <Route path="/interview-journey/setup" element={<HolisticInterviewSetup />} />
                <Route path="/interview-journey/:journeyId" element={<JourneyDashboard />} />
                <Route path="/interview-journey/:journeyId/oa-setup" element={<OASetup />} />
                <Route path="/interview-journey/:journeyId/oa-round" element={<OARound />} />
                <Route path="/interview-journey/:journeyId/oa-results" element={<OAResults />} />
                <Route path="/interview-journey/:journeyId/hirevue-setup" element={<HireVueSetup />} />
                <Route path="/interview-journey/:journeyId/hirevue-round" element={<HireVueRound />} />
                <Route path="/interview-journey/:journeyId/hirevue-results" element={<HireVueResults />} />
                <Route path="/interview-journey/:journeyId/tr1-setup" element={<TR1Setup />} />
                <Route path="/interview-journey/:journeyId/tr1-round" element={<TR1Round />} />
                <Route path="/interview-journey/:journeyId/tc1-result" element={<TR1Results />} />
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
                <Route path="/top-50-interview-questions" element={<Top50Interview />} />
                <Route path="/striver-sde-sheet" element={<StriverSDESheet />} />
                <Route path="/70-toughest-interview-questions" element={<Navigate to="/softskills/70-toughest-interview-questions" replace />} />
                <Route path="/softskills" element={<SoftSkills />} />
                <Route path="/softskills/70-toughest-interview-questions" element={<Toughest70Interview />} />

                {/* Top 50 Company Sheets Routes */}
                <Route path="/top-50/google/:page?" element={<GoogleTop50 />} />
                <Route path="/top-50/amazon/:page?" element={<AmazonTop50 />} />
                <Route path="/top-50/apple/:page?" element={<AppleTop50 />} />
                <Route path="/top-50/meta/:page?" element={<MetaTop50 />} />
                <Route path="/top-50/microsoft/:page?" element={<MicrosoftTop50 />} />
                <Route path="/top-50/netflix/:page?" element={<NetflixTop50 />} />
                <Route path="/top-50/uber/:page?" element={<UberTop50 />} />
                <Route path="/top-50/twitter/:page?" element={<TwitterTop50 />} />
                <Route path="/top-50/adobe/:page?" element={<AdobeTop50 />} />
                <Route path="/top-50/airbnb/:page?" element={<AirbnbTop50 />} />
                <Route path="/top-50/salesforce/:page?" element={<SalesforceTop50 />} />
                <Route path="/top-50/oracle/:page?" element={<OracleTop50 />} />
                <Route path="/top-50/tesla/:page?" element={<TeslaTop50 />} />
                <Route path="/top-50/spotify/:page?" element={<SpotifyTop50 />} />
                <Route path="/top-50/linkedin/:page?" element={<LinkedInTop50 />} />
                <Route path="/top-50/snapchat/:page?" element={<SnapchatTop50 />} />
                <Route path="/top-50/palantir/:page?" element={<PalantirTop50 />} />
                <Route path="/top-50/coinbase/:page?" element={<CoinbaseTop50 />} />
                <Route path="/top-50/goldmansachs/:page?" element={<GoldmanSachsTop50 />} />
                <Route path="/top-50/jpmorgan/:page?" element={<JPMorganTop50 />} />

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

                {/* Topic Wise Interview Routes */}
                <Route path="/topicswise/arrays-and-hashing/:page?" element={<ArraysAndHashing />} />
                <Route path="/topicswise/two-pointers/:page?" element={<TwoPointers />} />
                <Route path="/topicswise/sliding-window/:page?" element={<SlidingWindow />} />
                <Route path="/topicswise/stack/:page?" element={<Stack />} />
                <Route path="/topicswise/binary-search/:page?" element={<BinarySearch />} />
                <Route path="/topicswise/linked-list/:page?" element={<LinkedList />} />
                <Route path="/topicswise/trees/:page?" element={<Trees />} />
                <Route path="/topicswise/backtracking/:page?" element={<Backtracking />} />
                <Route path="/topicswise/heap-priority-queue/:page?" element={<HeapPriorityQueue />} />
                <Route path="/topicswise/tries/:page?" element={<Tries />} />
                <Route path="/topicswise/graphs/:page?" element={<Graphs />} />
                <Route path="/topicswise/1d-dp/:page?" element={<DP1D />} />
                <Route path="/topicswise/2d-dp/:page?" element={<DP2D />} />
                <Route path="/topicswise/greedy/:page?" element={<Greedy />} />
                <Route path="/topicswise/intervals/:page?" element={<Intervals />} />
                <Route path="/topicswise/math-geometry/:page?" element={<MathGeometry />} />
                <Route path="/topicswise/bit-manipulation/:page?" element={<BitManipulation />} />

                {/* Standalone Tools Routes */}
                <Route path="/tools/*" element={
                  <ToolsLayout>
                    <Suspense fallback={<RolePageLoader />}><Routes>
                      <Route path="codesandbox" element={<ToolsSandbox />} />
                      <Route path="sql-editor" element={<ToolsSQLEditor />} />
                      <Route path="git-playground" element={<ToolsGitPlayground />} />
                      <Route path="ml-sandbox" element={<ToolsMLSandbox />} />
                      <Route path="api-tester" element={<ToolsAPITester />} />
                      <Route path="jwt-decoder" element={<ToolsJWTDecoder />} />
                      <Route path="regex-tester" element={<ToolsRegexTester />} />
                      <Route path="json-formatter" element={<ToolsJSONFormatter />} />
                      <Route path="base64" element={<ToolsBase64 />} />
                      <Route path="data-converter" element={<ToolsDataConverter />} />
                      <Route path="graphql" element={<ToolsGraphQL />} />
                      <Route path="api-sniper" element={<ToolsAPISniper />} />
                      <Route path="webhook" element={<ToolsWebhook />} />
                      <Route path="cors-tester" element={<ToolsCORSTester />} />
                      <Route path="csp-generator" element={<ToolsCSPGenerator />} />
                      <Route path="port-checker" element={<ToolsPortChecker />} />
                      <Route path="meta-preview" element={<ToolsMetaPreview />} />
                      <Route path="screenshot-generator" element={<ToolsCodeScreenshot />} />
                      <Route path="docker-compose" element={<ToolsDockerCompose />} />
                      <Route path="k8s-validator" element={<ToolsK8sValidator />} />
                      <Route path="nginx-config" element={<ToolsNginxConfig />} />
                    </Routes></Suspense>
                  </ToolsLayout>
                } />

                {/* DSA Notes Routes */}
                <Route path="/dsa/notes/introduction" element={<Introduction />} />
                <Route path="/dsa/notes/big-o-notation" element={<BigONotation />} />


                {/* System Design Routes */}
                <Route path="/systemdesign" element={<SystemDesign />} />
                <Route path="/systemdesign/hld" element={<SystemDesignHLD />} />
                <Route path="/systemdesign/lld" element={<SystemDesignLLD />} />
                <Route path="/aisystemdesigninterview/:id" element={<AISystemDesignInterview />} />
                <Route path="/systemdesigninterview/:id" element={<SystemDesignInterview />} />
                <Route path="/revise/systemdesign/hld/:topicId" element={<SystemDesignReviseHLD />} />
                <Route path="/books/systemdesign/:topicname" element={<SystemDesignBookChapter />} />
                <Route path="/books/mysql/:topicname" element={<MySQLBookChapter />} />
                <Route path="/books/docker/:topicname" element={<DockerBookChapter />} />
                <Route path="/books/ml/:topicname" element={<MLBookChapter />} />
                <Route path="/books/computernetworks/:topicname" element={<NetworkingBookChapter />} />


                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationCenter />} />
                <Route path="/portfolio" element={<PortfolioLanding />} />
                <Route path="/public/:uid" element={<PublicProfile />} />
                <Route path="/public/:uid/project/:projId" element={<ProjectDetails />} />
                <Route path="/chat" element={<Chat />} />

                {/* Blog Routes */}
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogPost />} />

                {/* FAQ Route */}
                <Route path="/faq" element={<FAQ />} />

                {/* Terms Route */}
                <Route path="/terms" element={<TermsAndConditions />} />

                {/* Course Routes */}
                <Route path="/courses" element={<Courses />} />
                <Route path="/books" element={<BooksPage />} />
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
              </Routes></Suspense>
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
