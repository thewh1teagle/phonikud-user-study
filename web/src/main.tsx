import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from "react-router";
import { UserProvider } from './contexts/UserContext';
import { SurveyProvider } from './contexts/SurveyContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Welcome from './routes/Welcome';
import Evaluation from './routes/Evaluation';
import ThankYou from './routes/ThankYou';
import Results from './routes/Results';
import Feedbacks from './routes/Feedbacks';
import TestFirebase from './routes/experimental/TestFirebase.tsx'

// Set document direction to RTL for Hebrew
document.documentElement.setAttribute('dir', 'rtl');
document.documentElement.setAttribute('lang', 'he');

createRoot(document.getElementById('root')!).render(
  <UserProvider>
    <SurveyProvider>
      <BrowserRouter basename='/phonikud-user-study/'>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route 
            path="/evaluation" 
            element={
              <ProtectedRoute>
                <Evaluation />
              </ProtectedRoute>
            } 
          />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/results" element={<Results />} />
          <Route path="/feedbacks" element={<Feedbacks />} />
          <Route path="/experimental/test-firebase" element={<TestFirebase />} />
        </Routes>
      </BrowserRouter>
    </SurveyProvider>
  </UserProvider>,
)
