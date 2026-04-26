import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { LoginPage } from '@/journeys/Login/LoginPage';
import { AuthCallback } from '@/journeys/Auth/AuthCallback';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Home } from '@/journeys/Home';
import { BankConnectionRoot } from '@/journeys/BankConnection';
import { AssessmentOverview } from '@/journeys/Assessment/screens/overview/Overview';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/bank-connection" element={<BankConnectionRoot />} />
            <Route path="/assessment/:assessmentId" element={<AssessmentOverview />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
