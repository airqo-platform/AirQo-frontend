import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from 'src/pages/HomePage';
import CommunityPage from './src/pages/Solutions/CommunityPage';
import ResearchPage from 'src/pages/ResearchPage';
import Press from 'src/pages/Press/Press';

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/solutions/research" element={<ResearchPage />} />
            <Route path="/solutions/communities" element={<CommunityPage />} />
            <Route path="/press" element={<Press />} />
        </Routes>

    </Router>
);

export default App;
