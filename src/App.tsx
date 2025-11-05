import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ConfigPage } from './components/ConfigPage';
import { MainPage } from './components/MainPage';
import { GuestListPage } from './components/GuestListPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/configuration" element={<ConfigPage />} />
          <Route path="/ajouter-invites" element={<MainPage />} />
          <Route path="/liste-invites" element={<GuestListPage />} />
          <Route path="/" element={<ConfigPage />} /> {/* Default route */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
