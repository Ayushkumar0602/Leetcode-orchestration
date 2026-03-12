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

// System Design Features
import SystemDesign from './SystemDesign';
import SystemDesignHLD from './SystemDesignHLD';
import SystemDesignLLD from './SystemDesignLLD';
import AISystemDesignInterview from './AISystemDesignInterview';
import SystemDesignInterview from './SystemDesignInterview';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global route-change tracker — renders nothing, fires analytics on every navigation */}
        <RouteTracker />
        <div className="app-root">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/infoaiinterview" element={<InfoAIInterview />} />
            <Route path="/dsaquestion" element={<Navigate to="/dashboard" replace />} />
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
            <Route path="/public/:uid" element={<PublicProfile />} />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
