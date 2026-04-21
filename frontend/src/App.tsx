import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Home } from '@/journeys/Home';
import { BankConnectionRoot } from '@/journeys/BankConnection';
import { AssessmentOverview } from '@/journeys/Assessment/Overview';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bank-connection" element={<BankConnectionRoot />} />
          <Route path="/assessment/:assessmentId" element={<AssessmentOverview />} />
          {/* Add more routes as journeys are built */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
