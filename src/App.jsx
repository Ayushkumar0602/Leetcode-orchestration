import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './Dashboard';
import ProblemList from './ProblemList';
import AIInterview from './AIInterview';
import Login from './Login';
import MySubmissions from './MySubmissions';
import InterviewEvaluation from './InterviewEvaluation';
import ScraperPage from './ScraperPage';
import LandingPage from './LandingPage';

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
        <div className="app-root">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dsaquestion" element={<Navigate to="/dsaquestion/1" replace />} />
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

            <Route path="/" element={<LandingPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
